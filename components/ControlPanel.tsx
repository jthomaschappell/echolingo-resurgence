'use client'

interface ControlPanelProps {
  workerId: string
  onWorkerIdChange?: (id: string) => void
}

export default function ControlPanel({
  workerId,
  onWorkerIdChange,
}: ControlPanelProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 mb-6 border border-palette-golden/30 shadow-stripe">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <label className="text-xs font-medium text-stripe-muted mb-2 block uppercase tracking-wider">
            Worker ID
          </label>
          <input
            type="text"
            value={workerId}
            onChange={(e) => onWorkerIdChange?.(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-stripe-dark bg-white focus:outline-none focus:ring-2 focus:ring-stripe-primary focus:border-transparent transition-shadow placeholder:text-stripe-muted"
            placeholder="e.g. worker-001"
          />
        </div>
      </div>
    </div>
  )
}
