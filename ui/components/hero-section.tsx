"use client"

import Link from "next/link"
import { SensorDevice } from "@/components/sensor-device"
import { ArrowRight, ExternalLink } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-16">
      {/* Background light beams */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 h-[700px] w-[2px] -translate-x-1/2 bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />
        <div className="absolute top-0 left-1/3 h-[550px] w-[1px] -translate-x-1/2 rotate-[10deg] bg-gradient-to-b from-primary/15 via-transparent to-transparent" />
        <div className="absolute top-0 left-2/3 h-[550px] w-[1px] -translate-x-1/2 -rotate-[10deg] bg-gradient-to-b from-primary/15 via-transparent to-transparent" />
        {/* Radial glow */}
        <div className="absolute top-1/4 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.04] blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        {/* Kicker */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary shadow-[0_0_6px_rgba(220,38,38,0.6)]" />
          <span className="text-xs font-medium tracking-wider text-primary uppercase">
            Blockchain-Verified Health Intelligence
          </span>
        </div>

        {/* 3D Device */}
        <SensorDevice />

        {/* Headline */}
        <h1 className="font-mono text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl text-balance">
          Real-Time Disease Detection.{" "}
          <span className="text-primary drop-shadow-[0_0_20px_rgba(220,38,38,0.3)]">
            Verified On-Chain.
          </span>
        </h1>

        {/* Subtext */}
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Combining IoT biosensors with blockchain immutability to deliver
          instant, tamper-proof outbreak verification for governments, NGOs,
          and healthcare providers worldwide.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/hospital-operations"
            className="group flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:shadow-[0_0_35px_rgba(220,38,38,0.35)] hover:brightness-110"
          >
            Hospital Dashboard
            <ExternalLink className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/ngo-governments"
            className="group flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-6 py-3 text-sm font-semibold text-primary backdrop-blur-sm transition-all duration-300 hover:bg-primary/10 hover:shadow-[0_0_25px_rgba(220,38,38,0.15)]"
          >
            {"NGO & Government Portal"}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex h-8 w-5 items-start justify-center rounded-full border border-muted-foreground/30 p-1">
          <div className="h-2 w-1 animate-bounce rounded-full bg-primary/60" />
        </div>
      </div>
    </section>
  )
}
