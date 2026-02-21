"use client"

import { useEffect, useRef } from "react"

interface Outbreak {
  x: number
  y: number
  radius: number
  label: string
  cases: number
  severity: "critical" | "high" | "moderate" | "watch"
}

const outbreaks: Outbreak[] = [
  { x: 0.43, y: 0.37, radius: 32, label: "West Africa", cases: 2841, severity: "critical" },
  { x: 0.49, y: 0.40, radius: 24, label: "Central Africa", cases: 1231, severity: "critical" },
  { x: 0.56, y: 0.38, radius: 28, label: "East Africa", cases: 1867, severity: "critical" },
  { x: 0.70, y: 0.35, radius: 26, label: "India", cases: 1523, severity: "critical" },
  { x: 0.76, y: 0.42, radius: 22, label: "Bangladesh", cases: 918, severity: "high" },
  { x: 0.82, y: 0.43, radius: 18, label: "Philippines", cases: 542, severity: "high" },
  { x: 0.85, y: 0.50, radius: 14, label: "Indonesia", cases: 378, severity: "moderate" },
  { x: 0.24, y: 0.50, radius: 18, label: "Brazil", cases: 645, severity: "high" },
  { x: 0.20, y: 0.42, radius: 14, label: "Colombia", cases: 312, severity: "moderate" },
  { x: 0.22, y: 0.55, radius: 12, label: "Peru", cases: 228, severity: "moderate" },
  { x: 0.58, y: 0.30, radius: 10, label: "Yemen", cases: 189, severity: "watch" },
  { x: 0.63, y: 0.38, radius: 12, label: "Pakistan", cases: 267, severity: "moderate" },
  { x: 0.40, y: 0.45, radius: 15, label: "DR Congo", cases: 456, severity: "high" },
  { x: 0.50, y: 0.48, radius: 11, label: "Tanzania", cases: 198, severity: "watch" },
  { x: 0.78, y: 0.38, radius: 16, label: "Myanmar", cases: 415, severity: "high" },
]

