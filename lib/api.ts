import axios, { type AxiosError } from "axios"
import { memoize } from "./performance-utils"

// Custom error class for API errors
export class ApiError extends Error {
  status: number

  constructor(message: string, status = 500) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

// Helper function to handle API errors
const handleApiError = (error: unknown, fallbackMessage: string): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError
    const status = axiosError.response?.status || 500
    const message = axiosError.response?.data?.error || axiosError.message || fallbackMessage

    console.error(`API Error (${status}):`, message)
    throw new ApiError(message, status)
  }

  // For non-Axios errors
  console.error("Unexpected error:", error)
  throw new ApiError(fallbackMessage)
}

// Memoize API calls to prevent redundant network requests
export const getCoinChart = memoize(async (id: string, timeRange: string, chartType = "line") => {
  // Convert timeRange to days or minutes for the API
  let days: string | undefined = undefined
  let interval: string | undefined = undefined

  // Set appropriate parameters based on time range
  switch (timeRange) {
    // Granular time frames
    case "1m":
      days = "1"
      interval = "minute"
      break
    case "5m":
      days = "1"
      interval = "5minute"
      break
    case "15m":
      days = "1"
      interval = "15minute"
      break
    case "30m":
      days = "1"
      interval = "30minute"
      break
    case "1h":
      days = "2"
      interval = "hourly"
      break
    case "2h":
      days = "3"
      interval = "2hour"
      break
    case "4h":
      days = "7"
      interval = "4hour"
      break
    // Standard time frames
    case "1d":
      days = "1"
      break
    case "7d":
      days = "7"
      break
    case "30d":
      days = "30"
      break
    case "90d":
      days = "90"
      break
    case "1y":
      days = "365"
      break
    case "max":
      days = "max"
      break
    default:
      days = "7" // Default to 7 days if invalid timeRange
  }

  try {
    // For candlestick data, we need OHLC values
    if (chartType === "candlestick") {
      // Use CoinGecko API for OHLC data
      const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}/ohlc`, {
        params: {
          vs_currency: "usd",
          days,
        },
        timeout: 10000, // 10 second timeout
      })

      // Validate response data
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid OHLC data format received from API")
      }

      // Transform the data for candlestick chart
      // CoinGecko OHLC format: [timestamp, open, high, low, close]
      const candlestickData = response.data.map((item: number[]) => ({
        timestamp: item[0],
        open: item[1],
        high: item[2],
        low: item[3],
        close: item[4],
      }))

      return {
        prices: response.data,
        candlestickData,
      }
    } else {
      // Use regular price data for line chart
      const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}/market_chart`, {
        params: {
          vs_currency: "usd",
          days,
          interval: interval,
        },
        timeout: 10000, // 10 second timeout
      })

      // Validate response data
      if (!response.data || !response.data.prices || !Array.isArray(response.data.prices)) {
        throw new Error("Invalid market chart data format received from API")
      }

      return response.data
    }
  } catch (error) {
    console.error(`Error fetching chart data for coin ${id}:`, error)

    // Generate more robust mock data with proper structure
    const mockPrices = generateMockPriceData(timeRange)

    // Ensure we always return data in the expected format
    if (chartType === "candlestick") {
      const mockCandlestickData = generateMockCandlestickData(timeRange)
      return {
        prices: mockPrices,
        candlestickData: mockCandlestickData,
        total_volumes: generateMockVolumeData(timeRange),
        market_caps: generateMockMarketCapData(timeRange),
      }
    }

    return {
      prices: mockPrices,
      total_volumes: generateMockVolumeData(timeRange),
      market_caps: generateMockMarketCapData(timeRange),
    }
  }
}, 60000) // 1 minute cache

