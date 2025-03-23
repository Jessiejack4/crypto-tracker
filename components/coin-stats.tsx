"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/utils"

interface CoinStatsProps {
  coin: any
}

export function CoinStats({ coin }: CoinStatsProps) {
  const marketData = coin.market_data || {}

  const stats = [
    {
      label: "Market Cap",
      value: formatCurrency(marketData.market_cap?.usd || 0),
      change: marketData.market_cap_change_percentage_24h,
    },
    {
      label: "24h Trading Volume",
      value: formatCurrency(marketData.total_volume?.usd || 0),
    },
    {
      label: "Fully Diluted Valuation",
      value: formatCurrency(marketData.fully_diluted_valuation?.usd || 0),
    },
    {
      label: "Circulating Supply",
      value: formatNumber(marketData.circulating_supply || 0),
      extra: coin.symbol?.toUpperCase(),
    },
    {
      label: "Total Supply",
      value: formatNumber(marketData.total_supply || 0),
      extra: coin.symbol?.toUpperCase(),
    },
    {
      label: "Max Supply",
      value: marketData.max_supply ? formatNumber(marketData.max_supply) : "∞",
      extra: marketData.max_supply ? coin.symbol?.toUpperCase() : "",
    },
    {
      label: "All-Time High",
      value: formatCurrency(marketData.ath?.usd || 0),
      change: marketData.ath_change_percentage?.usd,
      extra: marketData.ath_date?.usd ? `on ${new Date(marketData.ath_date.usd).toLocaleDateString()}` : "",
    },
    {
      label: "All-Time Low",
      value: formatCurrency(marketData.atl?.usd || 0),
      change: marketData.atl_change_percentage?.usd,
      extra: marketData.atl_date?.usd ? `on ${new Date(marketData.atl_date.usd).toLocaleDateString()}` : "",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col">
              <div className="text-sm text-muted-foreground">{stat.label}</div>
              <div className="flex items-center gap-2">
                <div className="font-medium">{stat.value}</div>
                {stat.change !== undefined && (
                  <div
                    className={`text-xs ${stat.change > 0 ? "text-green-500" : stat.change < 0 ? "text-red-500" : ""}`}
                  >
                    {formatPercentage(stat.change)}
                  </div>
                )}
                {stat.extra && <div className="text-xs text-muted-foreground">{stat.extra}</div>}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

