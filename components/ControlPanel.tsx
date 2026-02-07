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
    <div className="bg-cream rounded-lg p-4 mx-4 mb-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <label className="text-xs text-gray-600 mb-1 block">Trabajador ID</label>
          <input
            type="text"
            value={workerId}
            onChange={(e) => onWorkerIdChange?.(e.target.value)}
            className="w-full px-3 py-2 rounded border border-gray-300 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
            placeholder="ID del trabajador"
          />
        </div>
      </div>
    </div>
  )
}
