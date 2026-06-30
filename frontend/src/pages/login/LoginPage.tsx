import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth'
import { api } from '../../lib/api'
import { Eye, EyeOff, AlertCircle, Shield, ArrowRight, Lock, Mail } from 'lucide-react'

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
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0a1628 0%, #0f1c2e 50%, #0d1f3c 100%)' }}
    >
      {/* Ambient glows */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-20 w-[400px] h-[400px] bg-indigo-700/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-800/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Card */}
      <div className="relative w-full max-w-[420px] z-10">

        {/* Glass card */}
        <div
          className="rounded-2xl p-8 sm:p-10 shadow-2xl border border-white/[0.08]"
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)' }}
        >
          {/* Brand */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/40 mb-5">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-[22px] font-extrabold text-white tracking-tight leading-tight text-center">
              StartupAy
            </h1>
            <p className="text-[12px] text-white/35 uppercase tracking-[0.18em] mt-1">
              Centro de Soporte · Fintech
            </p>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h2 className="text-[18px] font-bold text-white/90">Iniciar sesión</h2>
            <p className="text-[13px] text-white/40 mt-1">Ingresa con tu cuenta corporativa</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 mb-6 text-[13px]">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-[11px] font-semibold text-white/45 mb-2 uppercase tracking-widest">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-white/25 border border-white/[0.1] focus:outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                  placeholder="usuario@startupay.com"
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-semibold text-white/45 mb-2 uppercase tracking-widest">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-white placeholder-white/25 border border-white/[0.1] focus:outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors p-0.5"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full mt-2 py-3.5 px-5 rounded-xl text-[14px] font-bold text-white overflow-hidden transition-all group disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: loading
                  ? 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)'
                  : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)',
                boxShadow: loading ? 'none' : '0 4px 24px rgba(37,99,235,0.45), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            >
              {/* Hover shimmer */}
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }} />

              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verificando…
                  </>
                ) : (
                  <>
                    Ingresar al sistema
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-white/20 mt-6 flex items-center justify-center gap-1.5">
          <Shield className="w-3 h-3" />
          © 2026 StartupAy · Acceso restringido al personal autorizado
        </p>
      </div>
    </div>
  )
}
