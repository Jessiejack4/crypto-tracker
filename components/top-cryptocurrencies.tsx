"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowUp, ArrowDown, Star, AlertCircle, RefreshCw, ArrowRight } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWatchlist } from "@/hooks/use-watchlist"
import { getTopCryptocurrencies } from "@/lib/api"
import { formatCurrency, formatPercentage } from "@/lib/utils"

// Mock data for fallback
const MOCK_CRYPTOCURRENCIES = [
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
  {
    id: "ethereum",
    symbol: "eth",
    name: "Ethereum",
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    current_price: 3000,
    market_cap: 350000000000,
    market_cap_rank: 2,
    total_volume: 15000000000,
    price_change_percentage_24h: 1.8,
  },
  {
    id: "binancecoin",
    symbol: "bnb",
    name: "BNB",
    image: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
    current_price: 300,
    market_cap: 50000000000,
    market_cap_rank: 3,
    total_volume: 2000000000,
    price_change_percentage_24h: 0.5,
  },
  {
    id: "ripple",
    symbol: "xrp",
    name: "XRP",
    image: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
    current_price: 0.5,
    market_cap: 25000000000,
    market_cap_rank: 4,
    total_volume: 1000000000,
    price_change_percentage_24h: -1.2,
  },
  {
    id: "solana",
    symbol: "sol",
    name: "Solana",
    image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
    current_price: 100,
    market_cap: 40000000000,
    market_cap_rank: 5,
    total_volume: 2500000000,
    price_change_percentage_24h: 3.7,
  },
]

