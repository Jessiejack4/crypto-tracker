import { Suspense } from "react"
import type { Metadata } from "next"
import { WatchlistFull } from "@/components/watchlist-full"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Your Watchlist - Crypto Tracker",
  description: "Track your favorite cryptocurrencies in one place with your personalized watchlist.",
}

export default function WatchlistPage() {
  return (
    <main className="container mx-auto px-4 py-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight dark:text-white dark:font-extrabold dark:bg-gradient-to-r dark:from-blue-400 dark:to-blue-600 dark:bg-clip-text dark:text-transparent">
        Your Watchlist
      </h1>

      <p className="text-muted-foreground dark:text-zinc-400 max-w-3xl">
        Track your favorite cryptocurrencies in one place. Add or remove coins to customize your watchlist.
      </p>

      <Suspense fallback={<Skeleton className="h-[600px] w-full dark:bg-zinc-800/30" />}>
        <WatchlistFull />
      </Suspense>
    </main>
  )
}

