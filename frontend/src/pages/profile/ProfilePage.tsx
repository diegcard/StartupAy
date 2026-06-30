import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../../store/auth'
import { useTickets } from '../../hooks/useTickets'
import { api } from '../../lib/api'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { inputClass } from '../../components/ui/FormField'
import { PriorityBadge, StatusBadge } from '../../components/ui/Badge'
import { SlaIndicator } from '../../components/ui/SlaIndicator'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  SUPERVISOR: 'Supervisor',
  AGENT: 'Agente de soporte',
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { agent } = useAuthStore()

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwError, setPwError] = useState('')

  const { data } = useTickets({
    assignedTo: agent?.id,
    limit: '10',
    page: '1',
  })
  const myTickets = data?.tickets ?? []

  const initials = agent?.name
    ?.split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase() ?? '?'

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault()
    setPwError('')
    setPwSuccess(false)
    if (newPw !== confirmPw) { setPwError('Las contraseñas no coinciden'); return }
    if (newPw.length < 8) { setPwError('La contraseña debe tener al menos 8 caracteres'); return }
    setPwLoading(true)
    try {
      await api.put(`/agents/${agent?.id}`, { currentPassword: currentPw, password: newPw })
      setPwSuccess(true)
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch {
      setPwError('Contraseña actual incorrecta o error al actualizar')
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">Mi perfil</h1>
        <p className="text-xs text-slate-500 mt-0.5">Gestiona tu información y preferencias de cuenta</p>
      </div>

      {/* Profile header */}
      <Card className="p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 border border-blue-500/30 flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
          {initials}
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">{agent?.name}</h2>
          <p className="text-sm text-slate-500">{agent?.email}</p>
          <span className="mt-1.5 inline-block text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2.5 py-0.5">
            {ROLE_LABELS[agent?.role ?? ''] ?? agent?.role}
          </span>
        </div>
        <div className="ml-auto">
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Activo
          </div>
        </div>
      </Card>

      {/* Change password */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-800">Cambiar contraseña</h3>
        </div>

        {pwSuccess && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg px-3.5 py-2.5 mb-4 text-sm">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            Contraseña actualizada correctamente
          </div>
        )}
        {pwError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3.5 py-2.5 mb-4 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {pwError}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-3 max-w-sm">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Contraseña actual</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPw}
                onChange={e => setCurrentPw(e.target.value)}
                className={`${inputClass} pr-9`}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(v => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Nueva contraseña</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                className={`${inputClass} pr-9`}
                placeholder="Mínimo 8 caracteres"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(v => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Confirmar contraseña</label>
            <input
              type="password"
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              className={inputClass}
              placeholder="Repetir contraseña"
              required
            />
          </div>
          <Button type="submit" loading={pwLoading}>
            <Lock className="w-3.5 h-3.5" />
            Actualizar contraseña
          </Button>
        </form>
      </Card>

      {/* My tickets */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-800">Mis tickets asignados</h3>
          </div>
          <button
            onClick={() => navigate('/tickets')}
            className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
          >
            Ver todos
          </button>
        </div>
        {myTickets.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No tienes tickets asignados actualmente</p>
        ) : (
          <div className="space-y-1">
            {myTickets.map(t => (
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
                <div className="flex items-center gap-3 flex-shrink-0">
                  <SlaIndicator deadline={t.slaDeadline} />
                  <span className="text-[11px] text-slate-400">
                    {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true, locale: es })}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
