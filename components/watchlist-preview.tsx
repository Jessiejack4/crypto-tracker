"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ArrowUp, ArrowDown, Plus, AlertCircle, Star } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWatchlist } from "@/hooks/use-watchlist"
import { getWatchlistCoins } from "@/lib/api"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export function WatchlistPreview() {
  const [coins, setCoins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const { watchlist } = useWatchlist()
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

        setCoins(data.slice(0, 5)) // Show only top 5 coins
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

  return (
    <Card className="border dark:border-zinc-800/50 dark:shadow-dark-card dark:hover:shadow-dark-card-hover transition-all overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between bg-muted/30 dark:bg-zinc-800/30 dark:border-b dark:border-zinc-800/50">
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-400 dark:text-yellow-300 dark:animate-pulse-glow-dark" />
          <span className="dark:text-white dark:font-bold">Your Watchlist</span>
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="dark:bg-zinc-800/50 dark:border-zinc-700/50 dark:text-zinc-200 dark:hover:shadow-dark-glow-sm group"
        >
          <Link href="/watchlist" className="group flex items-center gap-1">
            View All <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="dark:bg-dark-gradient-card">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
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
        ) : error ? (
          <Alert variant="destructive" className="dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-200">
            <AlertCircle className="h-4 w-4 dark:text-red-300" />
            <AlertDescription className="dark:text-red-200">
              {error}
              <Button
                variant="link"
                size="sm"
                onClick={handleRetry}
                className="ml-2 dark:text-red-300 hover:dark:text-red-200"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : coins.length > 0 ? (
          <div className="space-y-4">
            {coins.map((coin) => (
              <Link
                key={coin.id}
                href={`/coin/${coin.id}`}
                className="flex items-center gap-4 p-3 rounded-md hover:bg-muted dark:hover:bg-zinc-800/50 dark:hover:border-zinc-700/50 dark:hover:shadow-dark-glow-sm transition-all group"
              >
                <div className="relative overflow-hidden rounded-full dark:border dark:border-zinc-700/50 dark:group-hover:border-zinc-600/50">
                  <Image
                    src={coin.image || "/placeholder.svg?height=32&width=32"}
                    alt={coin.name}
                    width={32}
                    height={32}
                    className="rounded-full object-contain dark:group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iI2U1ZTdlYiIvPjwvc3ZnPg=="
                    onError={(e) => {
                      // Fallback for image loading errors
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=32&width=32"
                    }}
                  />
                  <div className="absolute inset-0 rounded-full dark:bg-gradient-to-br dark:from-transparent dark:to-black/20 dark:group-hover:opacity-0 transition-opacity"></div>
                </div>
                <div className="flex-1">
                  <div className="font-medium dark:text-white dark:group-hover:text-blue-400 transition-colors">
                    {coin.name}
                  </div>
                  <div className="text-sm text-muted-foreground dark:text-zinc-400 dark:group-hover:text-zinc-300">
                    {coin.symbol.toUpperCase()}
                  </div>
                </div>
                <div className="text-right">
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
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            {/* Make the Plus icon clickable and link to coin selection page */}
            <Button
              variant="ghost"
              size="lg"
              asChild
              className="rounded-full bg-muted/50 dark:bg-zinc-800/50 p-4 mb-4 hover:bg-muted dark:hover:bg-zinc-700/50 dark:shadow-dark-glow-sm dark:hover:shadow-dark-glow transition-all"
            >
              <Link href="/coin-selector">
                <Plus className="h-6 w-6 text-muted-foreground dark:text-zinc-400 dark:hover:text-zinc-200" />
                <span className="sr-only">Add coins to watchlist</span>
              </Link>
            </Button>
            <h3 className="font-medium mb-1 dark:text-white">No coins in your watchlist</h3>
            <p className="text-sm text-muted-foreground dark:text-zinc-400 mb-4 max-w-xs">
              Add cryptocurrencies to track their performance
            </p>
            <Button
              asChild
              className="hover:shadow-glow-primary transition-all dark:bg-blue-600 dark:hover:bg-blue-500 dark:shadow-dark-glow dark:hover:shadow-dark-glow-lg"
            >
              <Link href="/coin-selector" className="flex items-center gap-1">
                Add Coins to Watchlist
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
      {coins.length > 0 && (
        <CardFooter className="border-t pt-4 bg-muted/10 dark:bg-zinc-900/50 dark:border-zinc-800/50">
          <Button
            asChild
            className="w-full hover:shadow-glow-primary transition-all group dark:bg-blue-600 dark:hover:bg-blue-500 dark:shadow-dark-glow dark:hover:shadow-dark-glow-lg"
          >
            <Link href="/watchlist" className="flex items-center justify-center gap-1">
              View Full Watchlist
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

