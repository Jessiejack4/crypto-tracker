"use client"

import { useState, useEffect } from "react"
import { ChevronUp, Star, BarChart2, TrendingUp, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useTheme } from "next-themes"

export function DarkModeFab() {
  const [showButton, setShowButton] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { theme } = useTheme()

  // Only show in dark mode
  const isDarkMode = theme === "dark"

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowButton(true)
      } else {
        setShowButton(false)
        if (menuOpen) setMenuOpen(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [menuOpen])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  if (!isDarkMode) return null

  return (
    <>
      {showButton && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
          {menuOpen && (
            <div className="flex flex-col gap-2 mb-2 animate-fade-in">
              <Button
                size="icon"
                className="bg-zinc-800/80 backdrop-blur-sm border border-zinc-700/50 shadow-dark-glow hover:shadow-dark-glow-lg hover:bg-zinc-800 transition-all"
                asChild
              >
                <Link href="/watchlist">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span className="sr-only">Watchlist</span>
                </Link>
              </Button>
              <Button
                size="icon"
                className="bg-zinc-800/80 backdrop-blur-sm border border-zinc-700/50 shadow-dark-glow hover:shadow-dark-glow-lg hover:bg-zinc-800 transition-all"
                asChild
              >
                <Link href="/market">
                  <BarChart2 className="h-5 w-5 text-blue-400" />
                  <span className="sr-only">Market</span>
                </Link>
              </Button>
              <Button
                size="icon"
                className="bg-zinc-800/80 backdrop-blur-sm border border-zinc-700/50 shadow-dark-glow hover:shadow-dark-glow-lg hover:bg-zinc-800 transition-all"
                asChild
              >
                <Link href="/trending">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  <span className="sr-only">Trending</span>
                </Link>
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              size="icon"
              className="bg-zinc-800/80 backdrop-blur-sm border border-zinc-700/50 shadow-dark-glow hover:shadow-dark-glow-lg hover:bg-zinc-800 transition-all"
              onClick={toggleMenu}
            >
              <Menu className="h-5 w-5 text-zinc-200" />
              <span className="sr-only">Menu</span>
            </Button>

            <Button
              size="icon"
              className="bg-blue-600/90 backdrop-blur-sm border border-blue-500/50 shadow-dark-glow hover:shadow-dark-glow-lg hover:bg-blue-500 transition-all"
              onClick={scrollToTop}
            >
              <ChevronUp className="h-5 w-5" />
              <span className="sr-only">Scroll to top</span>
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

