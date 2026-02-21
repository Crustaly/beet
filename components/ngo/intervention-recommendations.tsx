"use client"

import { Lightbulb, ArrowRight } from "lucide-react"

const recommendations = [
  {
    priority: 1,
    title: "Deploy mobile vaccination units to Sahel corridor",
    rationale: "Cholera signals 340% above baseline. ORS stocks critically low in 3 districts.",
    impact: "Est. 12,000 lives protected",
    urgency: "Immediate" as const,
    region: "West Africa",
  },
  {
    priority: 2,
    title: "Establish cross-border disease surveillance protocol",
    rationale: "Outbreak cluster spanning 3 countries in Great Lakes region shows coordinated spread.",
    impact: "Est. 8,500 early detections",
    urgency: "Immediate" as const,
    region: "East Africa",
  },
  {
    priority: 3,
    title: "Pre-position dengue treatment supplies",
    rationale: "Forecast model predicts 65% risk increase in Maritime SE Asia within 3 weeks.",
    impact: "Est. 5,200 hospitalizations prevented",
    urgency: "Within 7 days" as const,
    region: "SE Asia",
  },
  {
    priority: 4,
    title: "Scale water purification distribution",
    rationale: "Typhoid signals correlate with contaminated water sources in 4 South Asian zones.",
    impact: "Est. 3,800 infections prevented",
    urgency: "Within 14 days" as const,
    region: "South Asia",
  },
  {
    priority: 5,
    title: "Fund community health worker training",
    rationale: "Early detection capacity gaps identified in rural Andean communities.",
    impact: "Est. 2,100 faster diagnoses",
    urgency: "Within 30 days" as const,
    region: "South America",
  },
]

const urgencyConfig = {
  "Immediate": "border-red-500/40 bg-red-500/10 text-red-400",
  "Within 7 days": "border-orange-500/40 bg-orange-500/10 text-orange-400",
  "Within 14 days": "border-amber-500/40 bg-amber-500/10 text-amber-400",
  "Within 30 days": "border-yellow-500/40 bg-yellow-500/10 text-yellow-400",
}

export function InterventionRecommendations() {
  return (
    <div className="rounded-xl border border-border/50 bg-card/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-primary/30">
      <div className="mb-1 flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-primary" />
        <h3 className="font-mono text-base font-semibold text-foreground">
          AI Intervention Recommendations
        </h3>
      </div>
      <p className="mb-5 text-xs text-muted-foreground">
        Prioritized action items generated from outbreak intelligence
      </p>
      <div className="flex flex-col gap-3">
        {recommendations.map((rec) => (
          <div
            key={rec.priority}
            className="group rounded-lg border border-border/30 bg-secondary/20 p-4 transition-all duration-300 hover:border-primary/30 hover:bg-secondary/30"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-mono text-xs font-bold text-primary">
                {rec.priority}
              </span>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold text-foreground">
                    {rec.title}
                  </h4>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase ${urgencyConfig[rec.urgency]}`}
                  >
                    {rec.urgency}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {rec.rationale}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-xs text-primary/80">{rec.impact}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground/40" />
                  <span className="text-xs text-muted-foreground/60">
                    {rec.region}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
