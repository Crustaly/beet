"use client"

import { useEffect, useRef } from "react"

const clusters = [
  { x: 0.3, y: 0.35, name: "Sahel Region", count: 8, growth: "+3 this week" },
  { x: 0.5, y: 0.4, name: "Great Lakes", count: 5, growth: "+1 this week" },
  { x: 0.7, y: 0.3, name: "South Asia Belt", count: 12, growth: "+5 this week" },
  { x: 0.2, y: 0.55, name: "Andean Corridor", count: 4, growth: "+2 this week" },
  { x: 0.8, y: 0.5, name: "Maritime SE Asia", count: 6, growth: "+2 this week" },
]

export function OutbreakClusterMap() {
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
      time += 0.01

      ctx.clearRect(0, 0, w, h)

      // Grid
      ctx.strokeStyle = "rgba(255,255,255,0.015)"
      for (let i = 0; i < 16; i++) {
        ctx.beginPath()
        ctx.moveTo((w / 16) * i, 0)
        ctx.lineTo((w / 16) * i, h)
        ctx.stroke()
      }
      for (let i = 0; i < 8; i++) {
        ctx.beginPath()
        ctx.moveTo(0, (h / 8) * i)
        ctx.lineTo(w, (h / 8) * i)
        ctx.stroke()
      }

      // Cluster zones
      for (const cluster of clusters) {
        const cx = w * cluster.x
        const cy = h * cluster.y
        const baseR = 25 + cluster.count * 4
        const pulse = 1 + Math.sin(time * 2 + cluster.x * 10) * 0.12

        // Zone area
        const zoneR = baseR * 2.5
        const zoneGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, zoneR)
        zoneGrad.addColorStop(0, "rgba(220, 38, 38, 0.08)")
        zoneGrad.addColorStop(0.5, "rgba(220, 38, 38, 0.03)")
        zoneGrad.addColorStop(1, "rgba(220, 38, 38, 0)")
        ctx.fillStyle = zoneGrad
        ctx.beginPath()
        ctx.arc(cx, cy, zoneR, 0, Math.PI * 2)
        ctx.fill()

        // Dashed boundary
        ctx.setLineDash([4, 4])
        ctx.strokeStyle = `rgba(220, 38, 38, ${0.15 + Math.sin(time + cluster.y * 5) * 0.05})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(cx, cy, baseR * 1.5, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])

        // Core
        const coreR = baseR * pulse
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR)
        coreGrad.addColorStop(0, "rgba(239, 68, 68, 0.5)")
        coreGrad.addColorStop(0.7, "rgba(220, 38, 38, 0.2)")
        coreGrad.addColorStop(1, "rgba(220, 38, 38, 0)")
        ctx.fillStyle = coreGrad
        ctx.beginPath()
        ctx.arc(cx, cy, coreR, 0, Math.PI * 2)
        ctx.fill()

        // Scatter points within cluster
        for (let i = 0; i < cluster.count; i++) {
          const angle = (Math.PI * 2 / cluster.count) * i + time * 0.5
          const dist = baseR * 0.6 * (0.3 + Math.sin(i * 1.7) * 0.4)
          const px = cx + Math.cos(angle) * dist
          const py = cy + Math.sin(angle) * dist
          ctx.beginPath()
          ctx.arc(px, py, 2.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(239, 68, 68, ${0.5 + Math.sin(time * 3 + i) * 0.3})`
          ctx.fill()
        }

        // Label
        ctx.font = "11px monospace"
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
        ctx.textAlign = "center"
        ctx.fillText(cluster.name, cx, cy - baseR * 1.5 - 10)
        ctx.font = "10px monospace"
        ctx.fillStyle = "rgba(239, 68, 68, 0.7)"
        ctx.fillText(`${cluster.count} clusters | ${cluster.growth}`, cx, cy - baseR * 1.5 + 3)
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
          Rising Outbreak Clusters
        </h3>
        <p className="text-xs text-muted-foreground">
          AI-identified geographic clusters showing accelerating disease spread
        </p>
      </div>
      <div className="relative h-[300px] overflow-hidden rounded-lg">
        <canvas ref={canvasRef} className="h-full w-full" style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  )
}
