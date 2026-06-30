import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTicket, useUpdateTicket, useClassifyTicket } from '../../../hooks/useTicket'
import { useResolveEscalation } from '../../../hooks/useEscalations'
import { useAuthStore } from '../../../store/auth'
import { useTicketNavStore } from '../../../store/ticketNav'
import { TicketInfo } from './TicketInfo'
import { AiBanner } from './AiBanner'
import { TicketHistory } from './TicketHistory'
import { TicketSidebar } from './TicketSidebar'
import { UpdateTicketForm } from './UpdateTicketForm'
import { EscalationPanel } from './EscalationPanel'

function DetailSkeleton() {
  return (
    <div className="p-6 max-w-4xl mx-auto animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-4 w-24 bg-slate-200 rounded" />
        <div className="flex gap-2">
          <div className="h-7 w-20 bg-slate-100 rounded-lg" />
          <div className="h-4 w-12 bg-slate-100 rounded self-center" />
          <div className="h-7 w-24 bg-slate-100 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="h-5 bg-slate-200 rounded w-2/3" />
            <div className="flex gap-2">
              <div className="h-2 bg-slate-200 rounded-full flex-1" />
              <div className="h-2 bg-slate-100 rounded-full flex-1" />
              <div className="h-2 bg-slate-100 rounded-full flex-1" />
              <div className="h-2 bg-slate-100 rounded-full flex-1" />
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="h-3 bg-slate-100 rounded w-full" />
              <div className="h-3 bg-slate-100 rounded w-5/6" />
              <div className="h-3 bg-slate-100 rounded w-3/4" />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 h-16" />
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 h-52" />
          <div className="bg-white rounded-xl border border-slate-200 p-4 h-40" />
        </div>
      </div>
    </div>
  )
}

export function TicketDetailPage() {
  const { id }    = useParams<{ id: string }>()
  const navigate  = useNavigate()
  const { agent } = useAuthStore()
  const { ids: navIds } = useTicketNavStore()

  const { data: ticket, isLoading, isError } = useTicket(id!)
  const updateMutation   = useUpdateTicket(id!)
  const classifyMutation = useClassifyTicket(id!)
  const resolveEscalation = useResolveEscalation(id!)

  const currentIndex = navIds.indexOf(id!)
  const prevId = currentIndex > 0 ? navIds[currentIndex - 1] : null
  const nextId = currentIndex < navIds.length - 1 ? navIds[currentIndex + 1] : null

  const canUpdate =
    agent?.role === 'SUPERVISOR' ||
    agent?.role === 'ADMIN' ||
    ticket?.assignedTo === agent?.id

  const canResolveEscalation =
    agent?.role === 'SUPERVISOR' || agent?.role === 'ADMIN'

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return
      if (e.key === 'Escape')     navigate('/tickets')
      if (e.key === 'ArrowLeft'  && prevId) navigate(`/tickets/${prevId}`)
      if (e.key === 'ArrowRight' && nextId) navigate(`/tickets/${nextId}`)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate, prevId, nextId])

  if (isLoading) return <DetailSkeleton />

  if (isError || !ticket) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/tickets')}
          className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver a tickets
        </button>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
          <p className="text-slate-800 font-semibold">Ticket no encontrado</p>
          <p className="text-sm text-slate-500 mt-1">
            El ticket puede haber sido eliminado o no tienes permisos para verlo.
          </p>
        </div>
      </div>
    )
  }

  const escalations = ticket.escalations ?? []
  const hasNav = navIds.length > 0 && currentIndex !== -1

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/tickets')}
          className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver a tickets
        </button>

        {hasNav && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => prevId && navigate(`/tickets/${prevId}`)}
              disabled={!prevId}
              title="Ticket anterior (←)"
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Anterior
            </button>
            <span className="text-[11px] text-slate-400 tabular-nums px-1 select-none">
              {currentIndex + 1} / {navIds.length}
            </span>
            <button
              onClick={() => nextId && navigate(`/tickets/${nextId}`)}
              disabled={!nextId}
              title="Siguiente ticket (→)"
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white hover:bg-slate-50 transition-colors"
            >
              Siguiente
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <TicketInfo ticket={ticket} />
          <AiBanner
            ticket={ticket}
            onReclassify={() => classifyMutation.mutate()}
            isReclassifying={classifyMutation.isPending}
          />
          {escalations.length > 0 && (
            <EscalationPanel
              escalations={escalations}
              canResolve={canResolveEscalation}
              onResolve={(escId, wasAiCorrect, note, correctCategoryId) =>
                resolveEscalation.mutate({
                  id: escId,
                  payload: { wasAiCorrect, resolutionNote: note || undefined, correctCategoryId },
                })
              }
              isResolving={resolveEscalation.isPending}
            />
          )}
          <TicketHistory history={ticket.history ?? []} />
        </div>

        <div className="space-y-4">
          <TicketSidebar ticket={ticket} />
          {canUpdate && (
            <UpdateTicketForm
              ticket={ticket}
              onUpdate={payload => updateMutation.mutate(payload)}
              isPending={updateMutation.isPending}
            />
          )}
        </div>
      </div>

      {hasNav && (
        <p className="mt-4 text-[11px] text-slate-400 text-right select-none">
          <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono">←</kbd>
          {' / '}
          <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono">→</kbd>
          {' '}navegar{'  ·  '}
          <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono">Esc</kbd>
          {' '}volver
        </p>
      )}
    </div>
  )
}
