import { Suspense, lazy } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCoinData } from "@/lib/api"
import { CoinHeader } from "@/components/coin-header"
import { CoinSkeleton } from "@/components/ui/coin-skeleton"

// Lazy load components that can be deferred
const CoinChart = lazy(() => import("@/components/coin-chart").then((mod) => ({ default: mod.CoinChart })))
const CoinStats = lazy(() => import("@/components/coin-stats").then((mod) => ({ default: mod.CoinStats })))
const CoinDescription = lazy(() =>
  import("@/components/coin-description").then((mod) => ({ default: mod.CoinDescription })),
)

interface CoinPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: CoinPageProps): Promise<Metadata> {
  try {
    const coin = await getCoinData(params.id)
    return {
      title: `${coin.name} (${coin.symbol.toUpperCase()}) Price - Crypto Tracker`,
      description: `Get the latest ${coin.name} price, market cap, volume, and more. Track ${coin.name} performance in real-time.`,
    }
  } catch (error) {
    return {
      title: "Coin Details - Crypto Tracker",
      description: "Detailed information about this cryptocurrency.",
    }
  }
}

export default async function CoinPage({ params }: CoinPageProps) {
  try {
    const coin = await getCoinData(params.id)

    return (
      <main className="container mx-auto px-4 py-6 space-y-8">
        <Suspense fallback={<CoinSkeleton />}>
          <CoinHeader coin={coin} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Suspense fallback={<div className="h-[400px] w-full bg-card rounded-lg border animate-pulse"></div>}>
                <CoinChart
                  coinId={params.id}
                  coinName={coin.name}
                  coinSymbol={coin.symbol}
                  initialPrice={coin.market_data?.current_price?.usd}
                />
              </Suspense>
            </div>
            <div>
              <Suspense fallback={<div className="h-[400px] w-full bg-card rounded-lg border animate-pulse"></div>}>
                <CoinStats coin={coin} />
              </Suspense>
            </div>
          </div>
          <Suspense fallback={<div className="h-[200px] w-full bg-card rounded-lg border animate-pulse"></div>}>
            <CoinDescription coin={coin} />
          </Suspense>
        </Suspense>
      </main>
    )
  } catch (error) {
    notFound()
  }
}

