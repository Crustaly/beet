/**
 * Beet API client — talks to the Flask backend on port 8000
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export interface BeetRecord {
  session_id: string
  canton_contract_id: string
  diagnosis: "Flu" | "Cold" | "COVID" | "Healthy" | "Unknown"
  confidence: number
  symptom_hash: string
  adi_hash: string | null
  submitted_at: string
  status: "pending" | "confirmed"
}

export interface RecordsResponse {
  count: number
  records: BeetRecord[]
}

export async function fetchRecords(): Promise<RecordsResponse> {
  const res = await fetch(`${API_BASE}/records`, { cache: "no-store" })
  if (!res.ok) throw new Error(`Failed to fetch records: ${res.status}`)
  return res.json()
}

export async function submitTriage(payload: {
  session_id: string
  symptom_hash: string
  diagnosis: string
  confidence: number
}) {
  const res = await fetch(`${API_BASE}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Submit failed: ${res.status}`)
  }
  return res.json()
}

/** Map a Beet diagnosis + confidence to a severity label for the UI */
export function toSeverity(
  diagnosis: string,
  confidence: number
): "critical" | "warning" | "moderate" {
  if (diagnosis === "COVID" || confidence >= 0.8) return "critical"
  if (diagnosis === "Flu" || confidence >= 0.6) return "warning"
  return "moderate"
}

/** Format an ISO timestamp as a relative "X min ago" string */
export function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`
  return `${Math.floor(diff / 86400)}d ago`
}
