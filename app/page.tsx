import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { ProblemSection } from "@/components/problem-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { ImpactSection } from "@/components/impact-section"
import { Footer } from "@/components/footer"
import { CinematicBackground } from "@/components/cinematic-background"

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background">
      <CinematicBackground />
      <Navbar />
      <div className="relative z-10">
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <ImpactSection />
        <Footer />
      </div>
    </main>
  )
}
