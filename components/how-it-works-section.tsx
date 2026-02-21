"use client"

import { useRef } from "react"
import {
  Cpu,
  BrainCircuit,
  Link2,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react"
import { useInView } from "@/hooks/use-in-view"

const steps = [
  {
    icon: Cpu,
    title: "Arduino Sensor",
    description:
      "IoT biosensors deployed in the field collect environmental and biological data in real time.",
  },
  {
    icon: BrainCircuit,
    title: "AI Detection",
    description:
      "Machine learning models analyze sensor data to identify disease signatures and anomalies instantly.",
  },
  {
    icon: Link2,
    title: "Blockchain Record",
    description:
      "Verified detections are cryptographically sealed on-chain, creating an immutable audit trail.",
  },
  {
    icon: LayoutDashboard,
    title: "Real-Time Dashboard",
    description:
      "Stakeholders access live outbreak maps and verified alerts through a transparent dashboard.",
  },
]

export function HowItWorksSection() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { threshold: 0.1 })

  return (
    <section
      ref={ref}
      id="how-it-works"
      className="relative px-6 py-24 md:py-32"
    >
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div
          className={`mb-16 text-center transition-all duration-700 ${
            isInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <p className="mb-3 text-xs font-medium tracking-wider text-primary uppercase">
            How It Works
          </p>
          <h2 className="font-mono text-3xl font-bold text-foreground md:text-5xl text-balance">
            From Sensor to On-Chain Truth
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            A four-stage pipeline that transforms raw biological signals into
            verified, immutable health intelligence.
          </p>
        </div>

        {/* Steps grid with connectors */}
        <div className="grid gap-6 md:grid-cols-4">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="relative flex flex-col items-center text-center"
            >
              <div
                className={`w-full transition-all duration-700 ${
                  isInView
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                }`}
                style={{ transitionDelay: `${i * 200}ms` }}
              >
                {/* Step number */}
                <span className="mb-3 block font-mono text-xs text-primary/60">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Icon */}
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-xl border border-primary/20 bg-card/40 backdrop-blur-md shadow-[0_0_20px_rgba(220,38,38,0.06)] transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_35px_rgba(220,38,38,0.15)] hover:bg-card/60">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>

                <h3 className="mb-2 font-mono text-base font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>

              {/* Connector arrow */}
              {i < steps.length - 1 && (
                <div className="absolute -right-3 top-16 hidden md:block">
                  <ChevronRight className="h-5 w-5 text-primary/30" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Horizontal connector line for desktop */}
        <div className="mx-auto mt-0 hidden max-w-3xl md:block">
          <div className="relative h-px">
            <div
              className={`absolute inset-0 bg-gradient-to-r from-primary/40 via-primary/20 to-primary/40 transition-all duration-1000 ${
                isInView ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
              }`}
              style={{ transitionDelay: "800ms" }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
