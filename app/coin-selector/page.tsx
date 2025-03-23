import { Suspense } from "react"
import type { Metadata } from "next"
import { CoinSelector } from "@/components/coin-selector"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Add Coins to Watchlist - Crypto Tracker",
  description: "Select cryptocurrencies to add to your watchlist and track their performance.",
}

export default function CoinSelectorPage() {
  return (
    <main className="container mx-auto px-4 py-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight dark:text-white dark:font-extrabold dark:bg-gradient-to-r dark:from-blue-400 dark:to-blue-600 dark:bg-clip-text dark:text-transparent">
        Add Coins to Watchlist
      </h1>

      <p className="text-muted-foreground dark:text-zinc-400 max-w-3xl">
        Select cryptocurrencies to add to your watchlist. You can track their performance and get quick access to their
        details.
      </p>

      <Suspense fallback={<Skeleton className="h-[600px] w-full dark:bg-zinc-800/30" />}>
        <CoinSelector />
      </Suspense>
    </main>
  )
}