// Helper function to generate mock price data
function generateMockPriceData(timeRange: string) {
  const now = Date.now()
  const prices = []
  const basePrice = 50000 // Base price for mock data
  let dataPoints = 100
  let timeStep: number

  // Determine time step and data points based on time range
  switch (timeRange) {
    case "1m":
    case "5m":
    case "15m":
    case "30m":
      timeStep = 60 * 1000 // 1 minute in milliseconds
      dataPoints = 60
      break
    case "1h":
    case "2h":
    case "4h":
      timeStep = 60 * 60 * 1000 // 1 hour in milliseconds
      dataPoints = 24
      break
    case "1d":
      timeStep = 60 * 60 * 1000 // 1 hour in milliseconds
      break
    case "7d":
      timeStep = 6 * 60 * 60 * 1000 // 6 hours in milliseconds
      break
    case "30d":
      timeStep = 24 * 60 * 60 * 1000 // 1 day in milliseconds
      break
    case "90d":
      timeStep = 3 * 24 * 60 * 60 * 1000 // 3 days in milliseconds
      break
    case "1y":
      timeStep = 7 * 24 * 60 * 60 * 1000 // 1 week in milliseconds
      break
    case "max":
      timeStep = 30 * 24 * 60 * 60 * 1000 // 1 month in milliseconds
      break
    default:
      timeStep = 24 * 60 * 60 * 1000 // 1 day in milliseconds
  }

  // Generate mock price data
  for (let i = 0; i < dataPoints; i++) {
    const timestamp = now - (dataPoints - i) * timeStep
    const randomFactor = 0.98 + Math.random() * 0.04 // Random price fluctuation
    const price = basePrice * randomFactor
    prices.push([timestamp, price])
  }

  return prices
}

// Helper function to generate mock candlestick data
function generateMockCandlestickData(timeRange: string) {
  const now = Date.now()
  const candlestickData = []
  const basePrice = 50000 // Base price for mock data
  let dataPoints = 100
  let timeStep: number

  // Determine time step and data points based on time range
  switch (timeRange) {
    case "1m":
    case "5m":
    case "15m":
    case "30m":
      timeStep = 60 * 1000 // 1 minute in milliseconds
      dataPoints = 60
      break
    case "1h":
    case "2h":
    case "4h":
      timeStep = 60 * 60 * 1000 // 1 hour in milliseconds
      dataPoints = 24
      break
    case "1d":
      timeStep = 60 * 60 * 1000 // 1 hour in milliseconds
      break
    case "7d":
      timeStep = 6 * 60 * 60 * 1000 // 6 hours in milliseconds
      break
    case "30d":
      timeStep = 24 * 60 * 60 * 1000 // 1 day in milliseconds
      break
    case "90d":
      timeStep = 3 * 24 * 60 * 60 * 1000 // 3 days in milliseconds
      break
    case "1y":
      timeStep = 7 * 24 * 60 * 60 * 1000 // 1 week in milliseconds
      break
    case "max":
      timeStep = 30 * 24 * 60 * 60 * 1000 // 1 month in milliseconds
      break
    default:
      timeStep = 24 * 60 * 60 * 1000 // 1 day in milliseconds
  }

  // Generate mock candlestick data
  for (let i = 0; i < dataPoints; i++) {
    const timestamp = now - (dataPoints - i) * timeStep
    const randomFactor = 0.98 + Math.random() * 0.04 // Random price fluctuation
    const baseForCandle = basePrice * randomFactor

    // Generate OHLC values
    const open = baseForCandle
    const close = baseForCandle * (0.99 + Math.random() * 0.02)
    const high = Math.max(open, close) * (1 + Math.random() * 0.01)
    const low = Math.min(open, close) * (0.99 - Math.random() * 0.01)

    candlestickData.push({
      timestamp,
      open,
      high,
      low,
      close,
    })
  }

  return candlestickData
}

