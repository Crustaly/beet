"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CinematicBackground } from "@/components/cinematic-background"
import { AnomalyDetection } from "@/components/ngo/anomaly-detection"
import { OutbreakClusterMap } from "@/components/ngo/outbreak-cluster-map"
import { ForecastHeatmap } from "@/components/ngo/forecast-heatmap"
import { EarlyWarningAlerts } from "@/components/ngo/early-warning-alerts"
import { CityOutbreakTrends } from "@/components/ngo/city-outbreak-trends"
import { RiskLevelIndicators } from "@/components/ngo/risk-level-indicators"
import { InterventionRecommendations } from "@/components/ngo/intervention-recommendations"
import { FundingPrioritization } from "@/components/ngo/funding-prioritization"
import { GlobalOutbreakMap } from "@/components/ngo/global-outbreak-map"
import {
  Radar,
  TrendingUp,
  BrainCircuit,
} from "lucide-react"

const sectionNav = [
  { icon: Radar, label: "Outbreak Detection", id: "detection" },
  { icon: TrendingUp, label: "Risk Forecasts", id: "forecasts" },
  { icon: BrainCircuit, label: "AI Insights", id: "insights" },
]

export default function NgoGovernmentsPage() {
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
              Intelligence Feed
            </span>
          </div>
          <h1 className="font-mono text-3xl font-bold text-foreground md:text-5xl text-balance">
            NGO &{" "}
            <span className="text-primary drop-shadow-[0_0_20px_rgba(220,38,38,0.3)]">
              Government Portal
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            AI-powered outbreak intelligence, risk forecasting, and
            intervention planning for policy makers and humanitarian
            organizations.
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

        {/* Outbreak Detection */}
        <section id="detection" className="mx-auto max-w-7xl px-6 pt-12">
          <h2 className="mb-6 font-mono text-lg font-semibold text-foreground">
            Outbreak Detection
          </h2>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <GlobalOutbreakMap />
            </div>
            <div>
              <EarlyWarningAlerts />
            </div>
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <OutbreakClusterMap />
            <AnomalyDetection />
          </div>
        </section>

        {/* Risk Forecasts */}
        <section id="forecasts" className="mx-auto max-w-7xl px-6 pt-16">
          <h2 className="mb-6 font-mono text-lg font-semibold text-foreground">
            Risk Forecasts
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <ForecastHeatmap />
            <CityOutbreakTrends />
          </div>
          <div className="mt-6">
            <RiskLevelIndicators />
          </div>
        </section>

        {/* AI Insights */}
        <section id="insights" className="mx-auto max-w-7xl px-6 pt-16">
          <h2 className="mb-6 font-mono text-lg font-semibold text-foreground">
            AI Insights
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <InterventionRecommendations />
            <FundingPrioritization />
          </div>
        </section>
      </div>
      <Footer />
    </main>
  )
}
