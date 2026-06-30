import { useState } from 'react'
import { X, CheckCircle, UserCheck, XCircle } from 'lucide-react'
import { useAgents } from '../../hooks/useAgents'

interface BulkActionBarProps {
  selectedCount: number
  onClear: () => void
  onChangeStatus: (status: string) => void
  onAssign?: (agentId: string) => void
  loading: boolean
}

export function BulkActionBar({ selectedCount, onClear, onChangeStatus, onAssign, loading }: BulkActionBarProps) {
  const { data: agents } = useAgents()
  const [showAssign, setShowAssign] = useState(false)

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#0f1c2e] text-white rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-4 min-w-[480px]">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">{selectedCount} seleccionados</span>
        <button onClick={onClear} className="text-white/50 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-5 bg-white/20" />

      <div className="flex items-center gap-2 flex-1">
        <button
          onClick={() => onChangeStatus('IN_PROGRESS')}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors font-medium disabled:opacity-50"
        >
          <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
          En progreso
        </button>
        <button
          onClick={() => onChangeStatus('RESOLVED')}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors font-medium disabled:opacity-50"
        >
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          Resolver
        </button>
        <button
          onClick={() => onChangeStatus('CLOSED')}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors font-medium disabled:opacity-50"
        >
          <XCircle className="w-3.5 h-3.5 text-slate-400" />
          Cerrar
        </button>

        {onAssign && (
          <div className="relative">
            <button
              onClick={() => setShowAssign(v => !v)}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              <UserCheck className="w-3.5 h-3.5 text-violet-400" />
              Asignar
            </button>
            {showAssign && (
              <div className="absolute bottom-full mb-2 left-0 bg-white rounded-xl shadow-xl border border-slate-200 py-1 min-w-[180px] z-50">
                {agents?.filter(a => a.role !== 'ADMIN').map(a => (
                  <button
                    key={a.id}
                    onClick={() => { onAssign(a.id); setShowAssign(false) }}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {a.name}
                    {a.activeTickets !== undefined && (
                      <span className="text-xs text-slate-400 ml-1">({a.activeTickets} activos)</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
