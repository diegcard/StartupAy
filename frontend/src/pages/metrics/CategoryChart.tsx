import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card } from '../../components/ui/Card'

const TOOLTIP_STYLE = {
  background: '#0f172a',
  border: 'none',
  borderRadius: 8,
  boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
  fontSize: 12,
  color: '#fff',
  padding: '8px 12px',
}

interface CategoryChartProps {
  data: { name: string; count: number }[]
}

export function CategoryChart({ data }: CategoryChartProps) {
  return (
    <Card className="p-5">
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-4">
        Tickets por categoría
      </p>
      {data.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center text-sm text-slate-400">
          Sin datos disponibles
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(160, data.length * 34)}>
          <BarChart data={data} layout="vertical" barCategoryGap="30%">
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              width={120}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              itemStyle={{ color: '#94a3b8' }}
              labelStyle={{ color: '#fff', fontWeight: 600 }}
              cursor={{ fill: 'rgba(148,163,184,0.08)' }}
              formatter={(v: number) => [v, 'Tickets']}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={i === 0 ? '#2563eb' : i === 1 ? '#3b82f6' : `hsl(${215 + i * 15}, 70%, ${55 + i * 3}%)`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}
