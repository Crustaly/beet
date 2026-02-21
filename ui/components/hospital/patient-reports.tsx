"use client"

import { User, Clock } from "lucide-react"

const reports = [
  {
    id: "PT-4821",
    symptoms: "High fever, fatigue, joint pain",
    region: "Lagos, Nigeria",
    time: "12 min ago",
    severity: "critical" as const,
  },
  {
    id: "PT-4820",
    symptoms: "Persistent cough, chest tightness",
    region: "Nairobi, Kenya",
    time: "24 min ago",
    severity: "warning" as const,
  },
  {
    id: "PT-4819",
    symptoms: "Diarrhea, dehydration, abdominal cramps",
    region: "Dhaka, Bangladesh",
    time: "38 min ago",
    severity: "critical" as const,
  },
  {
    id: "PT-4818",
    symptoms: "Skin rash, mild fever",
    region: "Manila, Philippines",
    time: "1 hr ago",
    severity: "moderate" as const,
  },
  {
    id: "PT-4817",
    symptoms: "Headache, neck stiffness, photophobia",
    region: "Kampala, Uganda",
    time: "1.5 hr ago",
    severity: "critical" as const,
  },
  {
    id: "PT-4816",
    symptoms: "Respiratory distress, fever",
    region: "Lima, Peru",
    time: "2 hr ago",
    severity: "warning" as const,
  },
]

const severityStyles = {
  critical:
    "border-red-500/40 bg-red-500/10 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.15)]",
  warning: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  moderate: "border-blue-500/40 bg-blue-500/10 text-blue-400",
}

export function PatientReportsFeed() {
  return (
    <div className="rounded-xl border border-border/50 bg-card/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-primary/30">
      <div className="mb-5">
        <h3 className="font-mono text-base font-semibold text-foreground">
          Anonymized Patient Reports
        </h3>
        <p className="text-xs text-muted-foreground">
          Live incoming reports from connected facilities
        </p>
      </div>
      <div className="flex max-h-[500px] flex-col gap-3 overflow-y-auto pr-1">
        {reports.map((report) => (
          <div
            key={report.id}
            className="group rounded-lg border border-border/30 bg-secondary/30 p-4 transition-all duration-300 hover:border-primary/30 hover:bg-secondary/50"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <span className="font-mono text-xs font-semibold text-foreground">
                    {report.id}
                  </span>
                  <p className="text-xs text-muted-foreground/70">
                    {report.region}
                  </p>
                </div>
              </div>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  severityStyles[report.severity]
                }`}
              >
                {report.severity}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {report.symptoms}
            </p>
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground/60">
              <Clock className="h-3 w-3" />
              {report.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
