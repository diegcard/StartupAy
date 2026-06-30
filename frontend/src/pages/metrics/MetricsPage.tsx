import { useState } from 'react'
import { TrendingDown, Clock, CheckCircle, AlertCircle, Sparkles, ShieldAlert, Target, Download, Loader2 } from 'lucide-react'
import { useMetrics } from '../../hooks/useMetrics'
import { metricsService } from '../../services/metrics.service'
import { Spinner } from '../../components/ui/Spinner'
import { Card } from '../../components/ui/Card'
import { KpiCard } from './KpiCard'
import { SlaCard } from './SlaCard'
import { CategoryChart } from './CategoryChart'
import { ChannelChart } from './ChannelChart'

function ConfidenceBar({ low, medium, high }: { low: number; medium: number; high: number }) {
  const total = low + medium + high
  if (total === 0) return <p className="text-xs text-slate-400">Sin datos</p>
  const pct = (n: number) => Math.round((n / total) * 100)
  const pLow = pct(low), pMed = pct(medium), pHigh = pct(high)

  return (
    <div className="space-y-1.5">
      <div className="flex h-3 rounded-full overflow-hidden gap-px">
        {pLow > 0 && <div className="bg-red-400" style={{ width: `${pLow}%` }} title={`Baja: ${pLow}%`} />}
        {pMed > 0 && <div className="bg-amber-400" style={{ width: `${pMed}%` }} title={`Media: ${pMed}%`} />}
        {pHigh > 0 && <div className="bg-emerald-400" style={{ width: `${pHigh}%` }} title={`Alta: ${pHigh}%`} />}
      </div>
      <div className="flex gap-4 text-[11px] text-slate-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />&lt;70% ({pLow}%)</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />70–90% ({pMed}%)</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />≥90% ({pHigh}%)</span>
      </div>
    </div>
  )
}

export function MetricsPage() {
  const { data: metrics, isLoading } = useMetrics()
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try { await metricsService.exportCsv() } finally { setExporting(false) }
  }

  if (isLoading || !metrics) return <Spinner text="Cargando métricas..." />

  const slaColor = metrics.slaCompliance >= 90 ? 'text-emerald-600' : metrics.slaCompliance >= 70 ? 'text-yellow-600' : 'text-red-600'
  const slaBarColor = metrics.slaCompliance >= 90 ? 'bg-emerald-500' : metrics.slaCompliance >= 70 ? 'bg-yellow-500' : 'bg-red-500'
  const mttrColor = metrics.avgMttrHours <= 8 ? 'text-emerald-600' : metrics.avgMttrHours <= 18 ? 'text-yellow-600' : 'text-red-600'
  const mttrBarColor = metrics.avgMttrHours <= 8 ? 'bg-emerald-500' : metrics.avgMttrHours <= 18 ? 'bg-yellow-500' : 'bg-red-500'
  const reclassHigh = metrics.reclassificationRate > 20

  const precisionGood = metrics.aiPrecision != null && metrics.aiPrecision >= 85
  const escalationHigh = metrics.escalationRate > 15

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
      <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Métricas de Soporte</h1>
          <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-wide">Actualización cada 30 segundos</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          Exportar CSV
        </button>
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

      {/* AI performance section */}
      <div>
        <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-violet-500" />
          Rendimiento IA
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 space-y-1">
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <Target className="w-3.5 h-3.5" />
              Precisión de categorización
            </div>
            {metrics.aiPrecision != null ? (
              <>
                <p className={`text-2xl font-bold ${precisionGood ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {metrics.aiPrecision}%
                </p>
                <p className="text-xs text-slate-400">Categoría IA confirmada por agente</p>
              </>
            ) : (
              <p className="text-sm text-slate-400 pt-1">Sin datos suficientes</p>
            )}
          </Card>

          <Card className="p-4 space-y-1">
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <ShieldAlert className="w-3.5 h-3.5" />
              Tasa de escalación
            </div>
            <p className={`text-2xl font-bold tabular-nums ${escalationHigh ? 'text-red-600' : 'text-emerald-600'}`}>
              {metrics.escalationRate}%
            </p>
            <p className="text-xs text-slate-400">Tickets derivados a revisión humana</p>
          </Card>

          <Card className="p-4 space-y-1">
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <Sparkles className="w-3.5 h-3.5" />
              Confianza IA promedio
            </div>
            {metrics.avgAiConfidence != null ? (
              <>
                <p className={`text-2xl font-bold tabular-nums ${metrics.avgAiConfidence >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {metrics.avgAiConfidence}%
                </p>
                <p className="text-xs text-slate-400">Sobre todas las clasificaciones</p>
              </>
            ) : (
              <p className="text-sm text-slate-400 pt-1">Sin datos suficientes</p>
            )}
          </Card>
        </div>

        {metrics.confidenceDistribution && (
          <Card className="p-4 mt-4">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Distribución de confianza</p>
            <ConfidenceBar {...metrics.confidenceDistribution} />
          </Card>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <CategoryChart data={metrics.byCategory} />
        <ChannelChart data={metrics.byChannel} />
      </div>
    </div>
  )
}
