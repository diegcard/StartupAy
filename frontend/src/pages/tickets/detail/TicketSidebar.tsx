import { Mail, Phone } from 'lucide-react'
import { Ticket } from '../../../types'
import { Card } from '../../../components/ui/Card'
import { CopyButton } from '../../../components/ui/CopyButton'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface TicketSidebarProps {
  ticket: Ticket
}

interface FieldProps {
  label: string
  value: string
  copyable?: boolean
  href?: string
  mono?: boolean
}

function Field({ label, value, copyable, href, mono }: FieldProps) {
  if (value === '—') {
    return (
      <div>
        <p className="text-[11px] text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-slate-400 mt-0.5 italic">—</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-[11px] text-slate-400 uppercase tracking-wide">{label}</p>
      <div className="flex items-center gap-1 mt-0.5 group">
        {href ? (
          <a
            href={href}
            className={`text-sm text-blue-600 hover:text-blue-800 hover:underline truncate ${mono ? 'font-mono text-xs' : ''}`}
          >
            {value}
          </a>
        ) : (
          <p className={`text-sm text-slate-800 truncate ${mono ? 'font-mono text-xs tabular-nums' : ''}`}>
            {value}
          </p>
        )}
        {copyable && <CopyButton text={value} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
      </div>
    </div>
  )
}

export function TicketSidebar({ ticket }: TicketSidebarProps) {
  const shortId = ticket.id.slice(-8).toUpperCase()

  const fields: FieldProps[] = [
    { label: 'Categoría',      value: ticket.category?.name ?? '—' },
    { label: 'Asignado a',     value: ticket.agent?.name ?? '—' },
    { label: 'Merchant ID',    value: ticket.merchantId ?? '—',    copyable: true, mono: true },
    { label: 'Transaction ID', value: ticket.transactionId ?? '—', copyable: true, mono: true },
    { label: 'Creado',         value: format(new Date(ticket.createdAt), 'd MMM yyyy HH:mm', { locale: es }) },
    ...(ticket.resolvedAt ? [{ label: 'Resuelto', value: format(new Date(ticket.resolvedAt), 'd MMM yyyy HH:mm', { locale: es }) }] : []),
  ]

  return (
    <Card className="p-4 space-y-3.5">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Detalles</h3>
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-slate-400 font-mono tabular-nums">#{shortId}</span>
          <CopyButton text={ticket.id} />
        </div>
      </div>

      {fields.map(f => <Field key={f.label} {...f} />)}

      {(ticket.contactEmail || ticket.contactPhone) && (
        <div className="pt-1 border-t border-slate-100 space-y-2.5">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Contacto</p>
          {ticket.contactEmail && (
            <div className="flex items-start gap-2 group">
              <Mail className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
              <div className="flex items-center gap-1 min-w-0">
                <a
                  href={`mailto:${ticket.contactEmail}`}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline truncate"
                >
                  {ticket.contactEmail}
                </a>
                <CopyButton text={ticket.contactEmail} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            </div>
          )}
          {ticket.contactPhone && (
            <div className="flex items-center gap-2 group">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <div className="flex items-center gap-1">
                <a
                  href={`tel:${ticket.contactPhone}`}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {ticket.contactPhone}
                </a>
                <CopyButton text={ticket.contactPhone} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
