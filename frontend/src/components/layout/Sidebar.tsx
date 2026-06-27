import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Ticket, BarChart2, LogOut, Settings } from 'lucide-react'
import { useAuthStore } from '../../store/auth'

const navItems = [
  { to: '/tickets', icon: Ticket, label: 'Tickets' },
  { to: '/metrics', icon: BarChart2, label: 'Métricas', roles: ['SUPERVISOR', 'ADMIN'] },
  { to: '/admin', icon: Settings, label: 'Admin', roles: ['ADMIN'] },
]

export function Sidebar() {
  const { agent, logout } = useAuthStore()
  const { pathname } = useLocation()

  const visible = navItems.filter(item => !item.roles || item.roles.includes(agent?.role ?? ''))

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">StartupAy</p>
            <p className="text-xs text-gray-500">Soporte</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {visible.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname.startsWith(to)
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-200">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs font-semibold text-gray-900 truncate">{agent?.name}</p>
          <p className="text-xs text-gray-500">{agent?.role}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
