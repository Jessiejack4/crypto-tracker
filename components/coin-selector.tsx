"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Search, Star, AlertCircle, RefreshCw, ArrowLeft, Loader2, Check, X, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useWatchlist } from "@/hooks/use-watchlist"
import { getTopCryptocurrencies } from "@/lib/api"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { debounce } from "@/lib/performance-utils"

export function CoinSelector() {
  const [allCoins, setAllCoins] = useState<any[]>([])
  const [filteredCoins, setFilteredCoins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCoins, setSelectedCoins] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist()
  const { toast } = useToast()
  const router = useRouter()

  // Fetch all available coins
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        setLoading(true)
        setError(null)
        // Get a larger list of coins for selection
        const data = await getTopCryptocurrencies(100)

        if (!data || !Array.isArray(data)) {
          throw new Error("Invalid data format received from API")
        }

        setAllCoins(data)
        setFilteredCoins(data)

        // Pre-select coins that are already in the watchlist
        setSelectedCoins(watchlist)
      } catch (error) {
        console.error("Failed to fetch coins:", error)
        setError("Unable to load cryptocurrency data. Please try again later.")
        toast({
          title: "Error loading coins",
          description: "We couldn't load the cryptocurrency data. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCoins()
  }, [watchlist, toast])

  // Filter coins based on search query
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (!query.trim()) {
        setFilteredCoins(allCoins)
        return
      }

      const lowercaseQuery = query.toLowerCase()
      const filtered = allCoins.filter(
        (coin) =>
          coin.name.toLowerCase().includes(lowercaseQuery) || coin.symbol.toLowerCase().includes(lowercaseQuery),
      )

      setFilteredCoins(filtered)
    }, 300),
    [allCoins],
  )

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    debouncedSearch(query)
  }

  // Toggle coin selection
  const toggleCoinSelection = (coinId: string) => {
    setSelectedCoins((prev) => {
      if (prev.includes(coinId)) {
        return prev.filter((id) => id !== coinId)
      } else {
        return [...prev, coinId]
      }
    })
  }

  // Save selected coins to watchlist
  const saveToWatchlist = async () => {
    try {
      setIsSubmitting(true)

      // Remove coins that were in watchlist but are now unselected
      const coinsToRemove = watchlist.filter((id) => !selectedCoins.includes(id))
      coinsToRemove.forEach((id) => removeFromWatchlist(id))

      // Add newly selected coins
      const coinsToAdd = selectedCoins.filter((id) => !watchlist.includes(id))
      coinsToAdd.forEach((id) => addToWatchlist(id))

      toast({
        title: "Watchlist updated",
        description: "Your watchlist has been updated successfully.",
        variant: "default",
      })

      // Navigate back to watchlist
      router.push("/watchlist")
    } catch (error) {
      console.error("Failed to update watchlist:", error)
      toast({
        title: "Error updating watchlist",
        description: "We couldn't update your watchlist. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle retry
  const handleRetry = () => {
    // Re-fetch coins
    setAllCoins([])
    setFilteredCoins([])
    setLoading(true)
    setError(null)

    // This will trigger the useEffect to fetch coins again
    const fetchCoins = async () => {
      try {
        const data = await getTopCryptocurrencies(100)

        if (!data || !Array.isArray(data)) {
          throw new Error("Invalid data format received from API")
        }

        setAllCoins(data)
        setFilteredCoins(data)
      } catch (error) {
        console.error("Failed to fetch coins:", error)
        setError("Unable to load cryptocurrency data. Please try again later.")
        toast({
          title: "Error loading coins",
          description: "We couldn't load the cryptocurrency data. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCoins()
  }

  return (
    <Card className="border dark:border-zinc-800/50 dark:shadow-dark-card dark:hover:shadow-dark-card-hover transition-all overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between bg-muted/30 dark:bg-zinc-800/30 dark:border-b dark:border-zinc-800/50">
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-400 dark:text-yellow-300 dark:animate-pulse-glow-dark" />
          <span className="dark:text-white dark:font-bold">Select Coins for Your Watchlist</span>
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="dark:bg-zinc-800/50 dark:border-zinc-700/50 dark:text-zinc-200 dark:hover:shadow-dark-glow-sm group"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </CardHeader>

      <CardContent className="dark:bg-dark-gradient-card pt-4">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground dark:text-zinc-400" />
          <Input
            placeholder="Search for a cryptocurrency..."
            className="pl-10 dark:bg-zinc-800/50 dark:border-zinc-700/50 dark:text-zinc-200 dark:placeholder:text-zinc-500"
            value={searchQuery}
            onChange={handleSearchChange}
            disabled={loading || !!error}
          />
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3">
                <Skeleton className="h-8 w-8 rounded-full dark:bg-zinc-800/70" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24 dark:bg-zinc-800/70" />
                  <Skeleton className="h-4 w-16 dark:bg-zinc-800/70" />
                </div>
                <Skeleton className="h-8 w-16 dark:bg-zinc-800/70" />
                <Skeleton className="h-8 w-8 rounded-md dark:bg-zinc-800/70" />
              </div>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive" className="dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-200">
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
        ) : filteredCoins.length === 0 ? (
          <div className="text-center py-8">
            <div className="rounded-full bg-muted/50 dark:bg-zinc-800/50 p-4 mb-4 mx-auto w-fit">
              <Search className="h-6 w-6 text-muted-foreground dark:text-zinc-400" />
            </div>
            <h3 className="font-medium mb-1 dark:text-white">No coins found</h3>
            <p className="text-sm text-muted-foreground dark:text-zinc-400 mb-4 max-w-xs mx-auto">
              Try a different search term or browse all available coins.
            </p>
            <Button
              variant="outline"
              onClick={() => setSearchQuery("")}
              className="dark:bg-zinc-800/50 dark:border-zinc-700/50 dark:text-zinc-200"
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredCoins.map((coin) => (
              <div
                key={coin.id}
                className={`flex items-center gap-4 p-3 rounded-md transition-all cursor-pointer
                  ${
                    selectedCoins.includes(coin.id)
                      ? "bg-primary/10 dark:bg-blue-900/20 dark:border dark:border-blue-800/50"
                      : "hover:bg-muted dark:hover:bg-zinc-800/50"
                  }`}
                onClick={() => toggleCoinSelection(coin.id)}
              >
                <div className="relative overflow-hidden rounded-full dark:border dark:border-zinc-700/50">
                  <Image
                    src={coin.image || "/placeholder.svg?height=32&width=32"}
                    alt={coin.name}
                    width={32}
                    height={32}
                    className="rounded-full object-contain"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=32&width=32"
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="font-medium dark:text-white">{coin.name}</div>
                  <div className="text-sm text-muted-foreground dark:text-zinc-400">{coin.symbol.toUpperCase()}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium dark:text-zinc-200">{formatCurrency(coin.current_price)}</div>
                  <div
                    className={`text-sm ${
                      coin.price_change_percentage_24h > 0
                        ? "text-green-500 dark:text-green-400"
                        : coin.price_change_percentage_24h < 0
                          ? "text-red-500 dark:text-red-400"
                          : "dark:text-zinc-400"
                    }`}
                  >
                    {formatPercentage(coin.price_change_percentage_24h)}
                  </div>
                </div>
                <div
                  className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors
                  ${
                    selectedCoins.includes(coin.id)
                      ? "bg-primary dark:bg-blue-600 text-primary-foreground"
                      : "bg-muted dark:bg-zinc-800/70"
                  }`}
                >
                  {selectedCoins.includes(coin.id) ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Plus className="h-5 w-5 text-muted-foreground dark:text-zinc-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t pt-4 bg-muted/10 dark:bg-zinc-900/50 dark:border-zinc-800/50 flex justify-between">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="dark:bg-zinc-800/70 dark:border-zinc-700/50 dark:text-zinc-200"
          disabled={isSubmitting}
        >
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>

        <Button
          onClick={saveToWatchlist}
          className="hover:shadow-glow-primary transition-all dark:bg-blue-600 dark:hover:bg-blue-500 dark:shadow-dark-glow dark:hover:shadow-dark-glow-lg"
          disabled={loading || !!error || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Star className="mr-2 h-4 w-4" />
              Save to Watchlist ({selectedCoins.length})
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

