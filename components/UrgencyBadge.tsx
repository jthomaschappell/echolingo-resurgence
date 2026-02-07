'use client'

interface UrgencyBadgeProps {
  urgency: 'normal' | 'high'
}

export default function UrgencyBadge({ urgency }: UrgencyBadgeProps) {
  if (urgency === 'normal') return null

  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-stripe-orange/15 text-stripe-orange border border-stripe-orange/20">
      URGENT
    </span>
  )
}
