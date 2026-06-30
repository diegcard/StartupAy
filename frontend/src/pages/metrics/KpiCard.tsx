import { ElementType } from 'react'
import { Card } from '../../components/ui/Card'

interface KpiCardProps {
  label: string
  value: string | number
  icon: ElementType
  iconColor: string
  iconBg: string
  valueColor: string
}

export function KpiCard({ label, value, icon: Icon, iconColor, iconBg, valueColor }: KpiCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <div className={`w-7 h-7 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        </div>
      </div>
      <p className={`text-[28px] font-bold leading-none tabular-nums ${valueColor}`}>{value}</p>
    </Card>
  )
}
