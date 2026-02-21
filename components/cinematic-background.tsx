"use client"

import { useEffect, useRef } from "react"

export function CinematicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let dpr = window.devicePixelRatio || 1
    let animId: number

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
    const maxParticles = 50

    function resize() {
      if (!canvas || !ctx) return
      dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = document.documentElement.scrollHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    window.addEventListener("resize", resize)

    let time = 0

    function draw() {
      if (!canvas || !ctx) return
      const w = canvas.width / dpr
      const h = canvas.height / dpr
      time += 0.008

      ctx.clearRect(0, 0, w, h)

      // Top-down red light rays
      const rayCount = 7
      for (let i = 0; i < rayCount; i++) {
        const x = (w / (rayCount + 1)) * (i + 1) + Math.sin(time + i * 0.7) * 30
        const rayWidth = 60 + Math.sin(time * 0.5 + i) * 20
        const rayAlpha = 0.015 + Math.sin(time * 0.3 + i * 1.2) * 0.008

        const grad = ctx.createLinearGradient(x, 0, x, h * 0.5)
        grad.addColorStop(0, `rgba(220, 38, 38, ${rayAlpha * 2.5})`)
        grad.addColorStop(0.3, `rgba(220, 38, 38, ${rayAlpha * 1.2})`)
        grad.addColorStop(0.7, `rgba(220, 38, 38, ${rayAlpha * 0.3})`)
        grad.addColorStop(1, "rgba(220, 38, 38, 0)")

        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.moveTo(x - rayWidth * 0.3, 0)
        ctx.lineTo(x + rayWidth * 0.3, 0)
        ctx.lineTo(x + rayWidth, h * 0.5)
        ctx.lineTo(x - rayWidth, h * 0.5)
        ctx.closePath()
        ctx.fill()
      }

      // Soft gradient fog at different heights
      const fogPositions = [0.15, 0.4, 0.65, 0.85]
      for (const pos of fogPositions) {
        const fogY = h * pos
        const fogGrad = ctx.createRadialGradient(w / 2, fogY, 0, w / 2, fogY, w * 0.6)
        fogGrad.addColorStop(0, `rgba(220, 38, 38, ${0.012 + Math.sin(time + pos * 5) * 0.005})`)
        fogGrad.addColorStop(0.5, `rgba(220, 38, 38, ${0.005})`)
        fogGrad.addColorStop(1, "rgba(220, 38, 38, 0)")
        ctx.fillStyle = fogGrad
        ctx.fillRect(0, fogY - h * 0.15, w, h * 0.3)
      }

      // Glowing neon orbs drifting slowly
      const orbCount = 5
      for (let i = 0; i < orbCount; i++) {
        const orbX = w * (0.15 + 0.7 * (i / (orbCount - 1))) + Math.sin(time * 0.4 + i * 2.1) * 60
        const orbY = h * (0.2 + 0.15 * Math.sin(time * 0.25 + i * 1.7))
        const orbRadius = 80 + Math.sin(time * 0.6 + i) * 30
        const orbAlpha = 0.03 + Math.sin(time * 0.35 + i * 1.4) * 0.015

        const orbGrad = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, orbRadius)
        orbGrad.addColorStop(0, `rgba(239, 68, 68, ${orbAlpha * 2})`)
        orbGrad.addColorStop(0.4, `rgba(220, 38, 38, ${orbAlpha})`)
        orbGrad.addColorStop(1, "rgba(220, 38, 38, 0)")
        ctx.fillStyle = orbGrad
        ctx.fillRect(orbX - orbRadius, orbY - orbRadius, orbRadius * 2, orbRadius * 2)
      }

      // Floating data particles
      while (particles.length < maxParticles) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.25,
          vy: -0.1 - Math.random() * 0.2,
          size: 1.5 + Math.random() * 2.5,
          alpha: 0,
          life: Math.floor(Math.random() * 100),
          maxLife: 250 + Math.random() * 350,
        })
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx + Math.sin(time * 2 + i * 0.1) * 0.1
        p.y += p.vy
        p.life++

        const ratio = p.life / p.maxLife
        p.alpha = ratio < 0.15 ? ratio / 0.15 : ratio > 0.75 ? (1 - ratio) / 0.25 : 1
        p.alpha *= 0.5

        // Glow around particle
        const glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4)
        glowGrad.addColorStop(0, `rgba(239, 68, 68, ${p.alpha * 0.3})`)
        glowGrad.addColorStop(1, "rgba(239, 68, 68, 0)")
        ctx.fillStyle = glowGrad
        ctx.fillRect(p.x - p.size * 4, p.y - p.size * 4, p.size * 8, p.size * 8)

        // Particle core
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(248, 113, 113, ${p.alpha * 0.8})`
        ctx.fill()

        if (p.life > p.maxLife || p.y < -10) {
          particles.splice(i, 1)
        }
      }

      animId = requestAnimationFrame(draw)
    }

    draw()

    // Periodically resize to match page height changes
    const resizeInterval = setInterval(resize, 2000)

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animId)
      clearInterval(resizeInterval)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ width: "100%", height: "100%" }}
      aria-hidden="true"
    />
  )
}
