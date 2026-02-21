"use client"

import { useEffect, useRef } from "react"

interface Outbreak {
  x: number
  y: number
  radius: number
  label: string
  cases: number
  severity: "critical" | "high" | "moderate"
}

const outbreaks: Outbreak[] = [
  { x: 0.43, y: 0.38, radius: 28, label: "Lagos", cases: 842, severity: "critical" },
  { x: 0.47, y: 0.42, radius: 18, label: "Kinshasa", cases: 431, severity: "high" },
  { x: 0.55, y: 0.40, radius: 22, label: "Nairobi", cases: 567, severity: "critical" },
  { x: 0.38, y: 0.35, radius: 14, label: "Dakar", cases: 212, severity: "moderate" },
  { x: 0.70, y: 0.42, radius: 25, label: "Mumbai", cases: 723, severity: "critical" },
  { x: 0.75, y: 0.48, radius: 20, label: "Dhaka", cases: 518, severity: "high" },
  { x: 0.82, y: 0.45, radius: 16, label: "Manila", cases: 342, severity: "high" },
  { x: 0.25, y: 0.52, radius: 15, label: "Lima", cases: 278, severity: "moderate" },
  { x: 0.22, y: 0.42, radius: 12, label: "Bogota", cases: 189, severity: "moderate" },
  { x: 0.50, y: 0.43, radius: 17, label: "Kampala", cases: 395, severity: "high" },
]

export function HospitalMapSection() {
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
      time += 0.015

      ctx.clearRect(0, 0, w, h)

      // Draw simplified world map outline (continents as shapes)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.06)"
      ctx.lineWidth = 1
      ctx.fillStyle = "rgba(255, 255, 255, 0.02)"

      // Grid lines
      for (let i = 0; i < 20; i++) {
        const x = (w / 20) * i
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.02)"
        ctx.stroke()
      }
      for (let i = 0; i < 10; i++) {
        const y = (h / 10) * i
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.02)"
        ctx.stroke()
      }

      // Simplified continent shapes
      ctx.fillStyle = "rgba(255, 255, 255, 0.03)"
      ctx.strokeStyle = "rgba(255, 255, 255, 0.06)"
      ctx.lineWidth = 1

      // Africa
      ctx.beginPath()
      ctx.ellipse(w * 0.47, h * 0.45, w * 0.08, h * 0.2, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // South Asia
      ctx.beginPath()
      ctx.ellipse(w * 0.72, h * 0.4, w * 0.07, h * 0.12, 0.2, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // SE Asia
      ctx.beginPath()
      ctx.ellipse(w * 0.80, h * 0.48, w * 0.05, h * 0.08, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // South America
      ctx.beginPath()
      ctx.ellipse(w * 0.24, h * 0.52, w * 0.06, h * 0.18, -0.15, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Europe
      ctx.beginPath()
      ctx.ellipse(w * 0.48, h * 0.22, w * 0.06, h * 0.07, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // North America
      ctx.beginPath()
      ctx.ellipse(w * 0.2, h * 0.25, w * 0.1, h * 0.1, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Draw outbreak circles
      for (const ob of outbreaks) {
        const cx = w * ob.x
        const cy = h * ob.y
        const pulseScale = 1 + Math.sin(time * 2 + ob.x * 10) * 0.15

        const baseAlpha = ob.severity === "critical" ? 0.6 : ob.severity === "high" ? 0.45 : 0.3

        // Outer pulse ring
        const outerR = ob.radius * pulseScale * 1.8
        const outerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, outerR)
        outerGrad.addColorStop(0, `rgba(220, 38, 38, ${baseAlpha * 0.15})`)
        outerGrad.addColorStop(1, "rgba(220, 38, 38, 0)")
        ctx.fillStyle = outerGrad
        ctx.beginPath()
        ctx.arc(cx, cy, outerR, 0, Math.PI * 2)
        ctx.fill()

        // Main circle
        const mainGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, ob.radius)
        mainGrad.addColorStop(0, `rgba(239, 68, 68, ${baseAlpha})`)
        mainGrad.addColorStop(0.7, `rgba(220, 38, 38, ${baseAlpha * 0.4})`)
        mainGrad.addColorStop(1, `rgba(220, 38, 38, 0)`)
        ctx.fillStyle = mainGrad
        ctx.beginPath()
        ctx.arc(cx, cy, ob.radius, 0, Math.PI * 2)
        ctx.fill()

        // Center dot
        ctx.beginPath()
        ctx.arc(cx, cy, 3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + Math.sin(time * 3 + ob.y * 10) * 0.3})`
        ctx.fill()

        // Label
        ctx.font = "11px monospace"
        ctx.fillStyle = `rgba(255, 255, 255, 0.7)`
        ctx.textAlign = "center"
        ctx.fillText(ob.label, cx, cy - ob.radius - 6)
        ctx.font = "10px monospace"
        ctx.fillStyle = `rgba(239, 68, 68, 0.8)`
        ctx.fillText(`${ob.cases} cases`, cx, cy - ob.radius + 6)
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
          Outbreak Map
        </h3>
        <p className="text-xs text-muted-foreground">
          Active outbreak clusters across connected hospital regions
        </p>
      </div>
      <div className="relative h-[400px] w-full overflow-hidden rounded-lg">
        <canvas
          ref={canvasRef}
          className="h-full w-full"
          style={{ width: "100%", height: "100%" }}
        />
        {/* Legend */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 rounded-lg border border-border/50 bg-card/80 p-3 backdrop-blur-md">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Severity
          </span>
          {[
            { label: "Critical", color: "bg-red-500" },
            { label: "High", color: "bg-red-400" },
            { label: "Moderate", color: "bg-red-300" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${item.color}`} />
              <span className="text-[10px] text-muted-foreground">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
