"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart2, Menu, X, Sun, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  // After mounting, we can safely show the UI
  useEffect(() => setMounted(true), [])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const closeMenu = () => setIsMenuOpen(false)

  const routes = [
    { href: "/", label: "Dashboard", active: pathname === "/" },
    { href: "/market", label: "Market", active: pathname === "/market" },
    { href: "/trending", label: "Trending", active: pathname === "/trending" },
    { href: "/watchlist", label: "Watchlist", active: pathname === "/watchlist" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 dark:border-zinc-800/50 dark:bg-zinc-900/20 dark:backdrop-blur-md header">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
            <BarChart2 className="h-5 w-5 text-primary dark:text-blue-400 dark:animate-pulse-glow-dark" />
            <span className="font-semibold dark:font-bold dark:text-white">CryptoTracker</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`text-sm font-medium transition-colors hover:text-primary dark:hover:text-blue-400 ${
                route.active
                  ? "text-primary dark:text-blue-400 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary dark:after:bg-blue-400 dark:after:shadow-dark-glow-lg after:content-['']"
                  : "text-muted-foreground dark:text-zinc-400"
              }`}
            >
              {route.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="relative overflow-hidden transition-all hover:shadow-glow-primary dark:hover:shadow-dark-glow-lg dark:bg-zinc-800/50 dark:border-zinc-700/50"
            >
              {theme === "dark" ? (
                <div className="relative animate-fade-in">
                  <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
                  <span className="absolute inset-0 animate-rotate-glow opacity-50 blur-sm"></span>
                </div>
              ) : (
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden dark:bg-zinc-800/50 dark:border-zinc-700/50 dark:hover:shadow-dark-glow-sm"
            onClick={toggleMenu}
          >
            <Menu className="h-5 w-5 dark:text-zinc-200" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 bg-background/95 dark:bg-zinc-900/95 backdrop-blur-md md:hidden animate-fade-in">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
                  <BarChart2 className="h-5 w-5 text-primary dark:text-blue-400 dark:animate-pulse-glow-dark" />
                  <span className="font-semibold dark:font-bold dark:text-white">CryptoTracker</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="dark:bg-zinc-800/50 dark:border-zinc-700/50 dark:hover:shadow-dark-glow-sm"
                  onClick={closeMenu}
                >
                  <X className="h-5 w-5 dark:text-zinc-200" />
                  <span className="sr-only">Close menu</span>
                </Button>
              </div>
              <nav className="mt-8 flex flex-col gap-6">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={`text-lg font-medium transition-colors hover:text-primary dark:hover:text-blue-400 ${
                      route.active
                        ? "text-primary dark:text-blue-400 dark:shadow-dark-glow-sm"
                        : "text-muted-foreground dark:text-zinc-400"
                    }`}
                    onClick={closeMenu}
                  >
                    {route.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

