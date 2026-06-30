import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl shadow-[0_1px_3px_0_rgb(0_0_0/0.05),0_1px_2px_-1px_rgb(0_0_0/0.04)] ${className}`}>
      {children}
    </div>
  )
}