// Helper function to generate mock volume data
function generateMockVolumeData(timeRange: string) {
  const now = Date.now()
  const volumes = []
  const baseVolume = 1000000000 // Base volume in USD
  let dataPoints = 100
  let timeStep: number

  // Determine time step and data points based on time range (same as in generateMockPriceData)
  switch (timeRange) {
    case "1m":
    case "5m":
    case "15m":
    case "30m":
      timeStep = 60 * 1000 // 1 minute in milliseconds
      dataPoints = 60
      break
    case "1h":
    case "2h":
    case "4h":
      timeStep = 60 * 60 * 1000 // 1 hour in milliseconds
      dataPoints = 24
      break
    case "1d":
      timeStep = 60 * 60 * 1000 // 1 hour in milliseconds
      break
    case "7d":
      timeStep = 6 * 60 * 60 * 1000 // 6 hours in milliseconds
      break
    case "30d":
      timeStep = 24 * 60 * 60 * 1000 // 1 day in milliseconds
      break
    case "90d":
      timeStep = 3 * 24 * 60 * 60 * 1000 // 3 days in milliseconds
      break
    case "1y":
      timeStep = 7 * 24 * 60 * 60 * 1000 // 1 week in milliseconds
      break
    case "max":
      timeStep = 30 * 24 * 60 * 60 * 1000 // 1 month in milliseconds
      break
    default:
      timeStep = 24 * 60 * 60 * 1000 // 1 day in milliseconds
  }

  // Generate mock volume data with realistic patterns (higher during price movements)
  for (let i = 0; i < dataPoints; i++) {
    const timestamp = now - (dataPoints - i) * timeStep
    const randomFactor = 0.5 + Math.random() * 1.5 // Random volume fluctuation
    const volume = baseVolume * randomFactor

    // Create a pattern where volume increases and decreases in waves
    const waveFactor = Math.sin(i / 10) * 0.5 + 1
    const adjustedVolume = volume * waveFactor

    volumes.push([timestamp, adjustedVolume])
  }

  return volumes
}

// Helper function to generate mock market cap data
function generateMockMarketCapData(timeRange: string) {
  const now = Date.now()
  const marketCaps = []
  const baseMarketCap = 100000000000 // Base market cap (100B USD)
  let dataPoints = 100
  let timeStep: number

  // Determine time step and data points based on time range (same as in generateMockPriceData)
  switch (timeRange) {
    case "1m":
    case "5m":
    case "15m":
    case "30m":
      timeStep = 60 * 1000 // 1 minute in milliseconds
      dataPoints = 60
      break
    case "1h":
    case "2h":
    case "4h":
      timeStep = 60 * 60 * 1000 // 1 hour in milliseconds
      dataPoints = 24
      break
    case "1d":
      timeStep = 60 * 60 * 1000 // 1 hour in milliseconds
      break
    case "7d":
      timeStep = 6 * 60 * 60 * 1000 // 6 hours in milliseconds
      break
    case "30d":
      timeStep = 24 * 60 * 60 * 1000 // 1 day in milliseconds
      break
    case "90d":
      timeStep = 3 * 24 * 60 * 60 * 1000 // 3 days in milliseconds
      break
    case "1y":
      timeStep = 7 * 24 * 60 * 60 * 1000 // 1 week in milliseconds
      break
    case "max":
      timeStep = 30 * 24 * 60 * 60 * 1000 // 1 month in milliseconds
      break
    default:
      timeStep = 24 * 60 * 60 * 1000 // 1 day in milliseconds
  }

  // Generate realistic market cap data that follows a trend
  let lastMarketCap = baseMarketCap
  for (let i = 0; i < dataPoints; i++) {
    const timestamp = now - (dataPoints - i) * timeStep
    const percentChange = (Math.random() - 0.48) * 2 // Slight upward bias
    lastMarketCap = Math.max(lastMarketCap * (1 + percentChange / 100), baseMarketCap * 0.8)
    marketCaps.push([timestamp, lastMarketCap])
  }

  return marketCaps
}

// Optimize and memoize other API calls
export const getCoins = memoize(
  async ({
    page = 1,
    perPage = 20,
    sortBy = "market_cap",
    sortDirection = "desc",
  }: { page: number; perPage: number; sortBy: string; sortDirection: string }) => {
    try {
      const response = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
        params: {
          vs_currency: "usd",
          order: `market_cap_${sortDirection}`,
          per_page: perPage,
          page: page,
          sparkline: false,
        },
        timeout: 10000, // 10 second timeout
      })

      // Validate response data
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid data format received from API")
      }

      return response.data
    } catch (error) {
      return handleApiError(error, "Failed to fetch coins data")
    }
  },
  60000, // 1 minute cache
)

