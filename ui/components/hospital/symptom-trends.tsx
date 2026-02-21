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
  { date: "Jan", respiratory: 120, gastrointestinal: 80, neurological: 35, dermatological: 55 },
  { date: "Feb", respiratory: 145, gastrointestinal: 72, neurological: 42, dermatological: 50 },
  { date: "Mar", respiratory: 230, gastrointestinal: 95, neurological: 38, dermatological: 62 },
  { date: "Apr", respiratory: 310, gastrointestinal: 110, neurological: 55, dermatological: 48 },
  { date: "May", respiratory: 280, gastrointestinal: 130, neurological: 60, dermatological: 70 },
  { date: "Jun", respiratory: 195, gastrointestinal: 155, neurological: 48, dermatological: 82 },
  { date: "Jul", respiratory: 160, gastrointestinal: 180, neurological: 52, dermatological: 90 },
  { date: "Aug", respiratory: 185, gastrointestinal: 165, neurological: 65, dermatological: 75 },
  { date: "Sep", respiratory: 250, gastrointestinal: 140, neurological: 72, dermatological: 68 },
  { date: "Oct", respiratory: 340, gastrointestinal: 120, neurological: 80, dermatological: 58 },
  { date: "Nov", respiratory: 420, gastrointestinal: 95, neurological: 68, dermatological: 52 },
  { date: "Dec", respiratory: 380, gastrointestinal: 88, neurological: 58, dermatological: 45 },
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

export function SymptomTrendsChart() {
  return (
    <div className="rounded-xl border border-border/50 bg-card/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_30px_rgba(220,38,38,0.06)]">
      <div className="mb-6">
        <h3 className="font-mono text-base font-semibold text-foreground">
          Symptom Trends Over Time
        </h3>
        <p className="text-xs text-muted-foreground">
          Monthly symptom category reporting across all facilities
        </p>
      </div>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="respGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#dc2626" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#dc2626" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gastroGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="neuroGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#eab308" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#eab308" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="dermaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
              formatter={(value: string) => <span className="text-muted-foreground">{value}</span>}
            />
            <Area type="monotone" dataKey="respiratory" name="Respiratory" stroke="#dc2626" fill="url(#respGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="gastrointestinal" name="GI" stroke="#f97316" fill="url(#gastroGrad)" strokeWidth={1.5} />
            <Area type="monotone" dataKey="neurological" name="Neuro" stroke="#eab308" fill="url(#neuroGrad)" strokeWidth={1.5} />
            <Area type="monotone" dataKey="dermatological" name="Derma" stroke="#6366f1" fill="url(#dermaGrad)" strokeWidth={1.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
