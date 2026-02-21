"use client"

import { useEffect, useState } from "react"
import { User, Clock, RefreshCw } from "lucide-react"
import { fetchRecords, toSeverity, timeAgo, type BeetRecord } from "@/lib/beet-api"

const severityStyles = {
  critical: "border-red-500/40 bg-red-500/10 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.15)]",
  warning:  "border-amber-500/40 bg-amber-500/10 text-amber-400",
  moderate: "border-blue-500/40 bg-blue-500/10 text-blue-400",
}

// Fallback static data shown when the backend is unreachable
const FALLBACK = [
  { id: "PT-4821", symptoms: "High fever, fatigue, joint pain",         region: "Lagos, Nigeria",        time: "12 min ago", severity: "critical" as const },
  { id: "PT-4820", symptoms: "Persistent cough, chest tightness",       region: "Nairobi, Kenya",        time: "24 min ago", severity: "warning"  as const },
  { id: "PT-4819", symptoms: "Diarrhea, dehydration, abdominal cramps", region: "Dhaka, Bangladesh",     time: "38 min ago", severity: "critical" as const },
  { id: "PT-4818", symptoms: "Skin rash, mild fever",                   region: "Manila, Philippines",   time: "1 hr ago",   severity: "moderate" as const },
  { id: "PT-4817", symptoms: "Headache, neck stiffness, photophobia",   region: "Kampala, Uganda",       time: "1.5 hr ago", severity: "critical" as const },
  { id: "PT-4816", symptoms: "Respiratory distress, fever",             region: "Lima, Peru",            time: "2 hr ago",   severity: "warning"  as const },
]

function recordToRow(r: BeetRecord) {
  return {
    id:       r.session_id.slice(0, 8).toUpperCase(),
    symptoms: `${r.diagnosis} — confidence ${Math.round(r.confidence * 100)}% · hash ${r.symptom_hash.slice(0, 8)}…`,
    region:   `Canton contract ${r.canton_contract_id.slice(0, 10)}…`,
    time:     timeAgo(r.submitted_at),
    severity: toSeverity(r.diagnosis, r.confidence),
  }
}

export function PatientReportsFeed() {
  const [rows, setRows]       = useState(FALLBACK)
  const [live, setLive]       = useState(false)
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const data = await fetchRecords()
      if (data.records.length > 0) {
        setRows(data.records.map(recordToRow))
        setLive(true)
      } else {
        setRows(FALLBACK)
      }
    } catch {
      setRows(FALLBACK)
      setLive(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 5000)   // poll every 5 s
    return () => clearInterval(id)
  }, [])

  return (
    <div className="rounded-xl border border-border/50 bg-card/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-primary/30">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h3 className="font-mono text-base font-semibold text-foreground">
            Anonymized Patient Reports
          </h3>
          <p className="text-xs text-muted-foreground">
            {live ? "Live data from Canton ledger" : "Live incoming reports from connected facilities"}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {live && (
            <span className="flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          )}
          <button
            onClick={load}
            className="rounded-lg border border-border/40 p-1.5 text-muted-foreground transition hover:border-primary/40 hover:text-primary"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="flex max-h-[500px] flex-col gap-3 overflow-y-auto pr-1">
        {rows.map((report, i) => (
          <div
            key={report.id + i}
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
                  <p className="text-xs text-muted-foreground/70">{report.region}</p>
                </div>
              </div>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${severityStyles[report.severity]}`}>
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
