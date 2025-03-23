"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AdvancedPriceChart } from "@/components/advanced-price-chart"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface FullscreenChartProps {
  coinId: string
  coinName?: string
  coinSymbol?: string
  initialPrice?: number
}

export function FullscreenChart({ coinId, coinName, coinSymbol, initialPrice }: FullscreenChartProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const router = useRouter()

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="dark:bg-zinc-800/70 dark:border-zinc-700/50 dark:text-zinc-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold tracking-tight dark:text-white dark:font-extrabold dark:bg-gradient-to-r dark:from-blue-400 dark:to-blue-600 dark:bg-clip-text dark:text-transparent">
          {coinName} Chart
        </h1>
        <div className="w-24"></div> {/* Spacer for alignment */}
      </div>

      <AdvancedPriceChart
        coinId={coinId}
        coinName={coinName}
        coinSymbol={coinSymbol || ""}
        initialPrice={initialPrice}
        fullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
      />
    </div>
  )
}

