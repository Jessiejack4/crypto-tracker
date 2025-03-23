"use client"
import { useState } from "react"
import Link from "next/link"
import { AdvancedPriceChart } from "@/components/advanced-price-chart"
import { Button } from "@/components/ui/button"
import { ExternalLink, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CoinChartProps {
  coinId: string
  coinName?: string
  coinSymbol?: string
  initialPrice?: number
}

export function CoinChart({ coinId, coinName, coinSymbol, initialPrice }: CoinChartProps) {
  const [hasError, setHasError] = useState(false)

  return (
    <div className="relative">
      {hasError && (
        <Alert variant="warning" className="mb-4 dark:bg-amber-900/20 dark:border-amber-800/50 dark:text-amber-200">
          <AlertCircle className="h-4 w-4 dark:text-amber-300" />
          <AlertDescription className="dark:text-amber-200">
            Using simulated chart data. Live data is currently unavailable.
          </AlertDescription>
        </Alert>
      )}

      <AdvancedPriceChart
        coinId={coinId}
        coinName={coinName}
        coinSymbol={coinSymbol || ""}
        initialPrice={initialPrice}
        onError={() => setHasError(true)}
      />

      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="dark:bg-zinc-800/70 dark:border-zinc-700/50 dark:text-zinc-200 dark:hover:shadow-dark-glow-sm group"
        >
          <Link href={`/chart/${coinId}`} className="flex items-center gap-1">
            Full Chart <ExternalLink className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

