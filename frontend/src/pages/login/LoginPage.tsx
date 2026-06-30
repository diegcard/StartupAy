import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth'
import { api } from '../../lib/api'
import { Eye, EyeOff, AlertCircle, Zap, Shield, Clock } from 'lucide-react'

const inputCls = 'w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all'

const FEATURES = [
  { icon: Zap, label: 'Clasificación automática', desc: 'Gemini AI categoriza tickets al instante' },
  { icon: Clock, label: 'SLA en tiempo real', desc: 'Deadlines dinámicos por categoría y prioridad' },
  { icon: Shield, label: 'Escalación inteligente', desc: 'Revisión humana HITL cuando se requiere' },
]

export function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const { setAuth } = useAuthStore()
  const navigate    = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      setAuth(data.token, data.agent)
      navigate('/')
    } catch {
      setError('Email o contraseña incorrectos. Verifica tus credenciales.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] flex-shrink-0 flex-col relative overflow-hidden"
           style={{ background: 'linear-gradient(160deg, #0a1628 0%, #0f1c2e 45%, #0d1f3c 100%)' }}>

        {/* Glow accents */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-600/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-32 right-0 w-64 h-64 bg-indigo-600/15 rounded-full blur-[60px] pointer-events-none" />

        <div className="relative flex flex-col h-full px-10 py-12">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-white leading-tight">StartupAy</p>
              <p className="text-[10px] text-white/35 uppercase tracking-[0.16em]">Fintech · Colombia</p>
            </div>
          </div>

          {/* Hero copy */}
          <div className="mt-auto mb-10 space-y-5">
            <div>
              <p className="text-[11px] font-bold text-blue-400 uppercase tracking-[0.18em] mb-3">
                Centro de soporte
              </p>
              <h1 className="text-[34px] font-extrabold text-white leading-[1.15] tracking-tight">
                Gestión de tickets<br />
                <span className="text-blue-400">inteligente</span>
              </h1>
              <p className="mt-4 text-[14px] text-white/50 leading-relaxed max-w-[340px]">
                Plataforma interna para clasificación automática, trazabilidad y resolución de tickets de soporte al cliente.
              </p>
            </div>

            {/* Feature cards */}
            <div className="space-y-2.5">
              {FEATURES.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.05] border border-white/[0.07]">
                  <div className="w-7 h-7 rounded-lg bg-blue-600/25 border border-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-white/85">{label}</p>
                    <p className="text-[11px] text-white/40 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-[11px] text-white/20">
            © 2025 StartupAy · Acceso restringido al personal autorizado
          </p>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[380px]">

          {/* Mobile brand */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <p className="text-base font-bold text-slate-900">StartupAy</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Iniciar sesión</h2>
            <p className="text-sm text-slate-500 mt-1.5">Ingresa con tu cuenta corporativa para continuar</p>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3.5 mb-6 text-[13px]">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={inputCls}
                placeholder="usuario@startupay.com"
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`${inputCls} pr-11`}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-[#1d4ed8] hover:bg-[#1e40af] disabled:opacity-60 text-white text-[14px] font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando…
                </>
              ) : (
                'Ingresar al sistema'
              )}
            </button>
          </form>

          <p className="text-center text-[11px] text-slate-400 mt-7 flex items-center justify-center gap-1.5">
            <Shield className="w-3 h-3" />
            Acceso restringido a personal autorizado
          </p>
        </div>
      </div>
    </div>
  )
}
