"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowUp, ArrowDown, Star, Globe, Github, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWatchlist } from "@/hooks/use-watchlist"
import { formatCurrency, formatPercentage } from "@/lib/utils"

interface CoinHeaderProps {
  coin: any
}

export function CoinHeader({ coin }: CoinHeaderProps) {
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist()
  const isInWatchlist = watchlist.includes(coin.id)

  const toggleWatchlist = () => {
    if (isInWatchlist) {
      removeFromWatchlist(coin.id)
    } else {
      addToWatchlist(coin.id)
    }
  }

  const priceChange = coin.market_data?.price_change_percentage_24h
  const isPriceUp = priceChange > 0

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <Image
          src={coin.image?.large || "/placeholder.svg?height=48&width=48"}
          alt={coin.name}
          width={48}
          height={48}
          className="rounded-full"
          loading="lazy"
        />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{coin.name}</h1>
            <span className="text-lg text-muted-foreground">{coin.symbol?.toUpperCase()}</span>
            <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
              Rank #{coin.market_cap_rank || "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-1">
              <span className="text-xl font-semibold">{formatCurrency(coin.market_data?.current_price?.usd || 0)}</span>
              <span
                className={`flex items-center text-sm ${
                  isPriceUp ? "text-green-500" : priceChange < 0 ? "text-red-500" : ""
                }`}
              >
                {isPriceUp ? (
                  <ArrowUp className="h-3 w-3" />
                ) : priceChange < 0 ? (
                  <ArrowDown className="h-3 w-3" />
                ) : null}
                {formatPercentage(priceChange || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={isInWatchlist ? "default" : "outline"}
          size="sm"
          className="flex items-center gap-1"
          onClick={toggleWatchlist}
        >
          <Star className={`h-4 w-4 ${isInWatchlist ? "fill-primary-foreground" : ""}`} />
          {isInWatchlist ? "Watchlisted" : "Add to Watchlist"}
        </Button>
        {coin.links?.homepage?.[0] && (
          <Button variant="outline" size="sm" asChild>
            <Link
              href={coin.links.homepage[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              <Globe className="h-4 w-4" />
              Website
            </Link>
          </Button>
        )}
        {coin.links?.repos_url?.github?.[0] && (
          <Button variant="outline" size="sm" asChild>
            <Link
              href={coin.links.repos_url.github[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              <Github className="h-4 w-4" />
              GitHub
            </Link>
          </Button>
        )}
        {coin.links?.twitter_screen_name && (
          <Button variant="outline" size="sm" asChild>
            <Link
              href={`https://twitter.com/${coin.links.twitter_screen_name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              <Twitter className="h-4 w-4" />
              Twitter
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}

