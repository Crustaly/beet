"use client"

import { Activity, MapPin, Users, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"

const stats = [
  {
    label: "Active Outbreaks",
    value: "12",
    change: "+3",
    trend: "up" as const,
    icon: AlertTriangle,
    region: "Across 4 regions",
  },
  {
    label: "Cities Affected",
    value: "28",
    change: "+5",
    trend: "up" as const,
    icon: MapPin,
    region: "6 countries",
  },
  {
    label: "Active Cases",
    value: "4,271",
    change: "-142",
    trend: "down" as const,
    icon: Users,
    region: "Last 24 hours",
  },
  {
    label: "Sensor Signals",
    value: "18.4K",
    change: "+2.1K",
    trend: "up" as const,
    icon: Activity,
    region: "Signals today",
  },
]

export function HospitalStatsCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_40px_rgba(220,38,38,0.08),inset_0_1px_0_rgba(255,255,255,0.05)]"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.04] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 shadow-[0_0_12px_rgba(220,38,38,0.1)]">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-medium ${
                  stat.trend === "up"
                    ? "text-primary"
                    : "text-emerald-400"
                }`}
              >
                {stat.trend === "up" ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="font-mono text-3xl font-bold text-foreground">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground/70">
                {stat.region}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
