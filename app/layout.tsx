import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { WatchlistProvider } from "@/hooks/use-watchlist"
import { ErrorBoundary } from "@/components/error-boundary"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased dark:bg-zinc-950 bg-crypto-pattern dark:bg-dark-crypto-pattern">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <WatchlistProvider>
            <ErrorBoundary>
              <div className="relative flex min-h-screen flex-col">
                <div className="pointer-events-none absolute inset-0 dark:bg-dark-gradient-radial opacity-50 mix-blend-multiply dark:mix-blend-normal"></div>
                <Header />
                <div className="flex-1 relative z-10">{children}</div>
                <Footer />
              </div>
            </ErrorBoundary>
          </WatchlistProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
