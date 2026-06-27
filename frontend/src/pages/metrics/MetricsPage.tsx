import { TrendingDown, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useMetrics } from '../../hooks/useMetrics'
import { Spinner } from '../../components/ui/Spinner'
import { KpiCard } from './KpiCard'
import { SlaCard } from './SlaCard'
import { CategoryChart } from './CategoryChart'
import { ChannelChart } from './ChannelChart'

export function MetricsPage() {
  const { data: metrics, isLoading } = useMetrics()

  if (isLoading || !metrics) return <Spinner text="Cargando métricas..." />

  const slaColor = metrics.slaCompliance >= 90 ? 'text-emerald-600' : metrics.slaCompliance >= 70 ? 'text-yellow-600' : 'text-red-600'
  const slaBarColor = metrics.slaCompliance >= 90 ? 'bg-emerald-500' : metrics.slaCompliance >= 70 ? 'bg-yellow-500' : 'bg-red-500'
  const mttrColor = metrics.avgMttrHours <= 8 ? 'text-emerald-600' : metrics.avgMttrHours <= 18 ? 'text-yellow-600' : 'text-red-600'
  const mttrBarColor = metrics.avgMttrHours <= 8 ? 'bg-emerald-500' : metrics.avgMttrHours <= 18 ? 'bg-yellow-500' : 'bg-red-500'
  const reclassHigh = metrics.reclassificationRate > 20

  const kpis = [
    { label: 'Tickets abiertos', value: metrics.totalOpen, icon: AlertCircle, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', valueColor: 'text-blue-600' },
    { label: 'En progreso', value: metrics.totalInProgress, icon: Clock, iconColor: 'text-indigo-600', iconBg: 'bg-indigo-50', valueColor: 'text-indigo-600' },
    { label: 'Resueltos', value: metrics.totalResolved, icon: CheckCircle, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50', valueColor: 'text-emerald-600' },
    {
      label: 'Reclasificaciones',
      value: `${metrics.reclassificationRate}%`,
      icon: TrendingDown,
      iconColor: reclassHigh ? 'text-red-600' : 'text-emerald-600',
      iconBg: reclassHigh ? 'bg-red-50' : 'bg-emerald-50',
      valueColor: reclassHigh ? 'text-red-600' : 'text-emerald-600',
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Métricas de Soporte</h1>
        <p className="text-sm text-gray-500">Actualización cada 30 segundos</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map(kpi => <KpiCard key={kpi.label} {...kpi} />)}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SlaCard
          title="Cumplimiento SLA"
          value={`${metrics.slaCompliance}`}
          unit="%"
          target="90%"
          baseline="Baseline: 62% → Objetivo: >90%"
          color={slaColor}
          barColor={slaBarColor}
          barWidth={metrics.slaCompliance}
        />
        <SlaCard
          title="MTTR Promedio"
          value={`${metrics.avgMttrHours}`}
          unit="h"
          target="<8h"
          baseline="Baseline: 18h → Objetivo: <8h"
          color={mttrColor}
          barColor={mttrBarColor}
          barWidth={Math.min((metrics.avgMttrHours / 24) * 100, 100)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <CategoryChart data={metrics.byCategory} />
        <ChannelChart data={metrics.byChannel} />
      </div>
    </div>
  )
}
