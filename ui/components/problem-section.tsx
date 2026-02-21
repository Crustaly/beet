"use client"

import { useRef } from "react"
import { AlertTriangle, EyeOff, HeartCrack } from "lucide-react"
import { useInView } from "@/hooks/use-in-view"

const problems = [
  {
    icon: AlertTriangle,
    title: "Slow Outbreak Response",
    description:
      "Health agencies rely on manual reporting, causing delays of weeks before outbreaks are formally identified and resources deployed.",
    stat: "14 Days",
    statLabel: "Average detection delay",
  },
  {
    icon: EyeOff,
    title: "Hidden & Manipulated Data",
    description:
      "Health data passes through multiple intermediaries, creating opportunities for suppression, alteration, or political manipulation.",
    stat: "40%",
    statLabel: "Of data altered in transit",
  },
  {
    icon: HeartCrack,
    title: "Rising Preventable Deaths",
    description:
      "Millions die annually from diseases that could have been contained with earlier detection and transparent, real-time data sharing.",
    stat: "5M+",
    statLabel: "Preventable deaths yearly",
  },
]

export function ProblemSection() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { threshold: 0.1 })

  return (
    <section ref={ref} className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div
          className={`mb-16 text-center transition-all duration-700 ${
            isInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <p className="mb-3 text-xs font-medium tracking-wider text-primary uppercase">
            The Crisis
          </p>
          <h2 className="font-mono text-3xl font-bold text-foreground md:text-5xl text-balance">
            The World is Flying Blind
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Global health infrastructure was not built for the speed of modern
            pandemics. Outdated systems fail the people who need them most.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {problems.map((problem, i) => (
            <div
              key={problem.title}
              className={`group relative overflow-hidden rounded-xl border border-border/50 bg-card/40 p-8 backdrop-blur-md transition-all duration-700 hover:border-primary/40 hover:bg-card/60 hover:shadow-[0_0_50px_rgba(220,38,38,0.08),inset_0_1px_0_rgba(255,255,255,0.05)] ${
                isInView
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              {/* Glow overlay on hover */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.06] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative z-10">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 shadow-[0_0_15px_rgba(220,38,38,0.1)] transition-shadow duration-300 group-hover:shadow-[0_0_25px_rgba(220,38,38,0.2)]">
                  <problem.icon className="h-6 w-6 text-primary" />
                </div>

                <h3 className="mb-2 font-mono text-lg font-semibold text-foreground">
                  {problem.title}
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                  {problem.description}
                </p>

                <div className="border-t border-border/50 pt-4">
                  <span className="font-mono text-2xl font-bold text-primary drop-shadow-[0_0_10px_rgba(220,38,38,0.3)]">
                    {problem.stat}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {problem.statLabel}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
