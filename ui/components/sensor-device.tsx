"use client"

import { useEffect, useRef } from "react"

export function SensorDevice() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let dpr = window.devicePixelRatio || 1
    const resize = () => {
      dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener("resize", resize)

    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      alpha: number
      life: number
      maxLife: number
    }

    const particles: Particle[] = []
    const maxParticles = 60

    function spawnParticle(w: number, h: number) {
      const cx = w / 2
      const cy = h / 2
      const angle = Math.random() * Math.PI * 2
      const speed = 0.3 + Math.random() * 0.8
      particles.push({
        x: cx + (Math.random() - 0.5) * 40,
        y: cy + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1 + Math.random() * 2,
        alpha: 0.4 + Math.random() * 0.6,
        life: 0,
        maxLife: 80 + Math.random() * 80,
      })
    }

    let time = 0
    function draw() {
      if (!canvas || !ctx) return
      const w = canvas.width / dpr
      const h = canvas.height / dpr
      time += 0.016

      ctx.clearRect(0, 0, w, h)

      const cx = w / 2
      const cy = h / 2

      // Outer glow
      const outerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 160)
      outerGlow.addColorStop(0, "rgba(220, 38, 38, 0.06)")
      outerGlow.addColorStop(0.5, "rgba(220, 38, 38, 0.02)")
      outerGlow.addColorStop(1, "rgba(220, 38, 38, 0)")
      ctx.fillStyle = outerGlow
      ctx.beginPath()
      ctx.arc(cx, cy, 160, 0, Math.PI * 2)
      ctx.fill()

      // Rotating orbit rings
      ctx.save()
      ctx.translate(cx, cy)
      for (let i = 0; i < 3; i++) {
        const rotation = time * (0.3 + i * 0.15)
        const ringRadius = 70 + i * 25
        ctx.save()
        ctx.rotate(rotation)
        ctx.beginPath()
        ctx.ellipse(0, 0, ringRadius, ringRadius * 0.35, 0, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(220, 38, 38, ${0.08 + i * 0.04})`
        ctx.lineWidth = 1
        ctx.stroke()

        // Dot on orbit
        const dotAngle = rotation * 2
        const dotX = Math.cos(dotAngle) * ringRadius
        const dotY = Math.sin(dotAngle) * ringRadius * 0.35
        ctx.beginPath()
        ctx.arc(dotX, dotY, 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(239, 68, 68, ${0.5 + Math.sin(time * 3 + i) * 0.3})`
        ctx.fill()
        ctx.restore()
      }
      ctx.restore()

      // Main device body
      const bodyW = 80
      const bodyH = 110
      const bodyX = cx - bodyW / 2
      const bodyY = cy - bodyH / 2

      // Device shadow
      const shadow = ctx.createRadialGradient(cx, cy + bodyH / 2 + 20, 0, cx, cy + bodyH / 2 + 20, 80)
      shadow.addColorStop(0, "rgba(0, 0, 0, 0.3)")
      shadow.addColorStop(1, "rgba(0, 0, 0, 0)")
      ctx.fillStyle = shadow
      ctx.beginPath()
      ctx.ellipse(cx, cy + bodyH / 2 + 20, 60, 15, 0, 0, Math.PI * 2)
      ctx.fill()

      // Device body
      const bodyGrad = ctx.createLinearGradient(bodyX, bodyY, bodyX + bodyW, bodyY + bodyH)
      bodyGrad.addColorStop(0, "#1a1a1a")
      bodyGrad.addColorStop(0.5, "#222222")
      bodyGrad.addColorStop(1, "#111111")
      ctx.fillStyle = bodyGrad
      ctx.beginPath()
      ctx.roundRect(bodyX, bodyY, bodyW, bodyH, 12)
      ctx.fill()

      // Device border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.06)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(bodyX, bodyY, bodyW, bodyH, 12)
      ctx.stroke()

      // Top red LED ring
      const ledPulse = 0.6 + Math.sin(time * 3) * 0.4
      const ledGlow = ctx.createRadialGradient(cx, bodyY + 20, 0, cx, bodyY + 20, 25)
      ledGlow.addColorStop(0, `rgba(239, 68, 68, ${0.8 * ledPulse})`)
      ledGlow.addColorStop(0.5, `rgba(220, 38, 38, ${0.3 * ledPulse})`)
      ledGlow.addColorStop(1, "rgba(220, 38, 38, 0)")
      ctx.fillStyle = ledGlow
      ctx.beginPath()
      ctx.arc(cx, bodyY + 20, 25, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.arc(cx, bodyY + 20, 10, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(239, 68, 68, ${ledPulse})`
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(cx, bodyY + 20, 4, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(239, 68, 68, ${ledPulse})`
      ctx.fill()

      // Screen area
      const screenY = bodyY + 38
      const screenH = 40
      const screenW = 60
      const screenX = cx - screenW / 2
      ctx.fillStyle = "#0a0a0a"
      ctx.beginPath()
      ctx.roundRect(screenX, screenY, screenW, screenH, 4)
      ctx.fill()

      // Data lines on screen
      ctx.strokeStyle = `rgba(239, 68, 68, ${0.5 + Math.sin(time * 2) * 0.2})`
      ctx.lineWidth = 1.5
      ctx.beginPath()
      for (let i = 0; i < screenW - 4; i++) {
        const x = screenX + 2 + i
        const y = screenY + screenH / 2 + Math.sin((i * 0.15) + time * 3) * 8 * Math.sin(i * 0.05)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()

      // Status indicators
      const indicatorY = bodyY + bodyH - 22
      for (let i = 0; i < 3; i++) {
        const ix = cx - 15 + i * 15
        const pulse = Math.sin(time * 4 + i * 1.5) > 0
        ctx.beginPath()
        ctx.arc(ix, indicatorY, 3, 0, Math.PI * 2)
        ctx.fillStyle = pulse ? "rgba(239, 68, 68, 0.9)" : "rgba(239, 68, 68, 0.2)"
        ctx.fill()
      }

      // Antenna
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(cx, bodyY)
      ctx.lineTo(cx, bodyY - 30)
      ctx.stroke()

      // Antenna tip glow
      const tipPulse = 0.5 + Math.sin(time * 4) * 0.5
      const tipGlow = ctx.createRadialGradient(cx, bodyY - 30, 0, cx, bodyY - 30, 12)
      tipGlow.addColorStop(0, `rgba(239, 68, 68, ${tipPulse})`)
      tipGlow.addColorStop(1, "rgba(239, 68, 68, 0)")
      ctx.fillStyle = tipGlow
      ctx.beginPath()
      ctx.arc(cx, bodyY - 30, 12, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.arc(cx, bodyY - 30, 3, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(239, 68, 68, ${0.7 + tipPulse * 0.3})`
      ctx.fill()

      // Signal waves from antenna
      for (let i = 0; i < 3; i++) {
        const waveProgress = ((time * 0.5 + i * 0.33) % 1)
        const waveRadius = 10 + waveProgress * 40
        const waveAlpha = (1 - waveProgress) * 0.3
        ctx.beginPath()
        ctx.arc(cx, bodyY - 30, waveRadius, -Math.PI * 0.7, -Math.PI * 0.3)
        ctx.strokeStyle = `rgba(239, 68, 68, ${waveAlpha})`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Particles
      if (particles.length < maxParticles && Math.random() > 0.7) {
        spawnParticle(w, h)
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.life++
        const lifeRatio = p.life / p.maxLife
        const fadeAlpha = lifeRatio < 0.2 ? lifeRatio / 0.2 : lifeRatio > 0.8 ? (1 - lifeRatio) / 0.2 : 1
        const finalAlpha = p.alpha * fadeAlpha

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(239, 68, 68, ${finalAlpha * 0.6})`
        ctx.fill()

        if (p.life > p.maxLife) {
          particles.splice(i, 1)
        }
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  return (
    <div className="relative mx-auto h-[300px] w-full max-w-[400px] md:h-[350px]">
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  )
}
