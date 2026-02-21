"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { useInView } from "@/hooks/use-in-view"

function AnimatedCounter({
  end,
  suffix = "",
  prefix = "",
  duration = 2000,
  shouldStart,
}: {
  end: number
  suffix?: string
  prefix?: string
  duration?: number
  shouldStart: boolean
}) {
  const [value, setValue] = useState(0)

  const animate = useCallback(() => {
    const startTime = performance.now()
    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(eased * end))
      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }
    requestAnimationFrame(step)
  }, [end, duration])

  useEffect(() => {
    if (shouldStart) {
      animate()
    }
  }, [shouldStart, animate])

  return (
    <span>
      {prefix}
      {value.toLocaleString()}
      {suffix}
    </span>
  )
}

const stats = [
  {
    value: 4.5,
    suffix: " Billion",
    description: "people lack access to essential healthcare",
    source: "World Health Organization",
  },
  {
    value: 5,
    suffix: " Million",
    description:
      "preventable deaths annually due to delayed diagnosis in rural communities",
    source: "World Bank",
  },
  {
    value: 14,
    suffix: " Days",
    description:
      "average delay between disease outbreak and first official response",
    source: "The Lancet",
  },
  {
    value: 73,
    suffix: "%",
    description:
      "of low-income countries lack real-time disease surveillance systems",
    source: "WHO Global Report",
  },
]

export function ImpactSection() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { threshold: 0.2 })

  return (
    <section ref={ref} id="impact" className="relative px-6 py-24 md:py-32">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.03] blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div
          className={`mb-16 text-center transition-all duration-700 ${
            isInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <p className="mb-3 text-xs font-medium tracking-wider text-primary uppercase">
            Global Impact
          </p>
          <h2 className="font-mono text-3xl font-bold text-foreground md:text-5xl text-balance">
            The Numbers Demand Action
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            These are not abstract statistics. They represent real communities
            left behind by broken health infrastructure.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={stat.source}
              className={`group relative overflow-hidden rounded-xl border border-border/50 bg-card/40 p-8 text-center backdrop-blur-md transition-all duration-700 hover:border-primary/40 hover:bg-card/60 hover:shadow-[0_0_50px_rgba(220,38,38,0.08),inset_0_1px_0_rgba(255,255,255,0.05)] ${
                isInView
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/[0.04] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative z-10">
                <div className="font-mono text-4xl font-bold text-primary drop-shadow-[0_0_15px_rgba(220,38,38,0.3)] md:text-5xl">
                  <AnimatedCounter
                    end={stat.value}
                    suffix={stat.suffix}
                    shouldStart={isInView}
                  />
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {stat.description}
                </p>
                <p className="mt-4 text-xs text-primary/60">{stat.source}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
