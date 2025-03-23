"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error("Caught in error boundary:", error)
      setError(error.error)
      setHasError(true)
    }

    const rejectionHandler = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection caught in error boundary:", event)
      setError(new Error(event.reason || "Unhandled Promise Rejection"))
      setHasError(true)
    }

    window.addEventListener("error", errorHandler)
    window.addEventListener("unhandledrejection", rejectionHandler)

    return () => {
      window.removeEventListener("error", errorHandler)
      window.removeEventListener("unhandledrejection", rejectionHandler)
    }
  }, [])

  const handleReset = () => {
    setHasError(false)
    setError(null)
  }

  if (hasError) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <Alert variant="destructive" className="my-4 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-200">
        <AlertCircle className="h-4 w-4 dark:text-red-300" />
        <AlertTitle className="dark:text-red-200">Something went wrong</AlertTitle>
        <AlertDescription className="dark:text-red-200">
          <div className="mb-2">{error?.message || "An unexpected error occurred. Please try again later."}</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="mr-2 dark:bg-red-900/30 dark:border-red-800/50 dark:text-red-200 dark:hover:bg-red-900/50"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reload Page
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="dark:bg-red-900/30 dark:border-red-800/50 dark:text-red-200 dark:hover:bg-red-900/50"
          >
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return <>{children}</>
}

