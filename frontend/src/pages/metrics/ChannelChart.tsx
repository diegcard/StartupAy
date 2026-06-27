import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '../../components/ui/Card'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

interface ChannelChartProps {
  data: { channel: string; count: number }[]
}

export function ChannelChart({ data }: ChannelChartProps) {
  return (
    <Card className="p-5">
      <p className="text-sm font-semibold text-gray-900 mb-4">Tickets por canal</p>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="channel"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ channel, percent }) => `${channel} ${Math.round(percent * 100)}%`}
            labelLine={false}
          >
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  )
}
