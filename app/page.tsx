import { Suspense } from "react"
import type { Metadata } from "next"
import dynamic from "next/dynamic"
import { MarketOverview } from "@/components/market-overview"
import { WatchlistPreview } from "@/components/watchlist-preview"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import { DarkModeFab } from "@/components/dark-mode-fab"

// Dynamically import components that are not needed for initial render
const TopCryptocurrencies = dynamic(() => import("@/components/top-cryptocurrencies"), {
  loading: () => <TableSkeleton />,
  ssr: true,
})

const TrendingCoins = dynamic(() => import("@/components/trending-coins"), {
  ssr: true,
})

export const metadata: Metadata = {
  title: "Crypto Tracker - Real-time Cryptocurrency Prices",
  description: "Track real-time cryptocurrency prices, market cap, volume, and more with our intuitive dashboard.",
}

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-6 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight dark:text-white dark:font-extrabold dark:bg-gradient-to-r dark:from-blue-400 dark:to-blue-600 dark:bg-clip-text dark:text-transparent">
        Cryptocurrency Market
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MarketOverview />
        </div>
        <div>
          <WatchlistPreview />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold dark:text-white dark:font-bold">Top Cryptocurrencies</h2>
        <Suspense fallback={<TableSkeleton />}>
          <TopCryptocurrencies />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TrendingCoins />
        </div>
        <div>{/* Add a news feed or another relevant component here */}</div>
      </div>

      <DarkModeFab />
    </main>
  )
}