function TopCryptocurrencies() {
  const [cryptocurrencies, setCryptocurrencies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist()

  useEffect(() => {
    const fetchCryptocurrencies = async () => {
      try {
        setLoading(true)
        setError(null)
        // Limit to 10 cryptocurrencies to reduce API load
        const data = await getTopCryptocurrencies(10)

        // Check if data is an array before setting state
        if (Array.isArray(data) && data.length > 0) {
          setCryptocurrencies(data)
        } else {
          console.error("API did not return a valid array:", data)
          setError("Received invalid data format from the API. Using fallback data.")
          // Set fallback data
          setCryptocurrencies(MOCK_CRYPTOCURRENCIES)
        }
      } catch (error) {
        console.error("Failed to fetch top cryptocurrencies:", error)
        setError("Unable to load cryptocurrency data. Using fallback data.")
        // Set fallback data on error
        setCryptocurrencies(MOCK_CRYPTOCURRENCIES)
      } finally {
        setLoading(false)
      }
    }

    fetchCryptocurrencies()
  }, [retryCount])

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  const toggleWatchlist = (coinId: string) => {
    if (watchlist.includes(coinId)) {
      removeFromWatchlist(coinId)
    } else {
      addToWatchlist(coinId)
    }
  }

  if (loading) {
    return <Skeleton className="h-[400px] w-full dark:bg-zinc-800/30" />
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center justify-between">
          <Alert variant="warning" className="dark:bg-amber-900/20 dark:border-amber-800/50 dark:text-amber-200">
            <AlertCircle className="h-4 w-4 dark:text-amber-300" />
            <AlertDescription className="dark:text-amber-200">{error}</AlertDescription>
          </Alert>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 ml-4 dark:bg-zinc-800/70 dark:border-zinc-700/50 dark:text-zinc-200 dark:hover:shadow-dark-glow"
            onClick={handleRetry}
          >
            <RefreshCw className="h-4 w-4 dark:text-zinc-300" /> Retry
          </Button>
        </div>
      )}

      <div className="rounded-lg border bg-card dark:border-zinc-800/50 dark:bg-dark-gradient-card dark:shadow-dark-card dark:hover:shadow-dark-card-hover transition-all overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30 dark:bg-zinc-800/50 dark:border-b dark:border-zinc-800/50">
            <TableRow className="dark:hover:bg-transparent">
              <TableHead className="w-10 dark:text-zinc-400"></TableHead>
              <TableHead className="dark:text-zinc-400">Name</TableHead>
              <TableHead className="text-right dark:text-zinc-400">Price</TableHead>
              <TableHead className="text-right dark:text-zinc-400">24h %</TableHead>
              <TableHead className="text-right hidden md:table-cell dark:text-zinc-400">Market Cap</TableHead>
              <TableHead className="text-right hidden md:table-cell dark:text-zinc-400">Volume (24h)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cryptocurrencies.map((crypto) => (
              <TableRow
                key={crypto.id}
                className="hover:bg-muted/30 dark:hover:bg-zinc-800/30 dark:border-zinc-800/50 transition-colors group"
              >
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleWatchlist(crypto.id)}
                    className="dark:hover:bg-zinc-800/70 dark:hover:text-zinc-200"
                  >
                    <Star
                      className={`h-4 w-4 transition-all ${
                        watchlist.includes(crypto.id)
                          ? "fill-yellow-400 text-yellow-400 animate-pulse dark:fill-yellow-300 dark:text-yellow-300 dark:shadow-dark-glow-amber"
                          : "text-muted-foreground group-hover:text-yellow-400/70 dark:text-zinc-500 dark:group-hover:text-yellow-300/70"
                      }`}
                    />
                    <span className="sr-only">
                      {watchlist.includes(crypto.id) ? "Remove from watchlist" : "Add to watchlist"}
                    </span>
                  </Button>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/coin/${crypto.id}`}
                    className="flex items-center gap-2 hover:underline dark:text-zinc-200 dark:hover:text-blue-400 transition-colors"
                  >
                    <div className="relative overflow-hidden rounded-full dark:border dark:border-zinc-700/50 dark:group-hover:border-zinc-600/50 dark:group-hover:shadow-dark-glow-sm">
                      <Image
                        src={crypto.image || "/placeholder.svg?height=24&width=24"}
                        alt={crypto.name}
                        width={24}
                        height={24}
                        className="rounded-full dark:group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 rounded-full dark:bg-gradient-to-br dark:from-transparent dark:to-black/20 dark:group-hover:opacity-0 transition-opacity"></div>
                    </div>
                    <span className="font-medium dark:group-hover:text-blue-400 transition-colors">{crypto.name}</span>
                    <span className="text-muted-foreground dark:text-zinc-500">{crypto.symbol.toUpperCase()}</span>
                  </Link>
                </TableCell>
                <TableCell className="text-right font-medium whitespace-nowrap dark:text-zinc-200">
                  {formatCurrency(crypto.current_price)}
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={`flex items-center justify-end whitespace-nowrap ${
                      crypto.price_change_percentage_24h > 0
                        ? "text-green-500 dark:text-green-400"
                        : crypto.price_change_percentage_24h < 0
                          ? "text-red-500 dark:text-red-400"
                          : "dark:text-zinc-400"
                    }`}
                  >
                    {crypto.price_change_percentage_24h > 0 ? (
                      <ArrowUp className="mr-1 h-3 w-3" />
                    ) : crypto.price_change_percentage_24h < 0 ? (
                      <ArrowDown className="mr-1 h-3 w-3" />
                    ) : null}
                    {formatPercentage(crypto.price_change_percentage_24h)}
                  </span>
                </TableCell>
                <TableCell className="text-right hidden md:table-cell dark:text-zinc-400">
                  {formatCurrency(crypto.market_cap)}
                </TableCell>
                <TableCell className="text-right hidden md:table-cell dark:text-zinc-400">
                  {formatCurrency(crypto.total_volume)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="p-4 border-t dark:border-zinc-800/50 text-center dark:bg-zinc-900/30">
          <Button
            asChild
            variant="outline"
            className="group hover:shadow-glow-primary transition-all dark:bg-zinc-800/70 dark:border-zinc-700/50 dark:text-zinc-200 dark:hover:shadow-dark-glow"
          >
            <Link href="/market" className="flex items-center justify-center gap-1">
              View All Cryptocurrencies
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TopCryptocurrencies

