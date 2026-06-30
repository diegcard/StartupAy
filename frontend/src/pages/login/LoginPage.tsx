import { useState, useEffect, useRef, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth'
import { api } from '../../lib/api'
import {
  Eye, EyeOff, AlertCircle, Shield, ArrowRight,
  Lock, Mail, CheckCircle2, AlertTriangle,
} from 'lucide-react'

// ── helpers ───────────────────────────────────────────────────────────────
const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

type FieldState = 'idle' | 'focus' | 'valid' | 'error'

function fieldBorder(state: FieldState, touched: boolean): string {
  if (!touched) return 'border-white/[0.1] focus-within:border-blue-500/70 focus-within:ring-2 focus-within:ring-blue-500/20'
  switch (state) {
    case 'valid': return 'border-emerald-500/60 ring-2 ring-emerald-500/15'
    case 'error': return 'border-red-500/60 ring-2 ring-red-500/15'
    default:      return 'border-blue-500/70 ring-2 ring-blue-500/20'
  }
}

// ── component ─────────────────────────────────────────────────────────────
export function LoginPage() {
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [showPw,       setShowPw]       = useState(false)
  const [serverError,  setServerError]  = useState('')
  const [loading,      setLoading]      = useState(false)
  const [slowNet,      setSlowNet]      = useState(false)
  const [capsLock,     setCapsLock]     = useState(false)
  const [mounted,      setMounted]      = useState(false)

  // touched tracks whether the user has blurred a field at least once
  const [emailTouched, setEmailTouched] = useState(false)
  const [pwTouched,    setPwTouched]    = useState(false)

  const slowTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { setAuth } = useAuthStore()
  const navigate    = useNavigate()

  // entrance animation
  useEffect(() => { requestAnimationFrame(() => setMounted(true)) }, [])

  // clean up slow-net timer on unmount
  useEffect(() => () => { if (slowTimer.current) clearTimeout(slowTimer.current) }, [])

  // ── derived validation ──────────────────────────────────────────────────
  const emailError = emailTouched && !isValidEmail(email)
    ? (email.trim() === '' ? 'El correo es obligatorio' : 'Ingresa un correo válido')
    : ''
  const emailState: FieldState = !emailTouched ? 'idle'
    : emailError ? 'error'
    : isValidEmail(email) ? 'valid'
    : 'focus'

  const pwError = pwTouched && password.length < 6
    ? (password === '' ? 'La contraseña es obligatoria' : 'Mínimo 6 caracteres')
    : ''
  const pwState: FieldState = !pwTouched ? 'idle'
    : pwError ? 'error'
    : password.length >= 6 ? 'valid'
    : 'focus'

  const canSubmit = isValidEmail(email) && password.length >= 6

  // ── caps lock detection ─────────────────────────────────────────────────
  function handleCapsLock(e: React.KeyboardEvent) {
    setCapsLock(e.getModifierState('CapsLock'))
  }

  // ── submit ──────────────────────────────────────────────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setEmailTouched(true)
    setPwTouched(true)
    if (!canSubmit) return

    setServerError('')
    setLoading(true)
    setSlowNet(false)

    slowTimer.current = setTimeout(() => setSlowNet(true), 4000)

    try {
      const { data } = await api.post('/auth/login', { email, password })
      setAuth(data.token, data.agent)
      navigate('/')
    } catch {
      setServerError('Email o contraseña incorrectos. Verifica tus credenciales.')
    } finally {
      setLoading(false)
      setSlowNet(false)
      if (slowTimer.current) clearTimeout(slowTimer.current)
    }
  }

  // ── render ───────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0a1628 0%, #0f1c2e 50%, #0d1f3c 100%)' }}
    >
      {/* Ambient glows */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-20 w-[400px] h-[400px] bg-indigo-700/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-800/10 rounded-full blur-[150px] pointer-events-none" />

      {/* ── Card — entrance animation ── */}
      <div
        className="relative w-full max-w-[420px] z-10 transition-all duration-500 ease-out"
        style={{
          opacity:    mounted ? 1 : 0,
          transform:  mounted ? 'translateY(0)' : 'translateY(18px)',
        }}
      >
        <div
          className="rounded-2xl p-8 sm:p-10 shadow-2xl border border-white/[0.08]"
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)' }}
        >
          {/* Brand */}
          <div className="flex flex-col items-center mb-10">
            <div
              className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-5"
              style={{ boxShadow: '0 8px 32px rgba(37,99,235,0.50)' }}
            >
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

          {/* Server error */}
          {serverError && (
            <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 mb-6 text-[13px] animate-[fadeIn_0.2s_ease]">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* ── Email ── */}
            <div>
              <label className="block text-[11px] font-semibold text-white/45 mb-2 uppercase tracking-widest">
                Correo electrónico
              </label>
              <div className={`relative flex items-center rounded-xl border transition-all duration-200 ${fieldBorder(emailState, emailTouched)}`}
                   style={{ background: 'rgba(255,255,255,0.06)' }}>
                <Mail className="absolute left-3.5 w-4 h-4 text-white/25 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); if (emailTouched) setEmailTouched(true) }}
                  onBlur={() => setEmailTouched(true)}
                  className="w-full bg-transparent pl-10 pr-9 py-3 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none"
                  placeholder="usuario@startupay.com"
                  required
                  autoComplete="email"
                  autoFocus
                />
                {/* valid / error icon */}
                {emailTouched && (
                  <span className="absolute right-3.5">
                    {emailState === 'valid'
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      : emailState === 'error'
                      ? <AlertCircle className="w-4 h-4 text-red-400" />
                      : null}
                  </span>
                )}
              </div>
              {emailError && (
                <p className="mt-1.5 text-[11px] text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{emailError}
                </p>
              )}
            </div>

            {/* ── Password ── */}
            <div>
              <label className="block text-[11px] font-semibold text-white/45 mb-2 uppercase tracking-widest">
                Contraseña
              </label>
              <div className={`relative flex items-center rounded-xl border transition-all duration-200 ${fieldBorder(pwState, pwTouched)}`}
                   style={{ background: 'rgba(255,255,255,0.06)' }}>
                <Lock className="absolute left-3.5 w-4 h-4 text-white/25 pointer-events-none" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); if (pwTouched) setPwTouched(true) }}
                  onBlur={() => setPwTouched(true)}
                  onKeyDown={handleCapsLock}
                  onKeyUp={handleCapsLock}
                  className="w-full bg-transparent pl-10 pr-10 py-3 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 text-white/30 hover:text-white/60 transition-colors p-0.5"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Caps Lock warning */}
              {capsLock && (
                <p className="mt-1.5 text-[11px] text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />Caps Lock activado — verifica mayúsculas
                </p>
              )}

              {/* Inline password error */}
              {pwError && !capsLock && (
                <p className="mt-1.5 text-[11px] text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{pwError}
                </p>
              )}
            </div>

            {/* ── Submit ── */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full mt-2 py-3.5 px-5 rounded-xl text-[14px] font-bold text-white overflow-hidden transition-all group disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)',
                boxShadow: loading ? 'none' : '0 4px 24px rgba(37,99,235,0.45), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            >
              {/* Hover shimmer */}
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }} />

              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {slowNet ? 'Esto está tardando un poco…' : 'Verificando…'}
                  </>
                ) : (
                  <>
                    Ingresar al sistema
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </span>
            </button>

            {/* Slow network hint (below button) */}
            {slowNet && (
              <p className="text-center text-[11px] text-white/30 -mt-1 animate-[fadeIn_0.3s_ease]">
                La conexión está lenta — espera un momento
              </p>
            )}
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-white/20 mt-6 flex items-center justify-center gap-1.5">
          <Shield className="w-3 h-3" />
          © 2026 StartupAy · Acceso restringido al personal autorizado
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