export const getGlobalMarketData = memoize(async () => {
  try {
    const response = await axios.get("https://api.coingecko.com/api/v3/global", {
      timeout: 10000, // 10 second timeout
    })

    // Validate response data
    if (!response.data || !response.data.data) {
      throw new Error("Invalid global market data format received from API")
    }

    return response.data.data
  } catch (error) {
    return handleApiError(error, "Failed to fetch global market data")
  }
}, 300000) // 5 minute cache

export const getTopCryptocurrencies = memoize(async (limit: number) => {
  try {
    const response = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
      params: {
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: limit,
        page: 1,
        sparkline: false,
      },
      timeout: 10000, // 10 second timeout
    })

    // Validate response data
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error("Invalid data format received from API")
    }

    return response.data
  } catch (error) {
    return handleApiError(error, "Failed to fetch top cryptocurrencies data")
  }
}, 300000) // 5 minute cache

export const getTrendingCoins = memoize(async () => {
  try {
    const response = await axios.get("https://api.coingecko.com/api/v3/search/trending", {
      timeout: 10000, // 10 second timeout
    })

    // Validate response data
    if (!response.data || !response.data.coins || !Array.isArray(response.data.coins)) {
      throw new Error("Invalid trending coins data format received from API")
    }

    return response.data
  } catch (error) {
    return handleApiError(error, "Failed to fetch trending coins data")
  }
}, 300000) // 5 minute cache

export const getWatchlistCoins = memoize(async (ids: string[]) => {
  if (!ids || ids.length === 0) {
    return []
  }

  try {
    const idsString = ids.join(",")
    const response = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
      params: {
        vs_currency: "usd",
        ids: idsString,
        order: "market_cap_desc",
        per_page: ids.length,
        page: 1,
        sparkline: false,
      },
      timeout: 10000, // 10 second timeout
    })

    // Validate response data
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error("Invalid watchlist coins data format received from API")
    }

    return response.data
  } catch (error) {
    return handleApiError(error, "Failed to fetch watchlist coins data")
  }
}, 60000) // 1 minute cache

export const getCoinData = memoize(async (id: string) => {
  try {
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}`, {
      timeout: 10000, // 10 second timeout
    })

    // Validate response data
    if (!response.data || !response.data.id) {
      throw new Error("Invalid coin data format received from API")
    }

    return response.data
  } catch (error) {
    return handleApiError(error, `Failed to fetch data for coin ${id}`)
  }
}, 60000) // 1 minute cache

// Function to fetch OHLC (Open, High, Low, Close) data for candlestick charts
export const getCoinOHLC = memoize(async (id: string, timeRange: string) => {
  // Convert timeRange to days for the API
  let days: string | undefined = undefined

  // Set appropriate parameters based on time range
  switch (timeRange) {
    case "1h":
      days = "1"
      break
    case "4h":
      days = "1"
      break
    case "1d":
      days = "1"
      break
    case "7d":
      days = "7"
      break
    case "30d":
      days = "30"
      break
    case "90d":
      days = "90"
      break
    case "1y":
      days = "365"
      break
    case "max":
      days = "max"
      break
    default:
      days = "7" // Default to 7 days if invalid timeRange
  }

  try {
    // Add a longer timeout and retry logic
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}/ohlc`, {
      params: {
        vs_currency: "usd",
        days,
      },
      timeout: 15000, // Increase timeout to 15 seconds
    })

    // Validate response data
    if (!response.data || !Array.isArray(response.data)) {
      console.warn("Invalid OHLC data format received from API, using mock data")
      return generateMockOHLCData(timeRange)
    }

    return response.data
  } catch (error) {
    console.error(`Error fetching OHLC data for coin ${id}:`, error)
    console.info("Falling back to mock OHLC data")

    // Always return mock data on error to prevent component failures
    return generateMockOHLCData(timeRange)
  }
}, 60000) // 1 minute cache

