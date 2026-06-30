import { ButtonHTMLAttributes, ReactNode } from 'react'
import { InlineSpinner } from './Spinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  loading?: boolean
  children: ReactNode
}

const variants = {
  primary:   'bg-blue-600 text-white hover:bg-blue-700 shadow-sm active:bg-blue-800 focus-visible:ring-blue-500',
  secondary: 'border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 focus-visible:ring-slate-400',
  ghost:     'text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-slate-400',
  danger:    'text-red-600 hover:bg-red-50 active:bg-red-100 focus-visible:ring-red-400',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && <InlineSpinner className="w-3.5 h-3.5" />}
      {children}
    </button>
  )
}
