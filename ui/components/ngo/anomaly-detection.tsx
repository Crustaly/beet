"use client"

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from "recharts"
import { BrainCircuit } from "lucide-react"

const normalData = Array.from({ length: 40 }, (_, i) => ({
  signal: 10 + Math.random() * 50,
  confidence: 20 + Math.random() * 40,
  size: 30 + Math.random() * 40,
}))

const anomalyData = [
  { signal: 72, confidence: 85, size: 120 },
  { signal: 85, confidence: 92, size: 150 },
  { signal: 68, confidence: 78, size: 100 },
  { signal: 90, confidence: 88, size: 130 },
  { signal: 78, confidence: 95, size: 140 },
]

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { signal: number; confidence: number } }> }) => {
  if (!active || !payload || !payload.length) return null
  const data = payload[0].payload
  return (
    <div className="rounded-lg border border-border/50 bg-card/90 p-3 text-sm backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.3)]">
      <p className="font-mono text-xs text-foreground">
        Signal: {data.signal} | Confidence: {data.confidence}%
      </p>
    </div>
  )
}

export function AnomalyDetection() {
  return (
    <div className="rounded-xl border border-border/50 bg-card/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_30px_rgba(220,38,38,0.06)]">
      <div className="mb-1 flex items-center gap-2">
        <BrainCircuit className="h-4 w-4 text-primary" />
        <h3 className="font-mono text-base font-semibold text-foreground">
          AI Anomaly Detection
        </h3>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        Machine learning flags unusual signal clusters that deviate from baseline patterns
      </p>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="signal"
              name="Signal Strength"
              tick={{ fill: "#6b7280", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              label={{ value: "Signal Strength", position: "bottom", fill: "#6b7280", fontSize: 10 }}
            />
            <YAxis
              dataKey="confidence"
              name="Confidence"
              tick={{ fill: "#6b7280", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              label={{ value: "Confidence %", angle: -90, position: "left", fill: "#6b7280", fontSize: 10 }}
            />
            <ZAxis dataKey="size" range={[30, 150]} />
            <Tooltip content={<CustomTooltip />} />
            <Scatter name="Normal" data={normalData} fill="rgba(255,255,255,0.15)" />
            <Scatter name="Anomaly" data={anomalyData} fill="#dc2626" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[rgba(255,255,255,0.15)]" />
          <span className="text-[10px] text-muted-foreground">Normal signals</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]" />
          <span className="text-[10px] text-muted-foreground">Detected anomalies</span>
        </div>
      </div>
    </div>
  )
}
