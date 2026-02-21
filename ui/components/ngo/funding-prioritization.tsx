"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { DollarSign, Package } from "lucide-react"

const fundingData = [
  { region: "W. Africa", funding: 42, gap: 28, priority: "critical" },
  { region: "S. Asia", funding: 38, gap: 32, priority: "critical" },
  { region: "E. Africa", funding: 30, gap: 18, priority: "high" },
  { region: "SE Asia", funding: 25, gap: 15, priority: "high" },
  { region: "C. Africa", funding: 18, gap: 22, priority: "critical" },
  { region: "S. America", funding: 15, gap: 8, priority: "moderate" },
]

const supplyItems = [
  { name: "Oral Rehydration Salts", needed: "2.4M units", fulfilled: 35, priority: "critical" as const },
  { name: "Rapid Diagnostic Tests", needed: "1.8M kits", fulfilled: 42, priority: "critical" as const },
  { name: "ACT Antimalarials", needed: "890K courses", fulfilled: 58, priority: "high" as const },
  { name: "IV Fluids", needed: "560K liters", fulfilled: 28, priority: "critical" as const },
  { name: "Protective Equipment", needed: "3.2M sets", fulfilled: 65, priority: "moderate" as const },
  { name: "Water Purification", needed: "1.1M tablets", fulfilled: 48, priority: "high" as const },
]

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; fill?: string }>
  label?: string
}) => {
  if (!active || !payload) return null
  return (
    <div className="rounded-lg border border-border/50 bg-card/90 p-3 text-sm backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.3)]">
      <p className="mb-2 font-mono text-xs font-semibold text-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 py-0.5">
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-mono font-semibold text-foreground">${entry.value}M</span>
        </div>
      ))}
    </div>
  )
}

export function FundingPrioritization() {
  return (
    <div className="flex flex-col gap-6">
      {/* Funding Gap Chart */}
      <div className="rounded-xl border border-border/50 bg-card/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_30px_rgba(220,38,38,0.06)]">
        <div className="mb-1 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          <h3 className="font-mono text-base font-semibold text-foreground">
            Funding & Supply Prioritization
          </h3>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">
          Current allocation vs. identified funding gaps (USD millions)
        </p>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fundingData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="region" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="funding" name="Current Funding" radius={[4, 4, 0, 0]}>
                {fundingData.map((entry, i) => (
                  <Cell key={i} fill="#22c55e" opacity={0.6} />
                ))}
              </Bar>
              <Bar dataKey="gap" name="Funding Gap" radius={[4, 4, 0, 0]}>
                {fundingData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.priority === "critical" ? "#dc2626" : entry.priority === "high" ? "#f97316" : "#eab308"}
                    opacity={0.7}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Supply Priority Table */}
      <div className="rounded-xl border border-border/50 bg-card/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-primary/30">
        <div className="mb-4 flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          <h3 className="font-mono text-sm font-semibold text-foreground">
            Supply Priority Queue
          </h3>
        </div>
        <div className="flex flex-col gap-3">
          {supplyItems.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-4 rounded-lg border border-border/20 bg-secondary/20 px-4 py-3"
            >
              <div className="flex-1">
                <span className="text-sm font-medium text-foreground">
                  {item.name}
                </span>
                <p className="text-xs text-muted-foreground">
                  {item.needed} needed
                </p>
              </div>
              <div className="flex w-32 items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full rounded-full ${
                      item.priority === "critical"
                        ? "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.4)]"
                        : item.priority === "high"
                          ? "bg-orange-500"
                          : "bg-amber-500"
                    }`}
                    style={{ width: `${item.fulfilled}%` }}
                  />
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {item.fulfilled}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
