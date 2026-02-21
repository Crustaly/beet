"use client"

import { useEffect, useRef } from "react"

const regions = [
  { name: "W. Africa", x: 0.15, risks: [0.9, 0.85, 0.92, 0.88, 0.78, 0.82] },
  { name: "E. Africa", x: 0.28, risks: [0.7, 0.75, 0.82, 0.88, 0.85, 0.72] },
  { name: "C. Africa", x: 0.41, risks: [0.6, 0.65, 0.72, 0.78, 0.82, 0.85] },
  { name: "S. Asia", x: 0.54, risks: [0.85, 0.82, 0.78, 0.9, 0.92, 0.88] },
  { name: "SE Asia", x: 0.67, risks: [0.5, 0.55, 0.62, 0.68, 0.75, 0.82] },
  { name: "S. America", x: 0.80, risks: [0.4, 0.45, 0.5, 0.55, 0.6, 0.65] },
]

const timeLabels = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"]

export function ForecastHeatmap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let dpr = window.devicePixelRatio || 1

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

    function draw() {
      if (!canvas || !ctx) return
      const w = canvas.width / dpr
      const h = canvas.height / dpr

      ctx.clearRect(0, 0, w, h)

      const marginLeft = 80
      const marginTop = 30
      const marginRight = 20
      const marginBottom = 40
      const gridW = w - marginLeft - marginRight
      const gridH = h - marginTop - marginBottom

      const cellW = gridW / timeLabels.length
      const cellH = gridH / regions.length

      // Draw cells
      for (let r = 0; r < regions.length; r++) {
        for (let t = 0; t < timeLabels.length; t++) {
          const risk = regions[r].risks[t]
          const x = marginLeft + t * cellW
          const y = marginTop + r * cellH

          // Risk color: low = dim, high = bright red
          const red = Math.floor(180 + risk * 75)
          const alpha = 0.1 + risk * 0.6

          ctx.fillStyle = `rgba(${red}, ${Math.floor(38 * (1 - risk * 0.5))}, ${Math.floor(38 * (1 - risk * 0.5))}, ${alpha})`
          ctx.beginPath()
          ctx.roundRect(x + 2, y + 2, cellW - 4, cellH - 4, 4)
          ctx.fill()

          // Risk text
          ctx.font = "11px monospace"
          ctx.fillStyle = risk > 0.7 ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(`${Math.floor(risk * 100)}%`, x + cellW / 2, y + cellH / 2)
        }

        // Row labels
        ctx.font = "11px monospace"
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
        ctx.textAlign = "right"
        ctx.textBaseline = "middle"
        ctx.fillText(regions[r].name, marginLeft - 10, marginTop + r * cellH + cellH / 2)
      }

      // Column labels
      for (let t = 0; t < timeLabels.length; t++) {
        ctx.font = "10px monospace"
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)"
        ctx.textAlign = "center"
        ctx.textBaseline = "top"
        ctx.fillText(timeLabels[t], marginLeft + t * cellW + cellW / 2, marginTop + regions.length * cellH + 10)
      }
    }

    draw()
    window.addEventListener("resize", () => { resize(); draw() })

    return () => {
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <div className="rounded-xl border border-border/50 bg-card/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_30px_rgba(220,38,38,0.06)]">
      <div className="mb-4">
        <h3 className="font-mono text-base font-semibold text-foreground">
          Forecast Heatmap
        </h3>
        <p className="text-xs text-muted-foreground">
          6-week outbreak risk projections by region
        </p>
      </div>
      <div className="h-[320px] overflow-hidden rounded-lg">
        <canvas ref={canvasRef} className="h-full w-full" style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  )
}
