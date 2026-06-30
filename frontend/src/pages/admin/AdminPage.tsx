import { Navigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '../../store/auth'
import { AgentsTab } from './AgentsTab'
import { CategoriesTab } from './CategoriesTab'
import { Users, Tag, Shield } from 'lucide-react'

type Tab = 'agents' | 'categories'

const TABS: { id: Tab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'agents', label: 'Agentes', icon: Users },
  { id: 'categories', label: 'Categorías', icon: Tag },
]

export function AdminPage() {
  const { agent } = useAuthStore()
  const [tab, setTab] = useState<Tab>('agents')

  if (agent?.role !== 'ADMIN') return <Navigate to="/tickets" replace />

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
          <Shield className="w-[18px] h-[18px] text-purple-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Administración</h1>
          <p className="text-xs text-slate-400">Gestión de usuarios, categorías y configuración del sistema</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-slate-100 rounded-xl p-1 w-fit">
        {TABS.map(t => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${active ? 'text-blue-600' : ''}`} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div>
        {tab === 'agents' && <AgentsTab />}
        {tab === 'categories' && <CategoriesTab />}
      </div>
    </div>
  )
}