export function GlobalOutbreakMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let dpr = window.devicePixelRatio || 1
    let animId: number

    function resize() {
      if (!canvas || !ctx) return
      dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    window.addEventListener("resize", resize)
    let time = 0

    function draw() {
      if (!canvas || !ctx) return
      const w = canvas.width / dpr
      const h = canvas.height / dpr
      time += 0.012

      ctx.clearRect(0, 0, w, h)

      // Grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.015)"
      ctx.lineWidth = 1
      for (let i = 0; i <= 24; i++) {
        const x = (w / 24) * i
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let i = 0; i <= 12; i++) {
        const y = (h / 12) * i
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }

      // Continents
      ctx.fillStyle = "rgba(255, 255, 255, 0.025)"
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)"
      ctx.lineWidth = 0.8

      // Africa
      ctx.beginPath()
      ctx.ellipse(w * 0.48, h * 0.44, w * 0.09, h * 0.22, 0, 0, Math.PI * 2)
      ctx.fill(); ctx.stroke()
      // South Asia
      ctx.beginPath()
      ctx.ellipse(w * 0.71, h * 0.38, w * 0.06, h * 0.14, 0.15, 0, Math.PI * 2)
      ctx.fill(); ctx.stroke()
      // SE Asia
      ctx.beginPath()
      ctx.ellipse(w * 0.81, h * 0.46, w * 0.06, h * 0.1, 0, 0, Math.PI * 2)
      ctx.fill(); ctx.stroke()
      // South America
      ctx.beginPath()
      ctx.ellipse(w * 0.23, h * 0.5, w * 0.06, h * 0.2, -0.12, 0, Math.PI * 2)
      ctx.fill(); ctx.stroke()
      // North America
      ctx.beginPath()
      ctx.ellipse(w * 0.18, h * 0.24, w * 0.1, h * 0.12, 0, 0, Math.PI * 2)
      ctx.fill(); ctx.stroke()
      // Europe
      ctx.beginPath()
      ctx.ellipse(w * 0.48, h * 0.2, w * 0.07, h * 0.08, 0, 0, Math.PI * 2)
      ctx.fill(); ctx.stroke()
      // Middle East
      ctx.beginPath()
      ctx.ellipse(w * 0.58, h * 0.3, w * 0.04, h * 0.06, 0, 0, Math.PI * 2)
      ctx.fill(); ctx.stroke()

      // Draw all outbreaks
      for (const ob of outbreaks) {
        const cx = w * ob.x
        const cy = h * ob.y
        const pulse = 1 + Math.sin(time * 2.5 + ob.x * 8 + ob.y * 5) * 0.2

        const alpha =
          ob.severity === "critical" ? 0.7
          : ob.severity === "high" ? 0.5
          : ob.severity === "moderate" ? 0.35
          : 0.2

        // Pulsing outer glow
        const outerR = ob.radius * pulse * 2
        const outerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, outerR)
        outerGrad.addColorStop(0, `rgba(220, 38, 38, ${alpha * 0.2})`)
        outerGrad.addColorStop(1, "rgba(220, 38, 38, 0)")
        ctx.fillStyle = outerGrad
        ctx.beginPath()
        ctx.arc(cx, cy, outerR, 0, Math.PI * 2)
        ctx.fill()

        // Inner circle
        const innerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, ob.radius)
        innerGrad.addColorStop(0, `rgba(239, 68, 68, ${alpha})`)
        innerGrad.addColorStop(0.6, `rgba(220, 38, 38, ${alpha * 0.4})`)
        innerGrad.addColorStop(1, "rgba(220, 38, 38, 0)")
        ctx.fillStyle = innerGrad
        ctx.beginPath()
        ctx.arc(cx, cy, ob.radius, 0, Math.PI * 2)
        ctx.fill()

        // Center dot
        ctx.beginPath()
        ctx.arc(cx, cy, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${0.7 + Math.sin(time * 3 + ob.x * 12) * 0.3})`
        ctx.fill()

        // Labels
        ctx.font = "10px monospace"
        ctx.fillStyle = "rgba(255, 255, 255, 0.65)"
        ctx.textAlign = "center"
        ctx.fillText(ob.label, cx, cy - ob.radius - 5)
        ctx.font = "9px monospace"
        ctx.fillStyle = "rgba(239, 68, 68, 0.75)"
        ctx.fillText(`${ob.cases.toLocaleString()}`, cx, cy - ob.radius + 6)
      }

      // Connection lines between nearby outbreaks
      ctx.strokeStyle = "rgba(220, 38, 38, 0.04)"
      ctx.lineWidth = 0.5
      for (let i = 0; i < outbreaks.length; i++) {
        for (let j = i + 1; j < outbreaks.length; j++) {
          const a = outbreaks[i]
          const b = outbreaks[j]
          const dx = (a.x - b.x) * w
          const dy = (a.y - b.y) * h
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < w * 0.15) {
            ctx.beginPath()
            ctx.moveTo(w * a.x, h * a.y)
            ctx.lineTo(w * b.x, h * b.y)
            ctx.stroke()
          }
        }
      }

      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <div className="rounded-xl border border-border/50 bg-card/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_30px_rgba(220,38,38,0.06)]">
      <div className="mb-4">
        <h3 className="font-mono text-base font-semibold text-foreground">
          Global Outbreak Intelligence Map
        </h3>
        <p className="text-xs text-muted-foreground">
          Real-time outbreak clusters with severity indicators across monitored regions
        </p>
      </div>
      <div className="relative h-[420px] w-full overflow-hidden rounded-lg">
        <canvas
          ref={canvasRef}
          className="h-full w-full"
          style={{ width: "100%", height: "100%" }}
        />
        <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 rounded-lg border border-border/50 bg-card/80 p-3 backdrop-blur-md">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Severity
          </span>
          {[
            { label: "Critical", color: "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]" },
            { label: "High", color: "bg-red-400" },
            { label: "Moderate", color: "bg-red-300" },
            { label: "Watch", color: "bg-red-200" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${item.color}`} />
              <span className="text-[10px] text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
        <div className="absolute top-4 left-4 rounded-lg border border-border/50 bg-card/80 px-3 py-2 backdrop-blur-md">
          <span className="font-mono text-lg font-bold text-primary">15</span>
          <span className="ml-2 text-xs text-muted-foreground">Active Clusters</span>
        </div>
      </div>
    </div>
  )
}
