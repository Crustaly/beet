"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

const data = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1
  return {
    day: `Day ${day}`,
    malaria: Math.floor(40 + Math.sin(i * 0.3) * 25 + Math.random() * 15),
    cholera: Math.floor(20 + Math.cos(i * 0.25) * 15 + Math.random() * 10),
    dengue: Math.floor(15 + Math.sin(i * 0.4 + 1) * 12 + Math.random() * 8),
    typhoid: Math.floor(10 + Math.cos(i * 0.35 + 2) * 8 + Math.random() * 6),
  }
})

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ color: string; name: string; value: number }>
  label?: string
}) => {
  if (!active || !payload) return null
  return (
    <div className="rounded-lg border border-border/50 bg-card/90 p-3 text-sm backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.3)]">
      <p className="mb-2 font-mono text-xs font-semibold text-foreground">
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 py-0.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-mono font-semibold text-foreground">
            {entry.value} signals
          </span>
        </div>
      ))}
    </div>
  )
}

export function DiseaseSignalsChart() {
  return (
    <div className="rounded-xl border border-border/50 bg-card/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_30px_rgba(220,38,38,0.06)]">
      <div className="mb-6">
        <h3 className="font-mono text-base font-semibold text-foreground">
          Disease Signal Time-Series
        </h3>
        <p className="text-xs text-muted-foreground">
          Incoming IoT sensor signals by disease type (last 30 days)
        </p>
      </div>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
            />
            <XAxis
              dataKey="day"
              tick={{ fill: "#6b7280", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={4}
            />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
              formatter={(value: string) => (
                <span className="text-muted-foreground">{value}</span>
              )}
            />
            <Line
              type="monotone"
              dataKey="malaria"
              name="Malaria"
              stroke="#dc2626"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0, fill: "#dc2626" }}
            />
            <Line
              type="monotone"
              dataKey="cholera"
              name="Cholera"
              stroke="#f97316"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0, fill: "#f97316" }}
            />
            <Line
              type="monotone"
              dataKey="dengue"
              name="Dengue"
              stroke="#eab308"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0, fill: "#eab308" }}
            />
            <Line
              type="monotone"
              dataKey="typhoid"
              name="Typhoid"
              stroke="#22d3ee"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0, fill: "#22d3ee" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
