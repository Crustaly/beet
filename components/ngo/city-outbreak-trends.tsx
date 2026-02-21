"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

const data = [
  { week: "W1", Lagos: 120, Nairobi: 85, Dhaka: 95, Mumbai: 150, Lima: 40 },
  { week: "W2", Lagos: 145, Nairobi: 92, Dhaka: 110, Mumbai: 168, Lima: 45 },
  { week: "W3", Lagos: 180, Nairobi: 105, Dhaka: 135, Mumbai: 195, Lima: 52 },
  { week: "W4", Lagos: 210, Nairobi: 128, Dhaka: 160, Mumbai: 220, Lima: 58 },
  { week: "W5", Lagos: 260, Nairobi: 148, Dhaka: 185, Mumbai: 248, Lima: 65 },
  { week: "W6", Lagos: 310, Nairobi: 165, Dhaka: 210, Mumbai: 280, Lima: 72 },
  { week: "W7", Lagos: 345, Nairobi: 180, Dhaka: 240, Mumbai: 310, Lima: 80 },
  { week: "W8", Lagos: 380, Nairobi: 195, Dhaka: 265, Mumbai: 330, Lima: 88 },
]

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) => {
  if (!active || !payload) return null
  return (
    <div className="rounded-lg border border-border/50 bg-card/90 p-3 text-sm backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.3)]">
      <p className="mb-2 font-mono text-xs font-semibold text-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 py-0.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-mono font-semibold text-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export function CityOutbreakTrends() {
  return (
    <div className="rounded-xl border border-border/50 bg-card/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_30px_rgba(220,38,38,0.06)]">
      <div className="mb-4">
        <h3 className="font-mono text-base font-semibold text-foreground">
          City-Level Outbreak Trends
        </h3>
        <p className="text-xs text-muted-foreground">
          Weekly case progression across highest-risk urban centers
        </p>
      </div>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="lagosGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#dc2626" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#dc2626" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="mumbaiGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="dhakaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#eab308" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#eab308" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="week" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 10, paddingTop: 12 }} formatter={(v: string) => <span className="text-muted-foreground">{v}</span>} />
            <Area type="monotone" dataKey="Lagos" stroke="#dc2626" fill="url(#lagosGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="Mumbai" stroke="#f97316" fill="url(#mumbaiGrad)" strokeWidth={1.5} />
            <Area type="monotone" dataKey="Dhaka" stroke="#eab308" fill="url(#dhakaGrad)" strokeWidth={1.5} />
            <Area type="monotone" dataKey="Nairobi" stroke="#22d3ee" fill="transparent" strokeWidth={1.5} />
            <Area type="monotone" dataKey="Lima" stroke="#a78bfa" fill="transparent" strokeWidth={1} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
