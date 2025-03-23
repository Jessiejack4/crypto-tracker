"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"

interface WatchlistContextType {
  watchlist: string[]
  addToWatchlist: (coinId: string) => void
  removeFromWatchlist: (coinId: string) => void
  clearWatchlist: () => void
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined)

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<string[]>([])

  // Load watchlist from localStorage on component mount
  useEffect(() => {
    const storedWatchlist = localStorage.getItem("watchlist")
    if (storedWatchlist) {
      try {
        setWatchlist(JSON.parse(storedWatchlist))
      } catch (error) {
        console.error("Failed to parse watchlist from localStorage:", error)
        setWatchlist([])
      }
    }
  }, [])

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(watchlist))
  }, [watchlist])

  const addToWatchlist = (coinId: string) => {
    if (!watchlist.includes(coinId)) {
      setWatchlist((prev) => [...prev, coinId])
    }
  }

  const removeFromWatchlist = (coinId: string) => {
    setWatchlist((prev) => prev.filter((id) => id !== coinId))
  }

  const clearWatchlist = () => {
    setWatchlist([])
  }

  return (
    <WatchlistContext.Provider value={{ watchlist, addToWatchlist, removeFromWatchlist, clearWatchlist }}>
      {children}
    </WatchlistContext.Provider>
  )
}

export function useWatchlist() {
  const context = useContext(WatchlistContext)
  if (context === undefined) {
    throw new Error("useWatchlist must be used within a WatchlistProvider")
  }
  return context
}

