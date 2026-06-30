import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Toaster } from '../ui/Toaster'
import { CommandPalette } from '../ui/CommandPalette'
import { useCommandPaletteStore } from '../../store/commandPalette'
import { useTicketEvents } from '../../hooks/useTicketEvents'

function GlobalShortcuts() {
  const open = useCommandPaletteStore(s => s.open)
  useTicketEvents()

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        open()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  return null
}

export function Layout() {
  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      <Toaster />
      <CommandPalette />
      <GlobalShortcuts />
    </div>
  )
}
