import { Card } from '../../components/ui/Card'

interface SlaCardProps {
  title: string
  value: string
  unit: string
  target: string
  baseline: string
  color: string
  barColor: string
  barWidth: number
}

export function SlaCard({ title, value, unit, target, baseline, color, barColor, barWidth }: SlaCardProps) {
  return (
    <Card className="p-5">
      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{title}</p>
      <div className="flex items-end gap-2 mb-3">
        <p className={`text-4xl font-bold ${color}`}>{value}{unit}</p>
        <p className="text-sm text-gray-400 pb-1">meta: {target}</p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${barColor}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-2">{baseline}</p>
    </Card>
  )
}
