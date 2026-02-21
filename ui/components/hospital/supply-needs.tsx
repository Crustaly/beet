"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Syringe, Package, Bell, TrendingUp } from "lucide-react"

const vaccineData = [
  { region: "W. Africa", demand: 45000, supply: 28000 },
  { region: "E. Africa", demand: 38000, supply: 31000 },
  { region: "S. Asia", demand: 52000, supply: 22000 },
  { region: "SE Asia", demand: 30000, supply: 25000 },
  { region: "S. America", demand: 22000, supply: 18000 },
  { region: "C. Africa", demand: 35000, supply: 12000 },
]

const alerts = [
  {
    title: "Cholera surge: W. Africa",
    description: "ORS and IV fluid supplies critically low in 3 districts.",
    severity: "critical" as const,
  },
  {
    title: "Malaria spike: E. Africa",
    description: "Artemisinin combination therapy stock below 15-day threshold.",
    severity: "critical" as const,
  },
  {
    title: "Dengue monitoring: SE Asia",
    description: "Platelet supplies under observation. No immediate shortage.",
    severity: "warning" as const,
  },
]

const resources = [
  { name: "PPE Kits", stock: 78, status: "adequate" as const },
  { name: "Testing Kits", stock: 34, status: "low" as const },
  { name: "IV Fluids", stock: 12, status: "critical" as const },
  { name: "Ventilators", stock: 65, status: "adequate" as const },
  { name: "Antibiotics", stock: 42, status: "low" as const },
]

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; fill: string }>
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
            style={{ backgroundColor: entry.fill }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-mono font-semibold text-foreground">
            {entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}

export function SupplyNeedsSection() {
  return (
    <div className="flex flex-col gap-6">
      {/* Vaccine Demand Forecasting */}
      <div className="rounded-xl border border-border/50 bg-card/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_30px_rgba(220,38,38,0.06)]">
        <div className="mb-1 flex items-center gap-2">
          <Syringe className="h-4 w-4 text-primary" />
          <h3 className="font-mono text-base font-semibold text-foreground">
            Vaccine Demand Forecasting
          </h3>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">
          Projected demand vs. current supply by region
        </p>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={vaccineData} barGap={4}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                dataKey="region"
                tick={{ fill: "#6b7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="demand"
                name="Demand"
                fill="#dc2626"
                radius={[4, 4, 0, 0]}
                opacity={0.8}
              />
              <Bar
                dataKey="supply"
                name="Supply"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
                opacity={0.6}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Resource Planning */}
        <div className="rounded-xl border border-border/50 bg-card/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-primary/30">
          <div className="mb-4 flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <h3 className="font-mono text-sm font-semibold text-foreground">
              Resource Planning
            </h3>
          </div>
          <div className="flex flex-col gap-3">
            {resources.map((r) => (
              <div key={r.name} className="flex items-center gap-3">
                <span className="w-24 text-sm text-muted-foreground">
                  {r.name}
                </span>
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${
                      r.status === "critical"
                        ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                        : r.status === "low"
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                    }`}
                    style={{ width: `${r.stock}%` }}
                  />
                </div>
                <span
                  className={`font-mono text-xs font-semibold ${
                    r.status === "critical"
                      ? "text-red-400"
                      : r.status === "low"
                        ? "text-amber-400"
                        : "text-emerald-400"
                  }`}
                >
                  {r.stock}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Outbreak Response Alerts */}
        <div className="rounded-xl border border-border/50 bg-card/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-primary/30">
          <div className="mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h3 className="font-mono text-sm font-semibold text-foreground">
              Outbreak Response Alerts
            </h3>
          </div>
          <div className="flex flex-col gap-3">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className={`rounded-lg border p-3 ${
                  alert.severity === "critical"
                    ? "border-red-500/30 bg-red-500/5"
                    : "border-amber-500/30 bg-amber-500/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp
                    className={`h-3.5 w-3.5 ${
                      alert.severity === "critical"
                        ? "text-red-400"
                        : "text-amber-400"
                    }`}
                  />
                  <span className="text-sm font-semibold text-foreground">
                    {alert.title}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {alert.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
