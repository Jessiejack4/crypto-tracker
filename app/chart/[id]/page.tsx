import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCoinData } from "@/lib/api"
import { FullscreenChart } from "@/components/fullscreen-chart"
import { Skeleton } from "@/components/ui/skeleton"

interface ChartPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: ChartPageProps): Promise<Metadata> {
  try {
    const coin = await getCoinData(params.id)
    return {
      title: `${coin.name} (${coin.symbol.toUpperCase()}) Chart - Crypto Tracker`,
      description: `Interactive price chart for ${coin.name}. Analyze historical price data, trends, and market movements.`,
    }
  } catch (error) {
    return {
      title: "Cryptocurrency Chart - Crypto Tracker",
      description: "Interactive cryptocurrency price chart with advanced analysis tools.",
    }
  }
}

export default async function ChartPage({ params }: ChartPageProps) {
  try {
    const coin = await getCoinData(params.id)

    return (
      <main className="container mx-auto px-4 py-6 space-y-6">
        <Suspense fallback={<Skeleton className="h-[600px] w-full dark:bg-zinc-800/30" />}>
          <FullscreenChart
            coinId={params.id}
            coinName={coin.name}
            coinSymbol={coin.symbol}
            initialPrice={coin.market_data?.current_price?.usd}
          />
        </Suspense>
      </main>
    )
  } catch (error) {
    notFound()
  }
}

