import { useState } from 'react'
import { Agent } from '../../types'
import { useAgents, useCreateAgent, useUpdateAgent } from '../../hooks/useAgents'
import { useCategories } from '../../hooks/useCategories'
import { AgentModal } from './AgentModal'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { Plus, Edit2, PowerOff, CheckCircle, Users } from 'lucide-react'

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  SUPERVISOR: 'Supervisor',
  AGENT: 'Agente',
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  SUPERVISOR: 'bg-blue-100 text-blue-700',
  AGENT: 'bg-slate-100 text-slate-700',
}

export function AgentsTab() {
  const { data: agents, isLoading } = useAgents()
  const { data: categories = [] } = useCategories()
  const createAgent = useCreateAgent()
  const updateAgent = useUpdateAgent()

  const [modal, setModal] = useState<{ open: boolean; agent?: Agent | null }>({ open: false })

  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>

  const handleCreate = async (payload: any) => {
    await createAgent.mutateAsync(payload)
    setModal({ open: false })
  }

  const handleUpdate = async (payload: any) => {
    if (!modal.agent) return
    await updateAgent.mutateAsync({ id: modal.agent.id, payload })
    setModal({ open: false })
  }

  const handleToggle = async (agent: Agent) => {
    await updateAgent.mutateAsync({ id: agent.id, payload: { isAvailable: !agent.isAvailable } })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-500">{agents?.length ?? 0} agentes registrados</span>
        </div>
        <Button size="sm" onClick={() => setModal({ open: true, agent: null })}>
          <Plus className="w-3.5 h-3.5" />
          Nuevo agente
        </Button>
      </div>

      <div className="space-y-2">
        {agents?.map(agent => (
          <div key={agent.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 flex-shrink-0">
              {agent.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-900 truncate">{agent.name}</p>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${ROLE_COLORS[agent.role]}`}>
                  {ROLE_LABELS[agent.role]}
                </span>
                {!agent.isAvailable && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">Inactivo</span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate">{agent.email}</p>
            </div>

            {/* Load */}
            <div className="text-right flex-shrink-0 hidden sm:block">
              <p className="text-xs font-semibold text-slate-700">{agent.activeTickets ?? 0} / {agent.maxCapacity}</p>
              <p className="text-[10px] text-slate-400">tickets activos</p>
            </div>

            {/* Load bar */}
            <div className="w-20 hidden md:block">
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    (agent.loadRatio ?? 0) >= 0.9 ? 'bg-red-500' :
                    (agent.loadRatio ?? 0) >= 0.7 ? 'bg-orange-400' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, (agent.loadRatio ?? 0) * 100)}%` }}
                />
              </div>
            </div>

            {/* Skills */}
            <div className="hidden lg:flex flex-wrap gap-1 max-w-[140px]">
              {agent.skills?.slice(0, 2).map(s => (
                <span key={s.category.id} className="text-[10px] bg-slate-50 border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded-full">
                  {s.category.name}
                </span>
              ))}
              {(agent.skills?.length ?? 0) > 2 && (
                <span className="text-[10px] text-slate-400">+{(agent.skills?.length ?? 0) - 2}</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setModal({ open: true, agent })}
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="Editar"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleToggle(agent)}
                className={`p-1.5 rounded-lg transition-colors ${
                  agent.isAvailable
                    ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                    : 'text-green-600 hover:bg-green-50'
                }`}
                title={agent.isAvailable ? 'Desactivar' : 'Activar'}
              >
                {agent.isAvailable ? <PowerOff className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        ))}

        {!agents?.length && (
          <div className="text-center py-12 text-slate-400">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No hay agentes registrados</p>
          </div>
        )}
      </div>

      {modal.open && (
        <AgentModal
          agent={modal.agent}
          categories={categories}
          onClose={() => setModal({ open: false })}
          onSubmit={modal.agent ? handleUpdate : handleCreate}
          loading={createAgent.isPending || updateAgent.isPending}
        />
      )}
    </div>
  )
}
