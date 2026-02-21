"use client"

import { Shield, TrendingUp, TrendingDown, Minus } from "lucide-react"

const regions = [
  { name: "West Africa", risk: 92, trend: "up" as const, level: "critical" as const, diseases: ["Cholera", "Malaria", "Lassa Fever"] },
  { name: "East Africa", risk: 78, trend: "up" as const, level: "high" as const, diseases: ["Malaria", "Typhoid"] },
  { name: "South Asia", risk: 88, trend: "up" as const, level: "critical" as const, diseases: ["Dengue", "Cholera", "Typhoid"] },
  { name: "Southeast Asia", risk: 65, trend: "up" as const, level: "elevated" as const, diseases: ["Dengue", "Respiratory"] },
  { name: "South America", risk: 52, trend: "stable" as const, level: "moderate" as const, diseases: ["Dengue", "Zika"] },
  { name: "Central Africa", risk: 74, trend: "up" as const, level: "high" as const, diseases: ["Ebola", "Malaria"] },
  { name: "Middle East", risk: 38, trend: "down" as const, level: "low" as const, diseases: ["MERS", "Cholera"] },
  { name: "Central America", risk: 45, trend: "stable" as const, level: "moderate" as const, diseases: ["Dengue", "Chikungunya"] },
]

const levelConfig = {
  critical: { color: "text-red-400", bg: "bg-red-500", barColor: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]", badge: "border-red-500/40 bg-red-500/10 text-red-400" },
  high: { color: "text-orange-400", bg: "bg-orange-500", barColor: "bg-orange-500", badge: "border-orange-500/40 bg-orange-500/10 text-orange-400" },
  elevated: { color: "text-amber-400", bg: "bg-amber-500", barColor: "bg-amber-500", badge: "border-amber-500/40 bg-amber-500/10 text-amber-400" },
  moderate: { color: "text-yellow-400", bg: "bg-yellow-500", barColor: "bg-yellow-500", badge: "border-yellow-500/40 bg-yellow-500/10 text-yellow-400" },
  low: { color: "text-emerald-400", bg: "bg-emerald-500", barColor: "bg-emerald-500", badge: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" },
}

const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
  if (trend === "up") return <TrendingUp className="h-3 w-3 text-red-400" />
  if (trend === "down") return <TrendingDown className="h-3 w-3 text-emerald-400" />
  return <Minus className="h-3 w-3 text-amber-400" />
}

export function RiskLevelIndicators() {
  return (
    <div className="rounded-xl border border-border/50 bg-card/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_30px_rgba(220,38,38,0.06)]">
      <div className="mb-1 flex items-center gap-2">
        <Shield className="h-4 w-4 text-primary" />
        <h3 className="font-mono text-base font-semibold text-foreground">
          Regional Risk Level Indicators
        </h3>
      </div>
      <p className="mb-6 text-xs text-muted-foreground">
        Composite risk scores combining outbreak velocity, healthcare capacity, and population density
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {regions.map((region) => {
          const config = levelConfig[region.level]
          return (
            <div
              key={region.name}
              className="rounded-lg border border-border/30 bg-secondary/20 p-4 transition-all duration-300 hover:border-primary/30 hover:bg-secondary/30"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">
                  {region.name}
                </span>
                <TrendIcon trend={region.trend} />
              </div>
              <div className="mt-3 flex items-end gap-2">
                <span className={`font-mono text-2xl font-bold ${config.color}`}>
                  {region.risk}
                </span>
                <span className="mb-1 text-xs text-muted-foreground">/100</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${config.barColor}`}
                  style={{ width: `${region.risk}%` }}
                />
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase ${config.badge}`}>
                  {region.level}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {region.diseases.map((d) => (
                  <span key={d} className="rounded bg-secondary/50 px-1.5 py-0.5 text-[9px] text-muted-foreground">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