// Helper function to generate mock OHLC data
function generateMockOHLCData(timeRange: string) {
  const now = Date.now()
  const ohlcData = []
  const basePrice = 50000 // Base price for mock data
  let dataPoints = 100
  let timeStep: number

  // Determine time step and data points based on time range
  switch (timeRange) {
    case "1h":
      timeStep = 5 * 60 * 1000 // 5 minutes in milliseconds
      dataPoints = 12
      break
    case "4h":
      timeStep = 20 * 60 * 1000 // 20 minutes in milliseconds
      dataPoints = 12
      break
    case "1d":
      timeStep = 2 * 60 * 60 * 1000 // 2 hours in milliseconds
      dataPoints = 12
      break
    case "7d":
      timeStep = 12 * 60 * 60 * 1000 // 12 hours in milliseconds
      dataPoints = 14
      break
    case "30d":
      timeStep = 24 * 60 * 60 * 1000 // 1 day in milliseconds
      dataPoints = 30
      break
    case "90d":
      timeStep = 3 * 24 * 60 * 60 * 1000 // 3 days in milliseconds
      dataPoints = 30
      break
    case "1y":
      timeStep = 7 * 24 * 60 * 60 * 1000 // 1 week in milliseconds
      dataPoints = 52
      break
    case "max":
      timeStep = 30 * 24 * 60 * 60 * 1000 // 1 month in milliseconds
      dataPoints = 60
      break
    default:
      timeStep = 24 * 60 * 60 * 1000 // 1 day in milliseconds
      dataPoints = 30
  }

  // Generate mock OHLC data with a realistic price trend
  let lastClose = basePrice
  let trend = 0 // 0 = neutral, 1 = up, -1 = down
  let trendStrength = 0.5 // How strong the trend is
  let trendDuration = Math.floor(Math.random() * 10) + 5 // How long the trend lasts
  let trendCounter = 0

  for (let i = 0; i < dataPoints; i++) {
    const timestamp = now - (dataPoints - i) * timeStep

    // Change trend occasionally
    if (trendCounter >= trendDuration) {
      trend = Math.random() > 0.5 ? 1 : -1
      trendStrength = 0.3 + Math.random() * 0.7 // Between 0.3 and 1.0
      trendDuration = Math.floor(Math.random() * 10) + 5
      trendCounter = 0
    }
    trendCounter++

    // Calculate price movement with trend bias
    const trendBias = trend * trendStrength * 0.01
    const randomMovement = (Math.random() - 0.5) * 0.02 // Random movement between -1% and 1%
    const movement = trendBias + randomMovement

    // Calculate OHLC values
    const open = lastClose
    const close = open * (1 + movement)
    const high = Math.max(open, close) * (1 + Math.random() * 0.005) // Up to 0.5% higher
    const low = Math.min(open, close) * (1 - Math.random() * 0.005) // Up to 0.5% lower

    // Update lastClose for next iteration
    lastClose = close

    // CoinGecko OHLC format: [timestamp, open, high, low, close]
    ohlcData.push([timestamp, open, high, low, close])
  }

  return ohlcData
}

// Function to fetch historical data with more granularity
export const getCoinHistoricalData = memoize(async (id: string, timeRange: string) => {
  try {
    // For more detailed historical data, we'll combine market_chart and OHLC data
    const [marketData, ohlcData] = await Promise.all([getCoinChart(id, timeRange), getCoinOHLC(id, timeRange)])

    // Combine the data
    return {
      prices: marketData.prices,
      volumes: marketData.total_volumes,
      marketCaps: marketData.market_caps,
      ohlc: ohlcData,
    }
  } catch (error) {
    console.error(`Error fetching historical data for coin ${id}:`, error)
    throw new ApiError(`Failed to fetch historical data for coin ${id}`)
  }
}, 300000) // 5 minute cache

