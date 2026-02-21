"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CinematicBackground } from "@/components/cinematic-background"
import { HospitalStatsCards } from "@/components/hospital/stats-cards"
import { SymptomTrendsChart } from "@/components/hospital/symptom-trends"
import { DiseaseSignalsChart } from "@/components/hospital/disease-signals"
import { PatientReportsFeed } from "@/components/hospital/patient-reports"
import { SupplyNeedsSection } from "@/components/hospital/supply-needs"
import { HospitalMapSection } from "@/components/hospital/hospital-map"
import {
  Building2,
  ClipboardList,
  ShieldAlert,
} from "lucide-react"

const sectionNav = [
  { icon: Building2, label: "Clinical Operations", id: "clinical" },
  { icon: ClipboardList, label: "Response Planning", id: "response" },
  { icon: ShieldAlert, label: "Hospital Dashboard", id: "dashboard" },
]

export default function HospitalOperationsPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <CinematicBackground />
      <Navbar />
      <div className="relative z-10 pt-24 pb-12">
        {/* Header */}
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary shadow-[0_0_6px_rgba(220,38,38,0.6)]" />
            <span className="text-xs font-medium tracking-wider text-primary uppercase">
              Live Data
            </span>
          </div>
          <h1 className="font-mono text-3xl font-bold text-foreground md:text-5xl text-balance">
            Hospital{" "}
            <span className="text-primary drop-shadow-[0_0_20px_rgba(220,38,38,0.3)]">
              Operations
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Real-time clinical intelligence, outbreak monitoring, and resource
            planning for healthcare facilities.
          </p>

          {/* Section nav pills */}
          <div className="mt-6 flex flex-wrap gap-2">
            {sectionNav.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex items-center gap-2 rounded-lg border border-border/50 bg-card/40 px-4 py-2 text-sm text-muted-foreground backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:text-primary hover:shadow-[0_0_15px_rgba(220,38,38,0.1)]"
              >
                <s.icon className="h-4 w-4" />
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* Clinical Operations */}
        <section id="clinical" className="mx-auto max-w-7xl px-6 pt-12">
          <h2 className="mb-6 font-mono text-lg font-semibold text-foreground">
            Clinical Operations
          </h2>
          <HospitalStatsCards />
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <SymptomTrendsChart />
            <DiseaseSignalsChart />
          </div>
        </section>

        {/* Hospital Dashboard Map */}
        <section id="dashboard" className="mx-auto max-w-7xl px-6 pt-16">
          <h2 className="mb-6 font-mono text-lg font-semibold text-foreground">
            Hospital Dashboard
          </h2>
          <HospitalMapSection />
        </section>

        {/* Response Planning */}
        <section id="response" className="mx-auto max-w-7xl px-6 pt-16">
          <h2 className="mb-6 font-mono text-lg font-semibold text-foreground">
            Response Planning
          </h2>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <PatientReportsFeed />
            </div>
            <div className="lg:col-span-2">
              <SupplyNeedsSection />
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  )
}
