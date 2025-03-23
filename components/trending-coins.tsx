"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowUp, ArrowDown, TrendingUp, ExternalLink, AlertCircle, RefreshCw, BarChart2, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { getTrendingCoins, getTopCryptocurrencies } from "@/lib/api"
import { formatPercentage, formatCurrency } from "@/lib/utils"

// Mock trending coins for fallback
const MOCK_TRENDING_COINS = [
  {
    item: {
      id: "bitcoin",
      name: "Bitcoin",
      symbol: "BTC",
      market_cap_rank: 1,
      small: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
      price_change_percentage_24h: { usd: 2.5 },
    },
  },
  // ... other mock data
]

// Mock data for top cryptocurrencies
const MOCK_TOP_CRYPTOCURRENCIES = [
  {
    id: "bitcoin",
    symbol: "btc",
    name: "Bitcoin",
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    current_price: 50000,
    market_cap: 950000000000,
    market_cap_rank: 1,
    total_volume: 30000000000,
    price_change_percentage_24h: 2.5,
  },
  // ... other mock data
]

// Mock data for new coins
const MOCK_NEW_COINS = [
  {
    id: "new-coin-1",
    symbol: "new1",
    name: "NewCoin Protocol",
    image: "https://assets.coingecko.com/coins/images/24383/small/apecoin.jpg",
    market_cap_rank: 120,
    current_price: 0.05,
    price_change_percentage_24h: 15.3,
    total_volume: 5000000,
  },
  // ... other mock data
]

interface TrendingCoinsProps {
  expanded?: boolean
}

