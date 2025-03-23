import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  // For values over 1 trillion
  if (value >= 1_000_000_000_000) {
    return `$${(value / 1_000_000_000_000).toFixed(2)}T`
  }
  // For values over 1 billion
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`
  }
  // For values over 1 million
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`
  }
  // For values over 1 thousand
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`
  }
  // For values less than 1
  if (value < 1) {
    return `$${value.toFixed(6)}`
  }
  // For other values
  return `$${value.toFixed(2)}`
}

export function formatPercentage(value: number): string {
  if (value === undefined || value === null) return "0.00%"
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value)
}

export function formatDate(date: Date | number, format: "short" | "medium" | "long" = "medium"): string {
  if (!(date instanceof Date)) {
    date = new Date(date)
  }

  switch (format) {
    case "short":
      return date.toLocaleDateString()
    case "long":
      return date.toLocaleString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    case "medium":
    default:
      return date.toLocaleString()
  }
}

