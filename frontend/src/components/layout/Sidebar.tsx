import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Ticket, BarChart2, LogOut, Settings, ShieldAlert } from 'lucide-react'
import { useAuthStore } from '../../store/auth'
import { usePendingEscalations } from '../../hooks/useEscalations'

const navItems = [
  { to: '/tickets',    icon: Ticket,      label: 'Tickets' },
  { to: '/escalations',icon: ShieldAlert, label: 'Escalaciones', roles: ['SUPERVISOR', 'ADMIN'] },
  { to: '/metrics',    icon: BarChart2,   label: 'Métricas',     roles: ['SUPERVISOR', 'ADMIN'] },
  { to: '/admin',      icon: Settings,    label: 'Admin',        roles: ['ADMIN'] },
]

const ROLE_LABELS: Record<string, string> = {
  ADMIN:      'Administrador',
  SUPERVISOR: 'Supervisor',
  AGENT:      'Agente de soporte',
}

export function Sidebar() {
  const { agent, logout } = useAuthStore()
  const { pathname } = useLocation()
  const { data: pending } = usePendingEscalations()
  const pendingCount = (pending ?? []).length
  const visible = navItems.filter(item => !item.roles || item.roles.includes(agent?.role ?? ''))

  const initials = agent?.name
    ?.split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase() ?? '?'

  return (
    <aside className="w-[220px] flex-shrink-0 bg-[#0f1c2e] flex flex-col h-screen select-none">

      {/* ── Brand ── */}
      <div className="px-5 py-[18px] border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
            <LayoutDashboard className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-[13px] font-bold text-white tracking-tight">StartupAy</p>
            <p className="text-[9.5px] text-white/35 uppercase tracking-[0.14em]">Centro de Soporte</p>
          </div>
        </div>
      </div>

      {/* ── Nav label ── */}
      <div className="px-4 pt-5 pb-1.5">
        <p className="text-[9px] font-bold text-white/25 uppercase tracking-[0.14em]">Menú</p>
      </div>

      {/* ── Nav items ── */}
      <nav className="flex-1 px-2.5 pb-4 space-y-px overflow-y-auto sidebar-scroll">
        {visible.map(({ to, icon: Icon, label }) => {
          const active = pathname === to || pathname.startsWith(to + '/')
          return (
            <Link
              key={to}
              to={to}
              className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group ${
                active
                  ? 'bg-white/[0.1] text-white'
                  : 'text-white/50 hover:bg-white/[0.05] hover:text-white/85'
              }`}
            >
              {/* Left accent bar */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] bg-blue-400 rounded-r-full" />
              )}
              <Icon className={`w-[15px] h-[15px] flex-shrink-0 transition-colors ${
                active ? 'text-blue-400' : 'text-white/35 group-hover:text-white/60'
              }`} />
              <span className="flex-1 leading-none">{label}</span>
              {to === '/escalations' && pendingCount > 0 && (
                <span className="text-[10px] font-bold bg-orange-500 text-white rounded-full px-1.5 min-w-[18px] h-[18px] flex items-center justify-center leading-none">
                  {pendingCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* ── User section ── */}
      <div className="border-t border-white/[0.08] p-3">
        {/* Avatar + info */}
        <div className="flex items-center gap-2.5 px-2 py-2 mb-0.5">
          <div className="w-7 h-7 rounded-full bg-blue-600 border border-blue-500/40 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-white truncate leading-tight">{agent?.name}</p>
            <p className="text-[10px] text-white/35 leading-tight truncate">
              {ROLE_LABELS[agent?.role ?? ''] ?? agent?.role}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[12px] text-white/40 hover:bg-red-500/[0.12] hover:text-red-400 transition-all"
        >
          <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
