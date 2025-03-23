"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Brush,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCoinChart, getCoinOHLC } from "@/lib/api"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import {
  BarChart2,
  TrendingUp,
  TrendingDown,
  Clock,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Settings,
  Maximize2,
  Minimize2,
  AlertCircle,
  CandlestickChartIcon as Candlestick,
  LineChartIcon,
  BarChartIcon,
  Activity,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useToast } from "@/hooks/use-toast"

// Import the CandlestickChart component
import { CandlestickChart } from "./candlestick-chart"

// Define the available timeframes
const TIMEFRAMES = [
  { value: "1h", label: "1H", seconds: 60 * 60 },
  { value: "4h", label: "4H", seconds: 4 * 60 * 60 },
  { value: "1d", label: "1D", seconds: 24 * 60 * 60 },
  { value: "7d", label: "1W", seconds: 7 * 24 * 60 * 60 },
  { value: "30d", label: "1M", seconds: 30 * 24 * 60 * 60 },
  { value: "90d", label: "3M", seconds: 90 * 24 * 60 * 60 },
  { value: "1y", label: "1Y", seconds: 365 * 24 * 60 * 60 },
  { value: "max", label: "All", seconds: Number.POSITIVE_INFINITY },
]

// Define chart types
const CHART_TYPES = [
  { value: "line", label: "Line", icon: LineChartIcon },
  { value: "area", label: "Area", icon: Activity },
  { value: "candle", label: "Candlestick", icon: Candlestick },
  { value: "bar", label: "Bar", icon: BarChartIcon },
]

// Define chart themes
const CHART_THEMES = [
  { value: "default", label: "Default" },
  { value: "trading", label: "Trading" },
  { value: "minimal", label: "Minimal" },
]

interface AdvancedPriceChartProps {
  coinId: string
  coinName?: string
  coinSymbol?: string
  initialPrice?: number
  fullscreen?: boolean
  onToggleFullscreen?: () => void
  onError?: (error: string) => void
}