function TrendingCoins({ expanded = false }: TrendingCoinsProps) {
  const [trendingCoins, setTrendingCoins] = useState<any[]>([])
  const [topCoins, setTopCoins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [activeTab, setActiveTab] = useState("trending")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch trending coins
        const trendingData = await getTrendingCoins()

        // Fetch top 100 coins for more comprehensive data
        const topCoinsData = await getTopCryptocurrencies(100)

        // Validate the trending data structure
        if (trendingData && trendingData.coins && Array.isArray(trendingData.coins)) {
          // Limit the number of coins to reduce rendering load
          const limit = expanded ? 15 : 5
          setTrendingCoins(trendingData.coins.slice(0, limit))
        } else {
          console.error("Invalid trending coins data structure:", trendingData)
          setError("Using fallback data due to API issues.")
          // Use mock data
          setTrendingCoins(MOCK_TRENDING_COINS.slice(0, expanded ? 15 : 5))
        }

        // Validate the top coins data structure
        if (Array.isArray(topCoinsData) && topCoinsData.length > 0) {
          setTopCoins(topCoinsData)
        } else {
          console.error("Invalid top coins data structure:", topCoinsData)
          setError("Using fallback data for top coins due to API issues.")
          // Use mock data
          setTopCoins(MOCK_TOP_CRYPTOCURRENCIES)
        }
      } catch (error) {
        console.error("Failed to fetch coin data:", error)
        setError("Unable to load coin data. Using fallback data.")
        // Use mock data on error
        setTrendingCoins(MOCK_TRENDING_COINS.slice(0, expanded ? 15 : 5))
        setTopCoins(MOCK_TOP_CRYPTOCURRENCIES)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [expanded, retryCount])

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  // Prepare categorized data
  const gainers = [...topCoins]
    .filter((coin) => coin.price_change_percentage_24h > 0)
    .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
    .slice(0, 5)

  const losers = [...topCoins]
    .filter((coin) => coin.price_change_percentage_24h < 0)
    .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
    .slice(0, 5)

  const hotCoins = [...topCoins].sort((a, b) => b.total_volume - a.total_volume).slice(0, 5)

  // For new coins, we'll use mock data since the API doesn't provide this information
  const newCoins = MOCK_NEW_COINS

  // Render a coin item
  const renderCoinItem = (coin: any, index: number, category: string) => {
    // Handle different data structures
    const isTrending = category === "trending"

    const id = isTrending ? coin.item.id : coin.id
    const name = isTrending ? coin.item.name : coin.name
    const symbol = isTrending ? coin.item.symbol : coin.symbol
    const image = isTrending ? coin.item.small : coin.image
    const rank = isTrending ? coin.item.market_cap_rank : coin.market_cap_rank
    const priceChange = isTrending ? coin.item.price_change_percentage_24h?.usd : coin.price_change_percentage_24h
    const price = isTrending ? null : coin.current_price

    return (
      <Link
        key={id}
        href={`/coin/${id}`}
        className="flex items-center gap-4 p-3 rounded-md hover:bg-muted transition-all hover:shadow-sm dark:hover:bg-zinc-800/50 dark:hover:border-zinc-700/50 dark:hover:shadow-dark-glow-sm group"
      >
        <div className="flex-shrink-0 relative">
          <div className="relative overflow-hidden rounded-full dark:border dark:border-zinc-700/50 dark:group-hover:border-zinc-600/50 dark:group-hover:shadow-dark-glow-sm">
            <Image
              src={image || "/placeholder.svg?height=32&width=32"}
              alt={name}
              width={32}
              height={32}
              className="rounded-full object-contain dark:group-hover:scale-110 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 rounded-full dark:bg-gradient-to-br dark:from-transparent dark:to-black/20 dark:group-hover:opacity-0 transition-opacity"></div>
          </div>
          <div className="absolute -top-1 -right-1 bg-primary dark:bg-blue-500 text-primary-foreground dark:text-zinc-900 text-xs rounded-full w-4 h-4 flex items-center justify-center dark:shadow-dark-glow-sm dark:group-hover:shadow-dark-glow">
            {rank || "?"}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium dark:text-white dark:group-hover:text-blue-400 transition-colors truncate">
            {name}
          </div>
          <div className="text-sm text-muted-foreground dark:text-zinc-400 dark:group-hover:text-zinc-300 transition-colors">
            {symbol.toUpperCase()}
          </div>
        </div>
        {price !== null && (
          <div className="text-right shrink-0 pr-1 dark:text-zinc-200 dark:font-medium">{formatCurrency(price)}</div>
        )}
        <div
          className={`text-sm flex items-center justify-end shrink-0 ${
            priceChange > 0
              ? "text-green-500 dark:text-green-400 dark:group-hover:text-green-300"
              : priceChange < 0
                ? "text-red-500 dark:text-red-400 dark:group-hover:text-red-300"
                : "dark:text-zinc-400"
          }`}
        >
          {priceChange > 0 ? (
            <ArrowUp className="mr-1 h-3 w-3" />
          ) : priceChange < 0 ? (
            <ArrowDown className="mr-1 h-3 w-3" />
          ) : null}
          {formatPercentage(priceChange || 0)}
        </div>
        {!isTrending && category === "hot" && (
          <div className="text-xs text-muted-foreground dark:text-zinc-500 hidden md:block">
            {formatCurrency(coin.total_volume)}
          </div>
        )}
      </Link>
    )
  }

  // Render a category section
  const renderCategorySection = (title: string, icon: React.ReactNode, coins: any[], category: string) => {
    if (coins.length === 0) {
      return (
        <div className="text-center py-4">
          <p className="text-muted-foreground dark:text-zinc-500">No coins available</p>
        </div>
      )
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <h3 className="font-medium dark:text-white dark:font-semibold">{title}</h3>
        </div>
        <div className="space-y-1">{coins.map((coin, index) => renderCoinItem(coin, index, category))}</div>
      </div>
    )
  }

  return (
    <Card className="border dark:border-zinc-800/50 transition-all hover:shadow-md dark:shadow-dark-card dark:hover:shadow-dark-card-hover overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between bg-muted/30 dark:bg-zinc-800/30 dark:border-b dark:border-zinc-800/50">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary dark:text-blue-400 dark:animate-pulse-glow-dark" />
          <span className="dark:text-white dark:font-bold">Cryptocurrency Trends</span>
        </CardTitle>
        <div className="flex items-center gap-2">
          {error && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 dark:bg-zinc-800/70 dark:border-zinc-700/50 dark:text-zinc-200 dark:hover:shadow-dark-glow"
              onClick={handleRetry}
            >
              <RefreshCw className="h-4 w-4 dark:text-zinc-300" /> Retry
            </Button>
          )}
          {!expanded && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="dark:bg-zinc-800/50 dark:border-zinc-700/50 dark:text-zinc-200 dark:hover:shadow-dark-glow group"
            >
              <Link href="/trending" className="group flex items-center gap-1">
                View All <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="dark:bg-dark-gradient-card">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: expanded ? 10 : 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full dark:bg-zinc-800/70" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24 dark:bg-zinc-800/70" />
                  <Skeleton className="h-4 w-16 dark:bg-zinc-800/70" />
                </div>
                <Skeleton className="h-8 w-16 dark:bg-zinc-800/70" />
              </div>
            ))}
          </div>
        ) : error && trendingCoins.length === 0 && topCoins.length === 0 ? (
          <Alert variant="destructive" className="dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-200">
            <AlertCircle className="h-4 w-4 dark:text-red-300" />
            <AlertDescription className="dark:text-red-200">{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            {error && (
              <Alert variant="warning" className="dark:bg-amber-900/20 dark:border-amber-800/50 dark:text-amber-200">
                <AlertCircle className="h-4 w-4 dark:text-amber-300" />
                <AlertDescription className="dark:text-amber-200">{error}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 grid grid-cols-2 md:grid-cols-5 bg-muted/50 dark:bg-zinc-800/50 p-1 rounded-md dark:border dark:border-zinc-700/50">
                <TabsTrigger
                  value="trending"
                  className="data-[state=active]:shadow-glow-primary data-[state=active]:text-primary data-[state=active]:font-medium dark:text-zinc-400 dark:data-[state=active]:text-blue-400 dark:data-[state=active]:shadow-dark-glow dark:data-[state=active]:bg-zinc-900/70"
                >
                  Trending
                </TabsTrigger>
                <TabsTrigger
                  value="gainers"
                  className="data-[state=active]:shadow-glow-green data-[state=active]:text-green-500 data-[state=active]:font-medium dark:text-zinc-400 dark:data-[state=active]:text-green-400 dark:data-[state=active]:shadow-dark-glow-green dark:data-[state=active]:bg-zinc-900/70"
                >
                  Gainers
                </TabsTrigger>
                <TabsTrigger
                  value="losers"
                  className="data-[state=active]:shadow-glow-red data-[state=active]:text-red-500 data-[state=active]:font-medium dark:text-zinc-400 dark:data-[state=active]:text-red-400 dark:data-[state=active]:shadow-dark-glow-red dark:data-[state=active]:bg-zinc-900/70"
                >
                  Losers
                </TabsTrigger>
                <TabsTrigger
                  value="hot"
                  className="data-[state=active]:shadow-glow-primary data-[state=active]:text-blue-500 data-[state=active]:font-medium dark:text-zinc-400 dark:data-[state=active]:text-blue-400 dark:data-[state=active]:shadow-dark-glow dark:data-[state=active]:bg-zinc-900/70"
                >
                  Hot
                </TabsTrigger>
                <TabsTrigger
                  value="new"
                  className="data-[state=active]:shadow-glow-purple data-[state=active]:text-purple-500 data-[state=active]:font-medium dark:text-zinc-400 dark:data-[state=active]:text-purple-400 dark:data-[state=active]:shadow-dark-glow-purple dark:data-[state=active]:bg-zinc-900/70"
                >
                  New
                </TabsTrigger>
              </TabsList>

              <TabsContent value="trending" className="mt-0">
                <div className="space-y-4">
                  {trendingCoins.map((item, index) => renderCoinItem(item, index, "trending"))}
                </div>
              </TabsContent>

              <TabsContent value="gainers" className="mt-0">
                {renderCategorySection(
                  "Biggest Gainers (24h)",
                  <ArrowUp className="h-4 w-4 text-green-500 dark:text-green-400" />,
                  gainers,
                  "gainers",
                )}
              </TabsContent>

              <TabsContent value="losers" className="mt-0">
                {renderCategorySection(
                  "Biggest Losers (24h)",
                  <ArrowDown className="h-4 w-4 text-red-500 dark:text-red-400" />,
                  losers,
                  "losers",
                )}
              </TabsContent>

              <TabsContent value="hot" className="mt-0">
                {renderCategorySection(
                  "Highest Volume (24h)",
                  <BarChart2 className="h-4 w-4 text-blue-500 dark:text-blue-400" />,
                  hotCoins,
                  "hot",
                )}
              </TabsContent>

              <TabsContent value="new" className="mt-0">
                {renderCategorySection(
                  "Recently Added",
                  <Calendar className="h-4 w-4 text-purple-500 dark:text-purple-400" />,
                  newCoins,
                  "new",
                )}
              </TabsContent>
            </Tabs>

            {!expanded && (
              <div className="pt-2 text-center">
                <Button
                  asChild
                  variant="outline"
                  className="dark:bg-zinc-800/70 dark:border-zinc-700/50 dark:text-zinc-200 dark:hover:shadow-dark-glow group"
                >
                  <Link href="/trending" className="flex items-center">
                    View All Categories{" "}
                    <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TrendingCoins

