import { useNavigate } from 'react-router-dom'
import {
  AlertCircle, Clock, CheckCircle, TrendingUp, ShieldAlert,
  Users, ArrowRight, Plus, PartyPopper, PackageOpen,
} from 'lucide-react'
import { useMetrics } from '../../hooks/useMetrics'
import { useTickets } from '../../hooks/useTickets'
import { useAgents } from '../../hooks/useAgents'
import { useAuthStore } from '../../store/auth'
import { Card } from '../../components/ui/Card'
import { PriorityBadge, StatusBadge } from '../../components/ui/Badge'
import { SlaIndicator } from '../../components/ui/SlaIndicator'
import { formatDistanceToNow, format } from 'date-fns'
import { es } from 'date-fns/locale'

const TODAY = new Date()

function SlaRing({ pct, color }: { pct: number; color: string }) {
  const r = 18
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" className="-rotate-90">
      <circle cx="22" cy="22" r={r} strokeWidth="4" className="stroke-slate-100" fill="none" />
      <circle
        cx="22" cy="22" r={r} strokeWidth="4" fill="none"
        stroke="currentColor" className={color}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
    </svg>
  )
}

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

  const slaOk = metrics ? metrics.slaCompliance >= 90 : null

  const kpis = [
    {
      label: 'Abiertos',
      value: metrics?.totalOpen ?? '—',
      icon: AlertCircle,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      ring: null,
    },
    {
      label: 'En progreso',
      value: metrics?.totalInProgress ?? '—',
      icon: Clock,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
      ring: null,
    },
    {
      label: 'Resueltos',
      value: metrics?.totalResolved ?? '—',
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      ring: null,
    },
    {
      label: 'SLA cumplimiento',
      value: metrics ? `${metrics.slaCompliance}%` : '—',
      icon: TrendingUp,
      color: slaOk === null ? 'text-slate-500' : slaOk ? 'text-emerald-600' : 'text-amber-600',
      bg: slaOk === null ? 'bg-slate-50' : slaOk ? 'bg-emerald-50' : 'bg-amber-50',
      border: slaOk === null ? 'border-slate-100' : slaOk ? 'border-emerald-100' : 'border-amber-100',
      ring: metrics?.slaCompliance ?? null,
      ringColor: slaOk ? 'text-emerald-500' : 'text-amber-500',
    },
  ]

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Hola, {agent?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 capitalize">
            {format(TODAY, "EEEE d 'de' MMMM · HH:mm", { locale: es })}
          </p>
        </div>
        <button
          onClick={() => navigate('/tickets/new')}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-[13px] font-semibold rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Nuevo ticket
        </button>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <Card key={kpi.label} className={`p-4 border ${kpi.border}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl ${kpi.bg} flex items-center justify-center flex-shrink-0`}>
                  <kpi.icon className={`w-4.5 h-4.5 ${kpi.color}`} />
                </div>
                <div className="min-w-0">
                  <p className={`text-2xl font-bold tabular-nums leading-none ${kpi.color}`}>{kpi.value}</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-tight">{kpi.label}</p>
                </div>
              </div>
              {kpi.ring !== null && (
                <div className="relative flex-shrink-0">
                  <SlaRing pct={kpi.ring as number} color={kpi.ringColor!} />
                  <span className={`absolute inset-0 flex items-center justify-center text-[9px] font-bold ${kpi.color} rotate-90`}>
                    {kpi.ring}%
                  </span>
                </div>
              )}
            </div>
            {kpi.ring !== null && metrics && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>Cumplimiento SLA</span>
                  <span className={`font-semibold ${kpi.color}`}>{metrics.slaCompliance}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${slaOk ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${metrics.slaCompliance}%` }}
                  />
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* ── Ticket panels ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Critical */}
        <Card className={`p-4 border ${criticalTickets.length > 0 ? 'border-red-200 bg-red-50/30' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${criticalTickets.length > 0 ? 'bg-red-100' : 'bg-slate-100'}`}>
                <ShieldAlert className={`w-3.5 h-3.5 ${criticalTickets.length > 0 ? 'text-red-500' : 'text-slate-400'}`} />
              </div>
              <h2 className="text-sm font-semibold text-slate-800">Tickets críticos abiertos</h2>
              {criticalTickets.length > 0 && (
                <span className="text-[10px] font-bold bg-red-500 text-white rounded-full px-1.5 py-0.5 leading-none">
                  {criticalTickets.length}
                </span>
              )}
            </div>
            <button
              onClick={() => navigate('/tickets?priority=CRITICAL')}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
            >
              Ver todos <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {criticalTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-7 gap-2 text-center">
              <PartyPopper className="w-7 h-7 text-emerald-400" />
              <p className="text-xs font-medium text-slate-600">¡Todo bajo control!</p>
              <p className="text-[11px] text-slate-400">No hay tickets críticos abiertos ahora mismo.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {criticalTickets.map(t => (
                <button
                  key={t.id}
                  onClick={() => navigate(`/tickets/${t.id}`)}
                  className="w-full text-left flex items-center gap-3 p-2.5 rounded-lg hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
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
        <Card className="p-4 border border-indigo-100 bg-indigo-50/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <h2 className="text-sm font-semibold text-slate-800">En progreso recientes</h2>
              {inProgress.length > 0 && (
                <span className="text-[10px] font-bold bg-indigo-500 text-white rounded-full px-1.5 py-0.5 leading-none">
                  {inProgress.length}
                </span>
              )}
            </div>
            <button
              onClick={() => navigate('/tickets?status=IN_PROGRESS')}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
            >
              Ver todos <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {inProgress.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-7 gap-2 text-center">
              <PackageOpen className="w-7 h-7 text-slate-300" />
              <p className="text-xs font-medium text-slate-500">Sin tickets en progreso</p>
              <p className="text-[11px] text-slate-400">Cuando se activen, aparecerán aquí.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {inProgress.map(t => (
                <button
                  key={t.id}
                  onClick={() => navigate(`/tickets/${t.id}`)}
                  className="w-full text-left flex items-center gap-3 p-2.5 rounded-lg hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{t.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <StatusBadge status={t.status} />
                      <PriorityBadge priority={t.priority} />
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 flex-shrink-0 whitespace-nowrap">
                    {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true, locale: es })}
                  </span>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── Agent load ── SUPERVISOR/ADMIN only */}
      {isSupervisor && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <h2 className="text-sm font-semibold text-slate-800">Carga de agentes</h2>
            </div>
            <span className="text-[11px] text-slate-400">
              {agents.filter(a => a.role === 'AGENT' || a.role === 'SUPERVISOR').length} agentes
            </span>
          </div>

          {agents.filter(a => a.role === 'AGENT' || a.role === 'SUPERVISOR').length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No hay agentes disponibles</p>
          ) : (
            <div className="space-y-2.5">
              {agents.filter(a => a.role === 'AGENT' || a.role === 'SUPERVISOR').map(a => {
                const load = a.activeTickets ?? 0
                const max = a.maxCapacity ?? 10
                const pct = Math.min(Math.round((load / max) * 100), 100)
                const barColor = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                const textColor = pct >= 90 ? 'text-red-600' : pct >= 70 ? 'text-amber-600' : 'text-emerald-600'
                const dotColor = a.isAvailable ? 'bg-emerald-400 shadow-[0_0_0_2px_#d1fae5]' : 'bg-slate-300'

                return (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-600">
                        {a.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${dotColor}`} />
                    </div>

                    {/* Info + bar */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between mb-1.5 gap-2">
                        <p className="text-xs font-semibold text-slate-700 truncate leading-tight">{a.name}</p>
                        <span className={`text-[11px] font-bold tabular-nums flex-shrink-0 ${textColor}`}>
                          {load}/{max}
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Pct badge */}
                    <span className={`text-[10px] font-bold tabular-nums flex-shrink-0 w-8 text-right ${textColor}`}>
                      {pct}%
                    </span>
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
