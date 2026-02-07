'use client'

interface UrgencyBadgeProps {
  urgency: 'normal' | 'high'
}

export default function UrgencyBadge({ urgency }: UrgencyBadgeProps) {
  if (urgency === 'normal') return null

  return (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-primary-orange text-white">
      URGENTE
    </span>
  )
}
