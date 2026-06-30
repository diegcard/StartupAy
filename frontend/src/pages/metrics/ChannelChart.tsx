import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '../../components/ui/Card'

const COLORS = ['#2563eb', '#059669', '#7c3aed', '#dc2626', '#d97706', '#0891b2']

const TOOLTIP_STYLE = {
  background: '#0f172a',
  border: 'none',
  borderRadius: 8,
  boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
  fontSize: 12,
  color: '#fff',
  padding: '8px 12px',
}

const CHANNEL_LABELS: Record<string, string> = {
  WEB: 'Web',
  EMAIL: 'Email',
  WHATSAPP: 'WhatsApp',
}

interface ChannelChartProps {
  data: { channel: string; count: number }[]
}

export function ChannelChart({ data }: ChannelChartProps) {
  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <Card className="p-5">
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-4">
        Tickets por canal
      </p>

      {data.length === 0 || total === 0 ? (
        <div className="h-[200px] flex items-center justify-center text-sm text-slate-400">
          Sin datos disponibles
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="channel"
                cx="50%"
                cy="50%"
                outerRadius={72}
                innerRadius={38}
                strokeWidth={2}
                stroke="#f1f5f9"
              >
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                itemStyle={{ color: '#94a3b8' }}
                labelStyle={{ color: '#fff', fontWeight: 600 }}
                formatter={(value: number) => [`${value} (${Math.round((value / total) * 100)}%)`, 'Tickets']}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-3">
            {data.map((d, i) => (
              <div key={d.channel} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <span
                  className="w-2 h-2 rounded-sm flex-shrink-0"
                  style={{ background: COLORS[i % COLORS.length] }}
                />
                <span className="font-medium">{CHANNEL_LABELS[d.channel] ?? d.channel}</span>
                <span className="text-slate-400 tabular-nums">
                  {d.count} · {Math.round((d.count / total) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  )
}
