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
      <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center mb-3`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </Card>
  )
}
