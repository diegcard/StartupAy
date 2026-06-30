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
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold tabular-nums ${color}`}>{value}{unit}</span>
            <span className="text-xs text-slate-400 font-medium">meta {target}</span>
          </div>
        </div>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.min(barWidth, 100)}%` }}
        />
      </div>
      <p className="text-[11px] text-slate-400 mt-2">{baseline}</p>
    </Card>
  )
}
