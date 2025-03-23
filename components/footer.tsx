import { BarChart2, GitlabIcon as GitHub, Twitter } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t py-8 md:py-12 dark:border-zinc-800/50 bg-muted/20 dark:bg-zinc-900/20 dark:shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.3)] footer">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary dark:text-blue-400 dark:animate-pulse-glow-dark" />
            <span className="font-semibold dark:text-white dark:font-bold">CryptoTracker</span>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors dark:text-zinc-400 dark:hover:text-blue-400"
            >
              Dashboard
            </Link>
            <Link
              href="/market"
              className="text-sm text-muted-foreground hover:text-primary transition-colors dark:text-zinc-400 dark:hover:text-blue-400"
            >
              Market
            </Link>
            <Link
              href="/trending"
              className="text-sm text-muted-foreground hover:text-primary transition-colors dark:text-zinc-400 dark:hover:text-blue-400"
            >
              Trending
            </Link>
            <Link
              href="/watchlist"
              className="text-sm text-muted-foreground hover:text-primary transition-colors dark:text-zinc-400 dark:hover:text-blue-400"
            >
              Watchlist
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors dark:text-zinc-400 dark:hover:text-blue-400 dark:hover:shadow-dark-glow-sm"
            >
              <GitHub className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors dark:text-zinc-400 dark:hover:text-blue-400 dark:hover:shadow-dark-glow-sm"
            >
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t dark:border-zinc-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground dark:text-zinc-500">
            © {new Date().getFullYear()} CryptoTracker. All rights reserved.
          </div>
          <div className="text-xs text-muted-foreground dark:text-zinc-500">
            Cryptocurrency data provided for educational purposes only. Not financial advice.
          </div>
        </div>
      </div>
    </footer>
  )
}

