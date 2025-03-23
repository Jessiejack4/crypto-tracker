"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowUp, ArrowDown, Star, AlertCircle, RefreshCw, Plus, Trash2, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWatchlist } from "@/hooks/use-watchlist"
import { getWatchlistCoins } from "@/lib/api"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export function WatchlistFull() {
  const [coins, setCoins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [removingCoin, setRemovingCoin] = useState<string | null>(null)
  const { watchlist, removeFromWatchlist } = useWatchlist()
  const { toast } = useToast()

  useEffect(() => {
    const fetchWatchlistCoins = async () => {
      if (watchlist.length === 0) {
        setCoins([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const data = await getWatchlistCoins(watchlist)

        if (!data || !Array.isArray(data)) {
          throw new Error("Invalid data format received from API")
        }

        setCoins(data)
      } catch (error) {
        console.error("Failed to fetch watchlist coins:", error)
        setError("Unable to load watchlist data. Please try again later.")
        toast({
          title: "Error loading watchlist",
          description: "We couldn't load your watchlist. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchWatchlistCoins()
  }, [watchlist, retryCount, toast])

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  const handleRemoveCoin = async (coinId: string) => {
    try {
      setRemovingCoin(coinId)
      removeFromWatchlist(coinId)
      toast({
        title: "Coin removed",
        description: "The coin has been removed from your watchlist.",
        variant: "default",
      })
    } catch (error) {
      console.error("Failed to remove coin:", error)
      toast({
        title: "Error removing coin",
        description: "We couldn't remove the coin from your watchlist. Please try again.",
        variant: "destructive",
      })
    } finally {
      setRemovingCoin(null)
    }
  }

  return (
    <Card className="border dark:border-zinc-800/50 dark:shadow-dark-card dark:hover:shadow-dark-card-hover transition-all overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between bg-muted/30 dark:bg-zinc-800/30 dark:border-b dark:border-zinc-800/50">
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-400 dark:text-yellow-300 dark:animate-pulse-glow-dark" />
          <span className="dark:text-white dark:font-bold">Your Watchlist</span>
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          asChild
          className="dark:bg-zinc-800/50 dark:border-zinc-700/50 dark:text-zinc-200 dark:hover:shadow-dark-glow-sm group"
        >
          <Link href="/coin-selector" className="flex items-center gap-1">
            <Plus className="mr-1 h-4 w-4" />
            Add Coins
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="dark:bg-dark-gradient-card">
        {loading ? (
          <div className="space-y-4 py-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full dark:bg-zinc-800/70" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24 dark:bg-zinc-800/70" />
                  <Skeleton className="h-4 w-16 dark:bg-zinc-800/70" />
                </div>
                <div className="space-y-2 w-24 text-right">
                  <Skeleton className="h-4 w-full dark:bg-zinc-800/70" />
                  <Skeleton className="h-4 w-16 ml-auto dark:bg-zinc-800/70" />
                </div>
                <Skeleton className="h-8 w-8 rounded-md dark:bg-zinc-800/70" />
              </div>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive" className="my-4 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-200">
            <AlertCircle className="h-4 w-4 dark:text-red-300" />
            <AlertDescription className="dark:text-red-200 flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="ml-2 dark:bg-red-900/30 dark:border-red-800/50 dark:text-red-200 dark:hover:bg-red-900/50"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : coins.length > 0 ? (
          <div className="space-y-4 py-4">
            {coins.map((coin) => (
              <div
                key={coin.id}
                className="flex items-center gap-4 p-3 rounded-md hover:bg-muted dark:hover:bg-zinc-800/50 dark:hover:border-zinc-700/50 transition-all group"
              >
                <Link href={`/coin/${coin.id}`} className="flex items-center gap-4 flex-1">
                  <div className="relative overflow-hidden rounded-full dark:border dark:border-zinc-700/50 dark:group-hover:border-zinc-600/50">
                    <Image
                      src={coin.image || "/placeholder.svg?height=40&width=40"}
                      alt={coin.name}
                      width={40}
                      height={40}
                      className="rounded-full object-contain dark:group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=40&width=40"
                      }}
                    />
                    <div className="absolute inset-0 rounded-full dark:bg-gradient-to-br dark:from-transparent dark:to-black/20 dark:group-hover:opacity-0 transition-opacity"></div>
                  </div>
                  <div>
                    <div className="font-medium dark:text-white dark:group-hover:text-blue-400 transition-colors">
                      {coin.name}
                    </div>
                    <div className="text-sm text-muted-foreground dark:text-zinc-400 dark:group-hover:text-zinc-300">
                      {coin.symbol.toUpperCase()}
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="font-medium dark:text-zinc-200">{formatCurrency(coin.current_price)}</div>
                    <div
                      className={`text-sm flex items-center justify-end ${
                        coin.price_change_percentage_24h > 0
                          ? "text-green-500 dark:text-green-400"
                          : coin.price_change_percentage_24h < 0
                            ? "text-red-500 dark:text-red-400"
                            : "dark:text-zinc-400"
                      }`}
                    >
                      {coin.price_change_percentage_24h > 0 ? (
                        <ArrowUp className="mr-1 h-3 w-3" />
                      ) : coin.price_change_percentage_24h < 0 ? (
                        <ArrowDown className="mr-1 h-3 w-3" />
                      ) : null}
                      {formatPercentage(coin.price_change_percentage_24h)}
                    </div>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 dark:hover:bg-red-900/20"
                  onClick={() => handleRemoveCoin(coin.id)}
                  disabled={removingCoin === coin.id}
                >
                  {removingCoin === coin.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  <span className="sr-only">Remove from watchlist</span>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted/50 dark:bg-zinc-800/50 p-6 mb-4 animate-float dark:shadow-dark-glow-sm">
              <Star className="h-10 w-10 text-muted-foreground dark:text-zinc-400" />
            </div>
            <h3 className="text-xl font-medium mb-2 dark:text-white">Your watchlist is empty</h3>
            <p className="text-sm text-muted-foreground dark:text-zinc-400 mb-6 max-w-xs">
              Add cryptocurrencies to track their performance and get quick access to their details.
            </p>
            <Button
              asChild
              className="hover:shadow-glow-primary transition-all dark:bg-blue-600 dark:hover:bg-blue-500 dark:shadow-dark-glow dark:hover:shadow-dark-glow-lg"
            >
              <Link href="/coin-selector" className="flex items-center gap-1">
                <Plus className="mr-2 h-4 w-4" />
                Add Coins to Watchlist
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

