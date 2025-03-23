"use client"

import type React from "react"

import { useMemo } from "react"
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Brush,
  Rectangle,
} from "recharts"
import { formatCurrency } from "@/lib/utils"

interface CandlestickProps {
  x: number
  y: number
  width: number
  height: number
  open: number
  close: number
  high: number
  low: number
  fill: string
  stroke: string
}

// Custom candlestick component
const Candlestick = (props: CandlestickProps) => {
  const { x, y, width, height, open, close, low, high, fill, stroke } = props

  // Safety check for invalid data
  if (
    typeof open !== "number" ||
    typeof close !== "number" ||
    typeof low !== "number" ||
    typeof high !== "number" ||
    isNaN(open) ||
    isNaN(close) ||
    isNaN(low) ||
    isNaN(high) ||
    high === low || // Prevent division by zero
    !isFinite(open) ||
    !isFinite(close) ||
    !isFinite(low) ||
    !isFinite(high)
  ) {
    // Return a fallback rectangle for invalid data
    return (
      <rect x={x} y={y} width={width} height={height} fill="rgba(150,150,150,0.3)" stroke="rgba(150,150,150,0.5)" />
    )
  }

  const isUp = close >= open

  // Calculate positions with safety checks
  const range = Math.max(0.001, high - low) // Prevent division by zero
  const bodyY = isUp ? y + (height * (high - close)) / range : y + (height * (high - open)) / range
  const bodyHeight = Math.max(1, isUp ? (height * (close - open)) / range : (height * (open - close)) / range)

  // Calculate wick positions
  const wickX = x + width / 2
  const wickTop = y
  const wickBottom = y + height

  return (
    <g>
      {/* Wick */}
      <line x1={wickX} y1={wickTop} x2={wickX} y2={wickBottom} stroke={stroke} strokeWidth={1} />

      {/* Body */}
      <rect
        x={x}
        y={bodyY}
        width={width}
        height={Math.max(1, bodyHeight)} // Ensure minimum height of 1px
        fill={isUp ? fill : "transparent"}
        stroke={stroke}
        strokeWidth={1}
      />
    </g>
  )
}

interface CandlestickChartProps {
  data: any[]
  timeRange: string
  showGrid: boolean
  chartColors: any
  currentPrice: number | null
  zoomLevel: number
  priceExtent: [number, number]
  tooltipContent: React.ReactNode
}

export function CandlestickChart({
  data,
  timeRange,
  showGrid,
  chartColors,
  currentPrice,
  zoomLevel,
  priceExtent,
  tooltipContent,
}: CandlestickChartProps) {
  // Calculate candlestick width based on data length
  const candleWidth = useMemo(() => {
    const baseWidth = 10
    const dataLength = data.length

    if (dataLength > 100) return 4
    if (dataLength > 50) return 6
    if (dataLength > 30) return 8

    return baseWidth
  }, [data.length])

  // Custom renderer for candlesticks
  const renderCandlestick = (props: any) => {
    const { x, y, width, height, index } = props

    // Safety check for invalid index
    if (index < 0 || index >= data.length) {
      return null
    }

    const item = data[index]

    if (
      !item ||
      typeof item.open !== "number" ||
      typeof item.close !== "number" ||
      typeof item.high !== "number" ||
      typeof item.low !== "number" ||
      isNaN(item.open) ||
      isNaN(item.close) ||
      isNaN(item.high) ||
      isNaN(item.low)
    ) {
      // Return a placeholder candlestick for invalid data
      return (
        <rect
          x={x - candleWidth / 2}
          y={y}
          width={candleWidth}
          height={height}
          fill="rgba(150,150,150,0.3)"
          stroke="rgba(150,150,150,0.5)"
        />
      )
    }

    const { open, close, high, low } = item
    const isUp = close >= open

    return (
      <Candlestick
        x={x - candleWidth / 2}
        y={y}
        width={candleWidth}
        height={height}
        open={open}
        close={close}
        high={high}
        low={low}
        fill={isUp ? chartColors.volume.up : "transparent"}
        stroke={isUp ? chartColors.area.stroke : chartColors.line}
      />
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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
        <Tooltip content={tooltipContent} />

        {/* Custom renderer for candlesticks */}
        {data.map((entry, index) => (
          <Rectangle
            key={`candle-${index}`}
            x={0}
            y={0}
            width={0}
            height={0}
            dataKey="high"
            shape={renderCandlestick}
          />
        ))}

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
          startIndex={Math.max(0, data.length - Math.floor(data.length * (zoomLevel / 100)))}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

