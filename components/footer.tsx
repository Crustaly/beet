import Link from "next/link"
import { Activity } from "lucide-react"

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-border/50 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <span className="font-mono text-sm font-bold text-foreground">
              Beet
            </span>
          </Link>

          <div className="flex items-center gap-6">
            {["GitHub", "Contact"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-xs text-muted-foreground transition-colors hover:text-primary"
              >
                {item}
              </a>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            {"Built for a healthier, transparent world."}
          </p>
        </div>
      </div>
    </footer>
  )
}