export function AdvancedPriceChart({
  coinId,
  coinName = "",
  coinSymbol = "",
  initialPrice = 0,
  fullscreen = false,
  onToggleFullscreen,
  onError,
}: AdvancedPriceChartProps) {
  // State for chart data and settings
  const [chartData, setChartData] = useState<any[]>([])
  const [ohlcData, setOhlcData] = useState<any[]>([])
  const [volumeData, setVolumeData] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState("1d")
  const [chartType, setChartType] = useState<string>("area")
  const [chartTheme, setChartTheme] = useState("default")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [showVolume, setShowVolume] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [currentPrice, setCurrentPrice] = useState<number | null>(initialPrice || null)
  const [priceChange, setPriceChange] = useState<number | null>(null)
  const [priceChangePercent, setPriceChangePercent] = useState<number | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isFullDataLoaded, setIsFullDataLoaded] = useState(false)
  const [isRealtime, setIsRealtime] = useState(timeRange === "1h" || timeRange === "4h")

  const chartContainerRef = useRef<HTMLDivElement>(null)
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)
  const { theme } = useTheme()
  const { toast } = useToast()

  // Determine if the price trend is positive
  const isPriceUp = priceChangePercent !== null ? priceChangePercent > 0 : false
  const isDarkMode = theme === "dark"

  // Calculate chart colors based on theme and price trend
  const chartColors = useMemo(() => {
    const baseColors = {
      line: isPriceUp ? "#10b981" : "#ef4444",
      area: {
        fill: isPriceUp
          ? isDarkMode
            ? "rgba(16, 185, 129, 0.2)"
            : "rgba(16, 185, 129, 0.1)"
          : isDarkMode
            ? "rgba(239, 68, 68, 0.2)"
            : "rgba(239, 68, 68, 0.1)",
        stroke: isPriceUp ? "#10b981" : "#ef4444",
      },
      volume: {
        up: isDarkMode ? "rgba(16, 185, 129, 0.5)" : "rgba(16, 185, 129, 0.3)",
        down: isDarkMode ? "rgba(239, 68, 68, 0.5)" : "rgba(239, 68, 68, 0.3)",
      },
      grid: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      text: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
      tooltip: {
        bg: isDarkMode ? "rgba(30, 30, 30, 0.9)" : "rgba(255, 255, 255, 0.9)",
        border: isDarkMode ? "rgba(60, 60, 60, 0.9)" : "rgba(200, 200, 200, 0.9)",
      },
    }

    // Apply theme variations
    if (chartTheme === "trading") {
      return {
        ...baseColors,
        line: isPriceUp ? "#22c55e" : "#ef4444",
        area: {
          fill: isPriceUp
            ? isDarkMode
              ? "rgba(34, 197, 94, 0.2)"
              : "rgba(34, 197, 94, 0.1)"
            : isDarkMode
              ? "rgba(239, 68, 68, 0.2)"
              : "rgba(239, 68, 68, 0.1)",
          stroke: isPriceUp ? "#22c55e" : "#ef4444",
        },
        grid: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
        background: isDarkMode ? "#111827" : "#f8fafc",
      }
    } else if (chartTheme === "minimal") {
      return {
        ...baseColors,
        line: isDarkMode ? "#94a3b8" : "#64748b",
        area: {
          fill: isDarkMode ? "rgba(148, 163, 184, 0.1)" : "rgba(100, 116, 139, 0.05)",
          stroke: isDarkMode ? "#94a3b8" : "#64748b",
        },
        volume: {
          up: isDarkMode ? "rgba(148, 163, 184, 0.3)" : "rgba(100, 116, 139, 0.2)",
          down: isDarkMode ? "rgba(148, 163, 184, 0.3)" : "rgba(100, 116, 139, 0.2)",
        },
        grid: isDarkMode ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.03)",
      }
    }

    return baseColors
  }, [isPriceUp, isDarkMode, chartTheme])

  // Fetch chart data
  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch price data
        const data = await getCoinChart(coinId, timeRange, chartType)

        if (data && data.prices && Array.isArray(data.prices)) {
          // Transform the data for the chart
          const formattedData = data.prices.map((item: [number, number]) => ({
            timestamp: item[0],
            date: new Date(item[0]),
            price: item[1],
          }))

          setChartData(formattedData)

          // Calculate price change
          if (formattedData.length > 0) {
            const latestPrice = formattedData[formattedData.length - 1].price
            const firstPrice = formattedData[0].price
            const change = latestPrice - firstPrice
            const changePercent = (change / firstPrice) * 100

            setCurrentPrice(latestPrice)
            setPriceChange(change)
            setPriceChangePercent(changePercent)
            setLastUpdated(new Date())
          }

          // Extract volume data if available
          if (data.total_volumes && Array.isArray(data.total_volumes)) {
            const volumeData = data.total_volumes.map((item: [number, number]) => ({
              timestamp: item[0],
              date: new Date(item[0]),
              volume: item[1],
            }))
            setVolumeData(volumeData)
          } else {
            // Create mock volume data based on price data
            const mockVolumeData = formattedData.map((item) => ({
              timestamp: item.timestamp,
              date: item.date,
              volume: item.price * (0.5 + Math.random()),
            }))
            setVolumeData(mockVolumeData)
          }

          // If candlestick chart is selected, handle OHLC data
          if (chartType === "candle") {
            if (data.candlestickData && Array.isArray(data.candlestickData)) {
              setOhlcData(data.candlestickData)
              setIsFullDataLoaded(true)
            } else {
              fetchOHLCData()
            }
          } else {
            setIsFullDataLoaded(true)
          }
        } else {
          console.error("Invalid chart data format:", data)
          // Generate fallback data even for invalid data format
          generateFallbackData()
        }
      } catch (error) {
        console.error("Failed to fetch chart data:", error)
        // Generate fallback data for any error
        generateFallbackData()
      } finally {
        setLoading(false)
      }
    }

    // Add a fallback data generation function
    const generateFallbackData = () => {
      setError("Unable to load live data. Showing simulated chart data.")
      if (onError) {
        onError("Unable to load live data. Showing simulated chart data.")
      }

      // Create timestamp range
      const now = Date.now()
      const dataPoints = 100
      let timeStep: number

      // Determine time step based on timeRange
      switch (timeRange) {
        case "1h":
          timeStep = 60 * 1000
          break // 1 minute
        case "4h":
          timeStep = 5 * 60 * 1000
          break // 5 minutes
        case "1d":
          timeStep = 15 * 60 * 1000
          break // 15 minutes
        case "7d":
          timeStep = 2 * 60 * 60 * 1000
          break // 2 hours
        case "30d":
          timeStep = 8 * 60 * 60 * 1000
          break // 8 hours
        case "90d":
          timeStep = 24 * 60 * 60 * 1000
          break // 1 day
        case "1y":
          timeStep = 3 * 24 * 60 * 60 * 1000
          break // 3 days
        case "max":
          timeStep = 7 * 24 * 60 * 60 * 1000
          break // 1 week
        default:
          timeStep = 24 * 60 * 60 * 1000 // 1 day
      }

      // Generate price data with realistic patterns
      const basePrice = initialPrice || 50000
      let lastPrice = basePrice
      const mockChartData = []
      const mockVolumeData = []
      const mockOhlcData = []

      // Simulate a realistic price trend
      let trend = 0 // 0 = neutral, 1 = up, -1 = down
      let trendDuration = Math.floor(Math.random() * 15) + 5
      let trendCounter = 0

      for (let i = 0; i < dataPoints; i++) {
        const timestamp = now - (dataPoints - i) * timeStep

        // Change trend occasionally
        if (trendCounter >= trendDuration) {
          trend = Math.random() > 0.5 ? 1 : -1
          trendDuration = Math.floor(Math.random() * 15) + 5
          trendCounter = 0
        }
        trendCounter++

        // Calculate price with trend
        const trendBias = trend * 0.005 // 0.5% trend bias
        const randomMovement = (Math.random() - 0.5) * 0.01 // Random -0.5% to 0.5%
        const percentChange = trendBias + randomMovement
        lastPrice = lastPrice * (1 + percentChange)

        // Ensure price doesn't go below 20% of base price
        lastPrice = Math.max(lastPrice, basePrice * 0.2)

        // Add to chart data
        mockChartData.push({
          timestamp,
          date: new Date(timestamp),
          price: lastPrice,
        })

        // Generate volume data
        const volume = lastPrice * (1000000 + Math.random() * 2000000) * (Math.abs(percentChange) * 100) // Higher volume on bigger price moves
        mockVolumeData.push({
          timestamp,
          date: new Date(timestamp),
          volume,
        })

        // Generate OHLC data for candlestick chart
        if (chartType === "candle") {
          const open = i > 0 ? mockOhlcData[i - 1].close : lastPrice * (1 - randomMovement)
          const close = lastPrice
          const high = Math.max(open, close) * (1 + Math.random() * 0.005) // Up to 0.5% higher
          const low = Math.min(open, close) * (1 - Math.random() * 0.005) // Up to 0.5% lower

          mockOhlcData.push({
            timestamp,
            date: new Date(timestamp),
            open,
            high,
            low,
            close,
            volume,
          })
        }
      }

      // Update state with fallback data
      setChartData(mockChartData)
      setVolumeData(mockVolumeData)

      if (chartType === "candle") {
        setOhlcData(mockOhlcData)
      }

      // Calculate price change for display
      if (mockChartData.length > 0) {
        const latestPrice = mockChartData[mockChartData.length - 1].price
        const firstPrice = mockChartData[0].price
        const change = latestPrice - firstPrice
        const changePercent = (change / firstPrice) * 100

        setCurrentPrice(latestPrice)
        setPriceChange(change)
        setPriceChangePercent(changePercent)
        setLastUpdated(new Date())
      }

      setIsFullDataLoaded(true)
    }

    const fetchOHLCData = async () => {
      try {
        setIsFullDataLoaded(false)
        const data = await getCoinOHLC(coinId, timeRange)

        if (data && Array.isArray(data)) {
          // Transform OHLC data
          const formattedData = data.map((item: number[]) => ({
            timestamp: item[0],
            date: new Date(item[0]),
            open: item[1],
            high: item[2],
            low: item[3],
            close: item[4],
            // Add volume data if available from the API response
            volume: volumeData.find((v) => Math.abs(v.timestamp - item[0]) < 60000)?.volume || 0,
          }))

          setOhlcData(formattedData)
        } else {
          console.error("Invalid OHLC data format:", data)
          // Generate fallback data for OHLC
          const fallbackData = chartData.map((item) => ({
            timestamp: item.timestamp,
            date: item.date,
            open: item.price * 0.99,
            high: item.price * 1.005,
            low: item.price * 0.995,
            close: item.price,
            volume: volumeData.find((v) => v.timestamp === item.timestamp)?.volume || 0,
          }))
          setOhlcData(fallbackData)

          // Show a toast notification
          toast({
            title: "Chart data limited",
            description: "We couldn't load candlestick data. Using simplified chart instead.",
            variant: "warning",
          })
        }
      } catch (error) {
        console.error("Failed to fetch OHLC data:", error)
        // Create fallback data based on price chart data
        const fallbackData = chartData.map((item) => ({
          timestamp: item.timestamp,
          date: item.date,
          open: item.price * 0.99,
          high: item.price * 1.005,
          low: item.price * 0.995,
          close: item.price,
          volume: volumeData.find((v) => v.timestamp === item.timestamp)?.volume || 0,
        }))
        setOhlcData(fallbackData)

        // Show a toast notification
        toast({
          title: "Chart data limited",
          description: "We couldn't load candlestick data. Using simplified chart instead.",
          variant: "warning",
        })
      } finally {
        setIsFullDataLoaded(true)
      }
    }

    fetchChartData()

    // Set up auto-refresh if enabled
    if (autoRefresh) {
      // Clear any existing timer
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
      }

      // Set refresh interval based on timeframe
      const refreshInterval =
        timeRange === "1h"
          ? 30000
          : // 30 seconds for 1h
            timeRange === "4h"
            ? 60000
            : // 1 minute for 4h
              timeRange === "1d"
              ? 300000
              : // 5 minutes for 1d
                600000 // 10 minutes for others

      refreshTimerRef.current = setInterval(() => {
        fetchChartData()
      }, refreshInterval)
    }

    // Cleanup function
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
      }
    }
  }, [coinId, timeRange, chartType, showVolume, autoRefresh, retryCount, toast, initialPrice, onError])

  // Update isRealtime when timeRange changes
  useEffect(() => {
    setIsRealtime(timeRange === "1h" || timeRange === "4h")
  }, [timeRange])

  // Handle chart type change
  const handleChartTypeChange = (type: string) => {
    setChartType(type)

    // If switching to candlestick and we don't have OHLC data yet
    if (type === "candle" && ohlcData.length === 0) {
      setIsFullDataLoaded(false)

      // Fetch OHLC data
      const fetchOHLCData = async () => {
        try {
          const data = await getCoinOHLC(coinId, timeRange)

          if (data && Array.isArray(data)) {
            // Transform OHLC data
            const formattedData = data.map((item: number[]) => ({
              timestamp: item[0],
              date: new Date(item[0]),
              open: item[1],
              high: item[2],
              low: item[3],
              close: item[4],
              // Add volume data if available
              volume: volumeData.find((v) => Math.abs(v.timestamp - item[0]) < 60000)?.volume || 0,
            }))

            setOhlcData(formattedData)
            setIsFullDataLoaded(true)
          } else {
            console.error("Invalid OHLC data format:", data)
            // Fall back to line chart
            setChartType("line")
            setIsFullDataLoaded(true)
            toast({
              title: "Candlestick chart unavailable",
              description: "We couldn't load candlestick data. Switched to line chart instead.",
              variant: "warning",
            })
          }
        } catch (error) {
          console.error("Failed to fetch OHLC data:", error)
          // Fall back to line chart
          setChartType("line")
          setIsFullDataLoaded(true)
          toast({
            title: "Candlestick chart unavailable",
            description: "We couldn't load candlestick data. Switched to line chart instead.",
            variant: "warning",
          })
        }
      }

      fetchOHLCData()
    } else {
      setIsFullDataLoaded(true)
    }
  }

  // Handle retry
  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  // Handle zoom
  const handleZoom = (direction: "in" | "out") => {
    setZoomLevel((prev) => {
      if (direction === "in" && prev < 200) {
        return prev + 10
      } else if (direction === "out" && prev > 50) {
        return prev - 10
      }
      return prev
    })
  }

  // Handle auto-refresh toggle
  const handleAutoRefreshToggle = () => {
    const newState = !autoRefresh
    setAutoRefresh(newState)

    if (newState) {
      toast({
        title: "Auto-refresh enabled",
        description: `Chart will refresh automatically based on the selected timeframe.`,
        variant: "default",
      })
    } else {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
        refreshTimerRef.current = null
      }

      toast({
        title: "Auto-refresh disabled",
        description: "Chart will no longer refresh automatically.",
        variant: "default",
      })
    }
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload

      return (
        <div className="bg-background/95 backdrop-blur-sm p-3 border rounded-md shadow-md dark:bg-zinc-900/90 dark:border-zinc-700/50 dark:shadow-dark-glow-sm">
          <p className="text-sm font-medium dark:text-zinc-200">
            {data.date instanceof Date ? data.date.toLocaleString() : new Date(data.timestamp).toLocaleString()}
          </p>
          <p className="text-sm font-semibold dark:text-white">{formatCurrency(payload[0].value)}</p>

          {/* Show OHLC data if available */}
          {chartType === "candle" && payload[0].payload.open !== undefined && (
            <div className="mt-1 text-xs space-y-1">
              <div className="grid grid-cols-2 gap-x-4">
                <span className="text-muted-foreground dark:text-zinc-400">Open:</span>
                <span className="font-medium dark:text-zinc-300">{formatCurrency(payload[0].payload.open)}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4">
                <span className="text-muted-foreground dark:text-zinc-400">High:</span>
                <span className="font-medium text-green-500 dark:text-green-400">
                  {formatCurrency(payload[0].payload.high)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-4">
                <span className="text-muted-foreground dark:text-zinc-400">Low:</span>
                <span className="font-medium text-red-500 dark:text-red-400">
                  {formatCurrency(payload[0].payload.low)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-4">
                <span className="text-muted-foreground dark:text-zinc-400">Close:</span>
                <span className="font-medium dark:text-zinc-300">{formatCurrency(payload[0].payload.close)}</span>
              </div>
            </div>
          )}

          {/* Show volume if available */}
          {showVolume && payload.length > 1 && payload[1] && payload[1].value !== undefined && (
            <div className="mt-1 text-xs">
              <div className="grid grid-cols-2 gap-x-4">
                <span className="text-muted-foreground dark:text-zinc-400">Volume:</span>
                <span className="font-medium dark:text-zinc-300">{formatCurrency(payload[1].value)}</span>
              </div>
            </div>
          )}
        </div>
      )
    }
    return null
  }

  // Custom volume bar component
  const CustomVolumeBar = (props: any) => {
    const { x, y, width, height, payload } = props

    // Determine if this bar represents a price increase or decrease
    const isUp = payload.close >= payload.open

    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={isUp ? chartColors.volume.up : chartColors.volume.down}
        className="transition-colors duration-200"
      />
    )
  }

  // Find min and max prices for chart scaling
  const priceExtent = useMemo(() => {
    if (chartData.length === 0) return [0, 0]

    let minPrice, maxPrice

    if (chartType === "candle" && ohlcData.length > 0) {
      minPrice = Math.min(...ohlcData.map((d) => d.low))
      maxPrice = Math.max(...ohlcData.map((d) => d.high))
    } else {
      minPrice = Math.min(...chartData.map((d) => d.price))
      maxPrice = Math.max(...chartData.map((d) => d.price))
    }

    // Add some padding
    const padding = (maxPrice - minPrice) * 0.05
    return [minPrice - padding, maxPrice + padding]
  }, [chartData, ohlcData, chartType])

  // Calculate chart height based on fullscreen mode and container size
  const chartHeight = useMemo(() => {
    if (fullscreen) return "calc(100vh - 200px)"
    return showVolume ? 400 : 500
  }, [fullscreen, showVolume])

  // Render the chart based on the selected type
  const renderChart = () => {
    if (loading) {
      return (
        <div className="w-full h-[400px] flex items-center justify-center">
          <Skeleton className="h-[400px] w-full dark:bg-zinc-800/30" />
        </div>
      )
    }

    if (error) {
      return (
        <div className="w-full h-[400px] flex items-center justify-center">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto dark:text-red-400" />
            <p className="text-muted-foreground dark:text-zinc-400">{error}</p>
            <Button
              variant="outline"
              onClick={handleRetry}
              className="dark:bg-zinc-800/70 dark:border-zinc-700/50 dark:text-zinc-200"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      )
    }

    if (!isFullDataLoaded) {
      return (
        <div className="w-full h-[400px] flex items-center justify-center">
          <div className="text-center space-y-4">
            <RefreshCw className="h-12 w-12 text-primary mx-auto animate-spin dark:text-blue-400" />
            <p className="text-muted-foreground dark:text-zinc-400">Loading chart data...</p>
          </div>
        </div>
      )
    }

    if (chartData.length === 0) {
      return (
        <div className="w-full h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground dark:text-zinc-500">No chart data available</p>
        </div>
      )
    }

    // Determine the chart to render based on the selected type
    switch (chartType) {
      case "line":
        return (
          <div className="h-full w-full" style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} strokeOpacity={0.8} />}
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(timestamp) => {
                    const date = new Date(timestamp)
                    return timeRange === "1h" || timeRange === "4h"
                      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : date.toLocaleDateString()
                  }}
                  tick={{ fontSize: 12 }}
                  stroke={chartColors.text}
                  className="dark:text-zinc-500"
                  minTickGap={30}
                />
                <YAxis
                  domain={priceExtent}
                  tickFormatter={(value) => formatCurrency(value)}
                  tick={{ fontSize: 12 }}
                  stroke={chartColors.text}
                  width={80}
                  className="dark:text-zinc-500"
                  orientation="right"
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={chartColors.line}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: chartColors.line }}
                  animationDuration={500}
                  className={
                    isPriceUp
                      ? "dark:stroke-green-400 dark:filter dark:drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                      : "dark:stroke-red-400 dark:filter dark:drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                  }
                />
                {currentPrice && (
                  <ReferenceLine y={currentPrice} stroke={chartColors.line} strokeDasharray="3 3" strokeOpacity={0.7} />
                )}
                <Brush
                  dataKey="timestamp"
                  height={30}
                  stroke={chartColors.line}
                  tickFormatter={(timestamp) => {
                    const date = new Date(timestamp)
                    return timeRange === "1h" || timeRange === "4h"
                      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : date.toLocaleDateString()
                  }}
                  startIndex={Math.max(0, chartData.length - Math.floor(chartData.length * (zoomLevel / 100)))}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Volume chart if enabled */}
            {showVolume && volumeData.length > 0 && (
              <div className="h-[100px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(timestamp) => {
                        const date = new Date(timestamp)
                        return timeRange === "1h" || timeRange === "4h"
                          ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : date.toLocaleDateString()
                      }}
                      tick={{ fontSize: 10 }}
                      stroke={chartColors.text}
                      className="dark:text-zinc-500"
                      height={20}
                      minTickGap={30}
                    />
                    <YAxis
                      tickFormatter={(value) => {
                        if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`
                        if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
                        if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`
                        return value.toString()
                      }}
                      tick={{ fontSize: 10 }}
                      stroke={chartColors.text}
                      className="dark:text-zinc-500"
                      width={60}
                      orientation="right"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="volume" fill={chartColors.volume.up} name="Volume" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )

      case "area":
        return (
          <div className="h-full w-full" style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} strokeOpacity={0.8} />}
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(timestamp) => {
                    const date = new Date(timestamp)
                    return timeRange === "1h" || timeRange === "4h"
                      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : date.toLocaleDateString()
                  }}
                  tick={{ fontSize: 12 }}
                  stroke={chartColors.text}
                  className="dark:text-zinc-500"
                  minTickGap={30}
                />
                <YAxis
                  domain={priceExtent}
                  tickFormatter={(value) => formatCurrency(value)}
                  tick={{ fontSize: 12 }}
                  stroke={chartColors.text}
                  width={80}
                  className="dark:text-zinc-500"
                  orientation="right"
                />
                <Tooltip content={<CustomTooltip />} />
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.area.stroke} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={chartColors.area.stroke} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={chartColors.area.stroke}
                  fill="url(#colorPrice)"
                  fillOpacity={0.6}
                  strokeWidth={2}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: chartColors.area.stroke }}
                  animationDuration={500}
                  className={
                    isPriceUp
                      ? "dark:stroke-green-400 dark:filter dark:drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                      : "dark:stroke-red-400 dark:filter dark:drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                  }
                />
                {currentPrice && (
                  <ReferenceLine
                    y={currentPrice}
                    stroke={chartColors.area.stroke}
                    strokeDasharray="3 3"
                    strokeOpacity={0.7}
                  />
                )}
                <Brush
                  dataKey="timestamp"
                  height={30}
                  stroke={chartColors.area.stroke}
                  tickFormatter={(timestamp) => {
                    const date = new Date(timestamp)
                    return timeRange === "1h" || timeRange === "4h"
                      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : date.toLocaleDateString()
                  }}
                  startIndex={Math.max(0, chartData.length - Math.floor(chartData.length * (zoomLevel / 100)))}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Volume chart if enabled */}
            {showVolume && volumeData.length > 0 && (
              <div className="h-[100px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(timestamp) => {
                        const date = new Date(timestamp)
                        return timeRange === "1h" || timeRange === "4h"
                          ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : date.toLocaleDateString()
                      }}
                      tick={{ fontSize: 10 }}
                      stroke={chartColors.text}
                      className="dark:text-zinc-500"
                      height={20}
                      minTickGap={30}
                    />
                    <YAxis
                      tickFormatter={(value) => {
                        if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`
                        if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
                        if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`
                        return value.toString()
                      }}
                      tick={{ fontSize: 10 }}
                      stroke={chartColors.text}
                      className="dark:text-zinc-500"
                      width={60}
                      orientation="right"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="volume" fill={chartColors.volume.up} name="Volume" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )

      case "candle":
        return (
          <div className="h-full w-full" style={{ height: chartHeight }}>
            {ohlcData.length > 0 ? (
              <CandlestickChart
                data={ohlcData}
                timeRange={timeRange}
                showGrid={showGrid}
                chartColors={chartColors}
                currentPrice={currentPrice}
                zoomLevel={zoomLevel}
                priceExtent={priceExtent}
                tooltipContent={<CustomTooltip />}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <RefreshCw className="h-12 w-12 text-primary mx-auto animate-spin dark:text-blue-400" />
                  <p className="text-muted-foreground dark:text-zinc-500">Loading candlestick data...</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setChartType("line")}
                    className="dark:bg-zinc-800/70 dark:border-zinc-700/50 dark:text-zinc-200"
                  >
                    Switch to Line Chart
                  </Button>
                </div>
              </div>
            )}

            {/* Volume chart if enabled */}
            {showVolume && volumeData.length > 0 && (
              <div className="h-[100px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ohlcData.length > 0 ? ohlcData : volumeData}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  >
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(timestamp) => {
                        const date = new Date(timestamp)
                        return timeRange === "1h" || timeRange === "4h"
                          ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : date.toLocaleDateString()
                      }}
                      tick={{ fontSize: 10 }}
                      stroke={chartColors.text}
                      className="dark:text-zinc-500"
                      height={20}
                      minTickGap={30}
                    />
                    <YAxis
                      tickFormatter={(value) => {
                        if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`
                        if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
                        if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`
                        return value.toString()
                      }}
                      tick={{ fontSize: 10 }}
                      stroke={chartColors.text}
                      className="dark:text-zinc-500"
                      width={60}
                      orientation="right"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="volume" fill={chartColors.volume.up} shape={<CustomVolumeBar />} name="Volume" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )

      case "bar":
        return (
          <div className="h-full w-full" style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} strokeOpacity={0.8} />}
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(timestamp) => {
                    const date = new Date(timestamp)
                    return timeRange === "1h" || timeRange === "4h"
                      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : date.toLocaleDateString()
                  }}
                  tick={{ fontSize: 12 }}
                  stroke={chartColors.text}
                  className="dark:text-zinc-500"
                  minTickGap={30}
                />
                <YAxis
                  domain={priceExtent}
                  tickFormatter={(value) => formatCurrency(value)}
                  tick={{ fontSize: 12 }}
                  stroke={chartColors.text}
                  width={80}
                  className="dark:text-zinc-500"
                  orientation="right"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="price"
                  fill={chartColors.area.stroke}
                  name="Price"
                  animationDuration={500}
                  className={
                    isPriceUp
                      ? "dark:fill-green-400/70 dark:filter dark:drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                      : "dark:fill-red-400/70 dark:filter dark:drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                  }
                />
                {currentPrice && (
                  <ReferenceLine
                    y={currentPrice}
                    stroke={chartColors.area.stroke}
                    strokeDasharray="3 3"
                    strokeOpacity={0.7}
                  />
                )}
                <Brush
                  dataKey="timestamp"
                  height={30}
                  stroke={chartColors.area.stroke}
                  tickFormatter={(timestamp) => {
                    const date = new Date(timestamp)
                    return timeRange === "1h" || timeRange === "4h"
                      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : date.toLocaleDateString()
                  }}
                  startIndex={Math.max(0, chartData.length - Math.floor(chartData.length * (zoomLevel / 100)))}
                />
              </BarChart>
            </ResponsiveContainer>

            {/* Volume chart if enabled */}
            {showVolume && volumeData.length > 0 && (
              <div className="h-[100px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(timestamp) => {
                        const date = new Date(timestamp)
                        return timeRange === "1h" || timeRange === "4h"
                          ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : date.toLocaleDateString()
                      }}
                      tick={{ fontSize: 10 }}
                      stroke={chartColors.text}
                      className="dark:text-zinc-500"
                      height={20}
                      minTickGap={30}
                    />
                    <YAxis
                      tickFormatter={(value) => {
                        if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`
                        if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
                        if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`
                        return value.toString()
                      }}
                      tick={{ fontSize: 10 }}
                      stroke={chartColors.text}
                      className="dark:text-zinc-500"
                      width={60}
                      orientation="right"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="volume" fill={chartColors.volume.up} name="Volume" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="w-full h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground dark:text-zinc-500">Invalid chart type selected</p>
          </div>
        )
    }
  }

  return (
    <Card
      className={`border dark:border-zinc-800/50 dark:shadow-dark-card dark:hover:shadow-dark-card-hover transition-all overflow-hidden ${fullscreen ? "fixed inset-4 z-50 m-auto" : ""}`}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/30 dark:bg-zinc-800/30 dark:border-b dark:border-zinc-800/50">
        <div>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary dark:text-blue-400 dark:animate-pulse-glow-dark" />
            <span className="dark:text-white dark:font-bold">
              {coinName ? `${coinName} (${coinSymbol.toUpperCase()})` : "Price Chart"}
            </span>
            {currentPrice !== null && (
              <span className="text-lg font-medium dark:text-zinc-200 ml-2">{formatCurrency(currentPrice)}</span>
            )}
            {priceChangePercent !== null && (
              <span
                className={`text-sm flex items-center ${
                  isPriceUp ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"
                }`}
              >
                {isPriceUp ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                {formatPercentage(priceChangePercent)}
              </span>
            )}
          </CardTitle>
          {lastUpdated && (
            <CardDescription className="text-xs text-muted-foreground dark:text-zinc-500 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Last updated: {lastUpdated.toLocaleTimeString()}
              {isRealtime && (
                <span className="ml-2 text-xs bg-green-500/10 text-green-600 dark:bg-green-900/20 dark:text-green-400 px-1.5 py-0.5 rounded-full flex items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 dark:bg-green-400 mr-1 animate-pulse"></span>
                  Live
                </span>
              )}
            </CardDescription>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="dark:bg-zinc-800/50 dark:border-zinc-700/50 dark:text-zinc-200 dark:hover:shadow-dark-glow-sm"
          >
            <Settings className="h-4 w-4" />
            <span className="sr-only">Chart Settings</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRetry}
            className="dark:bg-zinc-800/50 dark:border-zinc-700/50 dark:text-zinc-200 dark:hover:shadow-dark-glow-sm"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Refresh Chart</span>
          </Button>

          {onToggleFullscreen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFullscreen}
              className="dark:bg-zinc-800/50 dark:border-zinc-700/50 dark:text-zinc-200 dark:hover:shadow-dark-glow-sm"
            >
              {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              <span className="sr-only">{fullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="dark:bg-dark-gradient-card p-0">
        {/* Chart controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-4 border-b dark:border-zinc-800/50">
          <div className="flex flex-wrap items-center gap-2">
            {/* Timeframe selector */}
            <Tabs value={timeRange} onValueChange={setTimeRange} className="mr-4">
              <TabsList className="bg-muted/50 dark:bg-zinc-800/50 p-1 rounded-md dark:border dark:border-zinc-700/50">
                {TIMEFRAMES.map((tf) => (
                  <TabsTrigger
                    key={tf.value}
                    value={tf.value}
                    className="data-[state=active]:shadow-glow-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:text-zinc-400 dark:data-[state=active]:text-zinc-900 dark:data-[state=active]:bg-blue-500 dark:data-[state=active]:shadow-dark-glow"
                  >
                    {tf.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Chart type selector */}
            <div className="flex items-center gap-2">
              {CHART_TYPES.map((type) => {
                const Icon = type.icon
                return (
                  <Button
                    key={type.value}
                    variant={chartType === type.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleChartTypeChange(type.value)}
                    className={`${chartType === type.value ? "hover:shadow-glow-primary dark:bg-blue-600 dark:hover:bg-blue-500 dark:shadow-dark-glow dark:hover:shadow-dark-glow-lg" : "dark:bg-zinc-800/70 dark:border-zinc-700/50 dark:text-zinc-200 dark:hover:shadow-dark-glow-sm"}`}
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {type.label}
                  </Button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom controls */}
            <div className="flex items-center">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleZoom("out")}
                disabled={zoomLevel <= 50}
                className="h-8 w-8 rounded-r-none dark:bg-zinc-800/70 dark:border-zinc-700/50 dark:text-zinc-200 dark:hover:shadow-dark-glow-sm"
              >
                <ZoomOut className="h-4 w-4" />
                <span className="sr-only">Zoom Out</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleZoom("in")}
                disabled={zoomLevel >= 200}
                className="h-8 w-8 rounded-l-none dark:bg-zinc-800/70 dark:border-zinc-700/50 dark:text-zinc-200 dark:hover:shadow-dark-glow-sm"
              >
                <ZoomIn className="h-4 w-4" />
                <span className="sr-only">Zoom In</span>
              </Button>
            </div>

            {/* Auto-refresh toggle */}
            <div className="flex items-center gap-2">
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={handleAutoRefreshToggle}
                className="data-[state=checked]:bg-primary data-[state=checked]:dark:bg-blue-600"
              />
              <Label htmlFor="auto-refresh" className="text-sm dark:text-zinc-400">
                Auto-refresh
              </Label>
            </div>
          </div>
        </div>

        {/* Settings panel */}
        {isSettingsOpen && (
          <div className="p-4 border-b dark:border-zinc-800/50 bg-muted/20 dark:bg-zinc-800/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium dark:text-zinc-300">Chart Options</h4>
                <div className="flex items-center gap-2">
                  <Switch
                    id="show-volume"
                    checked={showVolume}
                    onCheckedChange={setShowVolume}
                    className="data-[state=checked]:bg-primary data-[state=checked]:dark:bg-blue-600"
                  />
                  <Label htmlFor="show-volume" className="text-sm dark:text-zinc-400">
                    Show Volume
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="show-grid"
                    checked={showGrid}
                    onCheckedChange={setShowGrid}
                    className="data-[state=checked]:bg-primary data-[state=checked]:dark:bg-blue-600"
                  />
                  <Label htmlFor="show-grid" className="text-sm dark:text-zinc-400">
                    Show Grid
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium dark:text-zinc-300">Chart Theme</h4>
                <Select value={chartTheme} onValueChange={setChartTheme}>
                  <SelectTrigger className="w-full dark:bg-zinc-800/70 dark:border-zinc-700/50 dark:text-zinc-200">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-zinc-900 dark:border-zinc-700">
                    {CHART_THEMES.map((theme) => (
                      <SelectItem
                        key={theme.value}
                        value={theme.value}
                        className="dark:text-zinc-200 dark:focus:bg-zinc-800"
                      >
                        {theme.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium dark:text-zinc-300">Zoom Level: {zoomLevel}%</h4>
                <Slider
                  value={[zoomLevel]}
                  min={50}
                  max={200}
                  step={10}
                  onValueChange={(value) => setZoomLevel(value[0])}
                  className="dark:bg-zinc-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="p-4" ref={chartContainerRef}>
          {renderChart()}
        </div>
      </CardContent>
    </Card>
  )
}

