"use client"

import { AlertTriangle, TrendingUp, Clock } from "lucide-react"

const alerts = [
  {
    title: "Cholera Surge - West Africa",
    description: "Signal density 340% above baseline in Sahel region. Immediate intervention recommended.",
    time: "8 min ago",
    severity: "critical" as const,
    confidence: 94,
  },
  {
    title: "Malaria Spike - East Africa",
    description: "Unusual seasonal pattern detected across Great Lakes. Cross-border coordination needed.",
    time: "22 min ago",
    severity: "critical" as const,
    confidence: 91,
  },
  {
    title: "Dengue Cluster - SE Asia",
    description: "New cluster formation in Maritime SE Asia. Accelerating over 72-hour window.",
    time: "45 min ago",
    severity: "high" as const,
    confidence: 87,
  },
  {
    title: "Typhoid Warning - South Asia",
    description: "Water contamination signals elevated in 4 monitoring zones.",
    time: "1.2 hr ago",
    severity: "high" as const,
    confidence: 82,
  },
  {
    title: "Respiratory Anomaly - Andean",
    description: "Unclassified respiratory signals rising in 2 districts. Under AI analysis.",
    time: "2 hr ago",
    severity: "warning" as const,
    confidence: 68,
  },
]

const severityConfig = {
  critical: {
    border: "border-red-500/40",
    bg: "bg-red-500/5",
    badge: "border-red-500/40 bg-red-500/10 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.15)]",
  },
  high: {
    border: "border-orange-500/40",
    bg: "bg-orange-500/5",
    badge: "border-orange-500/40 bg-orange-500/10 text-orange-400",
  },
  warning: {
    border: "border-amber-500/40",
    bg: "bg-amber-500/5",
    badge: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  },
}

export function EarlyWarningAlerts() {
  return (
    <div className="rounded-xl border border-border/50 bg-card/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-primary/30">
      <div className="mb-1 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-primary" />
        <h3 className="font-mono text-base font-semibold text-foreground">
          Early Warning Alerts
        </h3>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        Real-time AI-generated alerts from sensor network
      </p>
      <div className="flex max-h-[400px] flex-col gap-3 overflow-y-auto pr-1">
        {alerts.map((alert, i) => {
          const config = severityConfig[alert.severity]
          return (
            <div
              key={i}
              className={`rounded-lg border p-4 transition-all duration-300 hover:brightness-110 ${config.border} ${config.bg}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    {alert.title}
                  </span>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${config.badge}`}
                >
                  {alert.severity}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {alert.description}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground/60">
                  <Clock className="h-3 w-3" />
                  {alert.time}
                </div>
                <span className="text-xs text-primary/70">
                  {alert.confidence}% confidence
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
