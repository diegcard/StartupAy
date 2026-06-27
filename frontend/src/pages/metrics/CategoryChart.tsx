import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '../../components/ui/Card'

interface CategoryChartProps {
  data: { name: string; count: number }[]
}

export function CategoryChart({ data }: CategoryChartProps) {
  return (
    <Card className="p-5">
      <p className="text-sm font-semibold text-gray-900 mb-4">Tickets por categoría</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical">
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
          <Tooltip contentStyle={{ fontSize: 12 }} />
          <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
