import { Check } from 'lucide-react'

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_CLIENT' | 'ESCALATED' | 'RESOLVED' | 'CLOSED'

interface StatusStepperProps {
  status: TicketStatus
}

const MAIN_FLOW: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

const STEP_LABELS: Record<TicketStatus, string> = {
  OPEN:           'Abierto',
  IN_PROGRESS:    'En progreso',
  WAITING_CLIENT: 'Esperando',
  ESCALATED:      'Escalado',
  RESOLVED:       'Resuelto',
  CLOSED:         'Cerrado',
}

const BRANCH_META: Partial<Record<TicketStatus, { label: string; cls: string }>> = {
  WAITING_CLIENT: { label: 'Esperando cliente', cls: 'bg-amber-50 border-amber-200 text-amber-700' },
  ESCALATED:      { label: 'Escalado — revisión humana', cls: 'bg-red-50 border-red-200 text-red-700' },
}

export function StatusStepper({ status }: StatusStepperProps) {
  const isBranch = status === 'WAITING_CLIENT' || status === 'ESCALATED'
  const branchMeta = BRANCH_META[status]

  const activeIndex = MAIN_FLOW.indexOf(isBranch ? 'IN_PROGRESS' : status)

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-0">
        {MAIN_FLOW.map((step, i) => {
          const isPast    = i < activeIndex
          const isCurrent = i === activeIndex && !isBranch

          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors text-[10px] font-bold
                    ${isPast    ? 'bg-blue-600 border-blue-600 text-white' :
                      isCurrent ? 'bg-white border-blue-600 text-blue-600' :
                                  'bg-white border-slate-200 text-slate-400'}
                  `}
                >
                  {isPast ? <Check className="w-3 h-3" strokeWidth={3} /> : i + 1}
                </div>
                <span className={`text-[10px] whitespace-nowrap font-medium leading-none
                  ${isPast    ? 'text-blue-600' :
                    isCurrent ? 'text-slate-900' :
                                'text-slate-400'}
                `}>
                  {STEP_LABELS[step]}
                </span>
              </div>
              {i < MAIN_FLOW.length - 1 && (
                <div className={`h-0.5 flex-1 mb-3.5 mx-1 ${isPast ? 'bg-blue-600' : 'bg-slate-200'}`} />
              )}
            </div>
          )
        })}
      </div>

      {isBranch && branchMeta && (
        <div className={`flex items-center gap-2 text-xs border rounded-lg px-3 py-2 ${branchMeta.cls}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
          {branchMeta.label}
        </div>
      )}
    </div>
  )
}
