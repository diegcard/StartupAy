import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth'
import { api } from '../../lib/api'
import { Shield, Lock, Mail, AlertCircle } from 'lucide-react'
import { Button } from '../../components/ui/Button'

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors'

export function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { setAuth } = useAuthStore()
  const navigate    = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      setAuth(data.token, data.agent)
      navigate('/tickets')
    } catch {
      setError('Email o contraseña incorrectos. Verifica tus credenciales.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — brand ── */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-shrink-0 flex-col justify-between bg-[#0f1c2e] px-10 py-12">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
          </div>
          <div>
            <p className="text-base font-bold text-white leading-tight">StartupAy</p>
            <p className="text-[10px] text-white/35 uppercase tracking-[0.14em]">Fintech · Colombia</p>
          </div>
        </div>

        {/* Main copy */}
        <div className="space-y-6">
          <div>
            <h1 className="text-[32px] font-bold text-white leading-tight tracking-tight text-balance">
              Centro de Gestión de Soporte
            </h1>
            <p className="mt-3 text-[14px] text-white/50 leading-relaxed">
              Plataforma interna para la clasificación automática, trazabilidad y resolución de tickets de soporte al cliente.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {[
              'Clasificación automática con Gemini AI',
              'SLA en tiempo real por categoría y prioridad',
              'Escalaciones con revisión humana (HITL)',
              'Ingestión vía Web, Email y WhatsApp',
            ].map(f => (
              <div key={f} className="flex items-center gap-2.5 text-[13px] text-white/55">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-[11px] text-white/20">
          © {new Date().getFullYear()} StartupAy · Uso interno exclusivo
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-[360px]">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <p className="text-base font-bold text-slate-900">StartupAy</p>
          </div>

          <div className="mb-7">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Iniciar sesión</h2>
            <p className="text-sm text-slate-500 mt-1">Ingresa con tu cuenta corporativa</p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3.5 py-3 mb-5 text-[13px]">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={`${inputCls} pl-9`}
                  placeholder="usuario@startupay.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`${inputCls} pl-9`}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full mt-2 py-2.5 text-[13px] font-semibold bg-[#1d4ed8] hover:bg-[#1e40af]"
            >
              Ingresar al sistema
            </Button>
          </form>

          <p className="text-center text-[11px] text-slate-400 mt-6">
            Acceso restringido a personal autorizado
          </p>
        </div>
      </div>
    </div>
  )
}
