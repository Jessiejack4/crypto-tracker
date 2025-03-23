"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, DollarSign, BarChart2, AlertCircle, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getGlobalMarketData } from "@/lib/api"
import { formatCurrency, formatPercentage, formatNumber } from "@/lib/utils"

// Mock data for fallback
const MOCK_MARKET_DATA = {
  total_market_cap: {
    usd: 2500000000000,
  },
  total_volume: {
    usd: 150000000000,
  },
  market_cap_percentage: {
    btc: 45,
    eth: 18,
  },
  market_cap_change_percentage_24h_usd: 2.5,
  active_cryptocurrencies: 10000,
  markets: 600,
}

export function MarketOverview() {
  const [marketData, setMarketData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getGlobalMarketData()

        if (data) {
          setMarketData(data)
        } else {
          console.error("API did not return valid market data")
          setError("Unable to load market data. Using fallback data.")
          setMarketData(MOCK_MARKET_DATA)
        }
      } catch (error) {
        console.error("Failed to fetch market data:", error)
        setError("Unable to load market data. Using fallback data.")
        setMarketData(MOCK_MARKET_DATA)
      } finally {
        setLoading(false)
      }
    }

    fetchMarketData()
  }, [retryCount])

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  if (loading) {
    return (
      <Card className="dark:bg-zinc-900/30 dark:border-zinc-800/50 dark:shadow-dark-card animate-pulse">
        <CardHeader>
          <Skeleton className="h-8 w-64 dark:bg-zinc-800/70" />
          <Skeleton className="h-4 w-32 dark:bg-zinc-800/70" />
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-2">
              <Skeleton className="h-4 w-24 dark:bg-zinc-800/70" />
              <Skeleton className="h-8 w-32 dark:bg-zinc-800/70" />
              <Skeleton className="h-4 w-16 dark:bg-zinc-800/70" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!marketData) {
    return (
      <Alert variant="destructive" className="dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-200">
        <AlertCircle className="h-4 w-4 dark:text-red-300" />
        <AlertDescription className="dark:text-red-200">Failed to load market data</AlertDescription>
      </Alert>
    )
  }

  const marketCapChange = marketData.market_cap_change_percentage_24h_usd
  const isMarketUp = marketCapChange > 0

  return (
    <Card className="border dark:border-zinc-800/50 transition-all hover:shadow-md dark:shadow-dark-card dark:hover:shadow-dark-card-hover overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between bg-muted/30 dark:bg-zinc-800/30 dark:border-b dark:border-zinc-800/50">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary dark:text-blue-400 dark:animate-pulse-glow-dark" />
            <span className="dark:text-white dark:font-bold">Market Overview</span>
          </CardTitle>
          <CardDescription className="dark:text-zinc-400">Global cryptocurrency market statistics</CardDescription>
        </div>
        {error && (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 hover:shadow-glow-primary dark:bg-zinc-800/70 dark:border-zinc-700/50 dark:text-zinc-200 dark:hover:shadow-dark-glow"
            onClick={handleRetry}
          >
            <RefreshCw className="h-4 w-4 dark:text-zinc-300" /> Refresh
          </Button>
        )}
      </CardHeader>
      <CardContent className="dark:bg-dark-gradient-card">
        {error && (
          <Alert variant="warning" className="mb-4 dark:bg-amber-900/20 dark:border-amber-800/50 dark:text-amber-200">
            <AlertCircle className="h-4 w-4 dark:text-amber-300" />
            <AlertDescription className="dark:text-amber-200">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div
            className={`space-y-1 p-4 rounded-lg ${
              isMarketUp
                ? "bg-green-500/5 dark:bg-dark-gradient-green dark:shadow-dark-glow-green"
                : "bg-red-500/5 dark:bg-dark-gradient-red dark:shadow-dark-glow-red"
            }`}
          >
            <p className="text-sm font-medium text-muted-foreground dark:text-zinc-300 flex items-center gap-1">
              <DollarSign className="h-4 w-4 dark:text-zinc-200" /> Total Market Cap
            </p>
            <p className="text-2xl font-bold dark:text-white">{formatCurrency(marketData.total_market_cap.usd)}</p>
            <p
              className={`text-sm flex items-center ${
                isMarketUp ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"
              }`}
            >
              {isMarketUp ? (
                <TrendingUp
                  className={`mr-1 h-4 w-4 ${
                    isMarketUp ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"
                  }`}
                />
              ) : (
                <TrendingDown
                  className={`mr-1 h-4 w-4 ${
                    isMarketUp ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"
                  }`}
                />
              )}
              {formatPercentage(marketCapChange)}
            </p>
          </div>

          <div className="space-y-1 p-4 rounded-lg bg-blue-500/5 dark:bg-dark-gradient-highlight dark:shadow-dark-glow">
            <p className="text-sm font-medium text-muted-foreground dark:text-zinc-300 flex items-center gap-1">
              <BarChart2 className="h-4 w-4 text-blue-500 dark:text-blue-400" /> 24h Volume
            </p>
            <p className="text-2xl font-bold dark:text-white">{formatCurrency(marketData.total_volume.usd)}</p>
            <p className="text-sm text-muted-foreground dark:text-zinc-400">
              {((marketData.total_volume.usd / marketData.total_market_cap.usd) * 100).toFixed(2)}% of market cap
            </p>
          </div>

          <div className="space-y-1 p-4 rounded-lg bg-amber-500/5 dark:bg-dark-gradient-amber dark:shadow-dark-glow-amber">
            <p className="text-sm font-medium text-muted-foreground dark:text-zinc-300">BTC Dominance</p>
            <p className="text-2xl font-bold text-amber-500 dark:text-amber-400">
              {formatPercentage(marketData.market_cap_percentage.btc)}
            </p>
            <p className="text-sm text-muted-foreground dark:text-zinc-400">
              ETH: {formatPercentage(marketData.market_cap_percentage.eth)}
            </p>
          </div>

          <div className="space-y-1 p-4 rounded-lg bg-purple-500/5 dark:bg-dark-gradient-purple dark:shadow-dark-glow-purple">
            <p className="text-sm font-medium text-muted-foreground dark:text-zinc-300">Active Cryptocurrencies</p>
            <p className="text-2xl font-bold dark:text-white">{formatNumber(marketData.active_cryptocurrencies)}</p>
            <p className="text-sm text-muted-foreground dark:text-zinc-400">
              Markets: {formatNumber(marketData.markets)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

