import { Server as SocketIOServer } from 'socket.io'
import { supabase } from '../../lib/supabase'
import { translateEnglishToSpanish } from '../../lib/cerebras'

// Match: APPROVE, APPROVE REQ-abc1, MODIFY 300, MODIFY 300 REQ-abc1, REJECT reason, ASK question
const COMMAND_PATTERN = /^(APPROVE|MODIFY|REJECT|ASK)\s*(.*)/i

interface ApprovalResult {
  handled: boolean
  response?: string
}

function parseRequestId(args: string): { requestId: string | null; rest: string } {
  const reqMatch = args.match(/REQ-([a-f0-9]{4})/i)
  if (reqMatch) {
    const requestId = reqMatch[1].toLowerCase()
    const rest = args.replace(reqMatch[0], '').trim()
    return { requestId, rest }
  }
  return { requestId: null, rest: args.trim() }
}

export async function handleApprovalCommand(
  body: string,
  io: SocketIOServer
): Promise<ApprovalResult> {
  const match = body.trim().match(COMMAND_PATTERN)
  if (!match) {
    return { handled: false }
  }

  const command = match[1].toUpperCase()
  const rawArgs = match[2] || ''
  const { requestId: shortId, rest: args } = parseRequestId(rawArgs)

  console.log('[FLOW][SupplyApproval] Command:', command, 'args:', args, 'requestId:', shortId)

  // Find the supply request
  let query = supabase
    .from('SupplyRequest')
    .select()
    .in('status', ['PENDING', 'QUESTIONED'])
    .order('createdAt', { ascending: false })
    .limit(1)

  const { data: requests, error: queryError } = await query

  if (queryError || !requests || requests.length === 0) {
    console.log('[FLOW][SupplyApproval] No pending supply request found')
    return { handled: true, response: 'No pending supply request found.' }
  }

  // If a short ID was specified, verify it matches
  let request = requests[0]
  if (shortId && !request.id.endsWith(shortId)) {
    // Try finding by the specific ID suffix
    const { data: specific } = await supabase
      .from('SupplyRequest')
      .select()
      .in('status', ['PENDING', 'QUESTIONED'])
      .like('id', `%${shortId}`)
      .limit(1)
      .maybeSingle()

    if (!specific) {
      return { handled: true, response: `No pending request found matching REQ-${shortId}.` }
    }
    request = specific
  }

  const responseTimeMinutes = Math.round(
    (Date.now() - new Date(request.createdAt).getTime()) / 60000
  )

  let status: string
  let updateData: Record<string, unknown>
  let responseMessage: string

  switch (command) {
    case 'APPROVE': {
      status = 'APPROVED'
      updateData = {
        status,
        approvedBy: 'supervisor',
        approvedAt: new Date().toISOString(),
        responseTimeMinutes,
      }
      responseMessage = `Approved: ${request.item} (${request.quantity ?? request.suggestedQuantity ?? '?'} ${request.unit ?? 'pcs'}) from ${request.suggestedSupplier ?? 'supplier'}. Order placed.`
      break
    }

    case 'MODIFY': {
      const newQty = parseInt(args, 10)
      if (isNaN(newQty) || newQty <= 0) {
        return { handled: true, response: 'MODIFY requires a positive number. Example: MODIFY 300' }
      }
      status = 'MODIFIED'
      updateData = {
        status,
        modifiedQuantity: newQty,
        approvedBy: 'supervisor',
        approvedAt: new Date().toISOString(),
        responseTimeMinutes,
      }
      responseMessage = `Modified: ${request.item} quantity changed to ${newQty} ${request.unit ?? 'pcs'}. Order placed.`
      break
    }

    case 'REJECT': {
      status = 'REJECTED'
      updateData = {
        status,
        rejectionReason: args || 'No reason provided',
        responseTimeMinutes,
      }
      responseMessage = `Rejected: ${request.item} request denied. Reason: ${args || 'No reason provided'}`
      break
    }

    case 'ASK': {
      status = 'QUESTIONED'
      updateData = {
        status,
        responseTimeMinutes,
      }
      responseMessage = `Question sent to worker about: ${request.item}. "${args || 'Please clarify.'}"`
      break
    }

    default:
      return { handled: false }
  }

  // Update the supply request
  const { error: updateError } = await supabase
    .from('SupplyRequest')
    .update(updateData)
    .eq('id', request.id)

  if (updateError) {
    console.error('[FLOW][SupplyApproval] Update error:', updateError)
    return { handled: true, response: 'Error updating supply request.' }
  }

  console.log('[FLOW][SupplyApproval] Updated request', request.id, 'to', status)

  // Notify worker via Socket.io
  try {
    // Get the worker ID from the request
    const workerId = request.workerId
    const workerRoom = `worker:${workerId}`

    // Translate the response to Spanish for the worker
    const spanishNotification = await translateEnglishToSpanish(responseMessage)

    io.to(workerRoom).emit('supply-request-update', {
      requestId: request.id,
      status,
      message: responseMessage,
      spanishMessage: spanishNotification,
    })

    console.log('[FLOW][SupplyApproval] Notified worker', workerId, 'of', status)
  } catch (err) {
    console.error('[FLOW][SupplyApproval] Failed to notify worker:', err)
  }

  return { handled: true, response: responseMessage }
}
