import { useNavigate } from 'react-router-dom'
import { AlertCircle, Clock, CheckCircle, TrendingUp, ShieldAlert, Users, ArrowRight } from 'lucide-react'
import { useMetrics } from '../../hooks/useMetrics'
import { useTickets } from '../../hooks/useTickets'
import { useAgents } from '../../hooks/useAgents'
import { useAuthStore } from '../../store/auth'
import { Card } from '../../components/ui/Card'
import { PriorityBadge, StatusBadge } from '../../components/ui/Badge'
import { SlaIndicator } from '../../components/ui/SlaIndicator'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export function DashboardPage() {
  const navigate = useNavigate()
  const { agent } = useAuthStore()
  const isSupervisor = agent?.role === 'SUPERVISOR' || agent?.role === 'ADMIN'

  const { data: metrics } = useMetrics()
  const { data: criticalData } = useTickets({ priority: 'CRITICAL', status: 'OPEN', limit: '5', page: '1' })
  const { data: inProgressData } = useTickets({ status: 'IN_PROGRESS', limit: '5', page: '1' })
  const { data: agentsData } = useAgents()

  const criticalTickets = criticalData?.tickets ?? []
  const inProgress = inProgressData?.tickets ?? []
  const agents = agentsData ?? []

  const kpis = [
    {
      label: 'Abiertos',
      value: metrics?.totalOpen ?? '—',
      icon: AlertCircle,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'En progreso',
      value: metrics?.totalInProgress ?? '—',
      icon: Clock,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Resueltos',
      value: metrics?.totalResolved ?? '—',
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'SLA cumplimiento',
      value: metrics ? `${metrics.slaCompliance}%` : '—',
      icon: TrendingUp,
      color: metrics && metrics.slaCompliance >= 90 ? 'text-emerald-600' : 'text-amber-600',
      bg: metrics && metrics.slaCompliance >= 90 ? 'bg-emerald-50' : 'bg-amber-50',
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">
          Bienvenido, {agent?.name?.split(' ')[0]}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Resumen del estado actual del soporte</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <Card key={kpi.label} className="p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center flex-shrink-0`}>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold tabular-nums ${kpi.color}`}>{kpi.value}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{kpi.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Critical tickets */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <h2 className="text-sm font-semibold text-slate-800">Tickets críticos abiertos</h2>
            </div>
            <button
              onClick={() => navigate('/tickets?priority=CRITICAL')}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
            >
              Ver todos <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {criticalTickets.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No hay tickets críticos abiertos</p>
          ) : (
            <div className="space-y-2">
              {criticalTickets.map(t => (
                <button
                  key={t.id}
                  onClick={() => navigate(`/tickets/${t.id}`)}
                  className="w-full text-left flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{t.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {t.agent?.name ?? 'Sin asignar'} · {t.category?.name ?? 'Sin categoría'}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <SlaIndicator deadline={t.slaDeadline} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* In progress */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <h2 className="text-sm font-semibold text-slate-800">En progreso recientes</h2>
            </div>
            <button
              onClick={() => navigate('/tickets?status=IN_PROGRESS')}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
            >
              Ver todos <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {inProgress.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No hay tickets en progreso</p>
          ) : (
            <div className="space-y-2">
              {inProgress.map(t => (
                <button
                  key={t.id}
                  onClick={() => navigate(`/tickets/${t.id}`)}
                  className="w-full text-left flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{t.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <StatusBadge status={t.status} />
                      <PriorityBadge priority={t.priority} />
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 flex-shrink-0">
                    {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true, locale: es })}
                  </span>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Agent load panel - SUPERVISOR/ADMIN only */}
      {isSupervisor && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-800">Carga de agentes</h2>
          </div>
          {agents.filter(a => a.role === 'AGENT' || a.role === 'SUPERVISOR').length === 0 ? (
            <p className="text-xs text-slate-400">No hay agentes disponibles</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {agents.filter(a => a.role === 'AGENT' || a.role === 'SUPERVISOR').map(a => {
                const load = a.activeTickets ?? 0
                const max = a.maxCapacity ?? 10
                const pct = Math.min(Math.round((load / max) * 100), 100)
                const barColor = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                return (
                  <div key={a.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${a.isAvailable ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                      <p className="text-xs font-medium text-slate-700 truncate">{a.name}</p>
                    </div>
                    <div className="flex items-baseline gap-1 mb-1.5">
                      <span className="text-sm font-bold text-slate-800 tabular-nums">{load}</span>
                      <span className="text-[11px] text-slate-400">/ {max} tickets</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
