// Performance monitoring and optimization script

// Function to detect slow rendering components
function detectSlowRenders() {
  // We'll use the User Timing API to measure component rendering time
  if (typeof window !== "undefined" && "performance" in window && "PerformanceObserver" in window) {
    // Create a performance observer to watch for render timing events
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 100) {
          // 100ms threshold
          console.warn(`Slow rendering detected: ${entry.name} took ${entry.duration.toFixed(2)}ms`)
        }
      })
    })

    // Start observing render timing
    observer.observe({ entryTypes: ["measure"] })
  }
}

// Function to preload critical assets
function preloadCriticalAssets() {
  const criticalAssets = [
    "/placeholder.svg",
    // Add other critical assets here
  ]

  // Only run in the browser
  if (typeof window !== "undefined") {
    criticalAssets.forEach((asset) => {
      const link = document.createElement("link")
      link.rel = "preload"
      link.href = asset
      link.as = asset.endsWith(".svg") ? "image" : "image"
      document.head.appendChild(link)
    })
  }
}

// Function to optimize images using native lazy loading and priority flags
function optimizeImages() {
  if (typeof window !== "undefined") {
    // Add intersection observer for lazy loading images outside of the Next.js Image component
    const lazyImages = document.querySelectorAll("img[data-src]")

    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target
            const src = img.getAttribute("data-src")
            if (src) {
              img.src = src
              img.removeAttribute("data-src")
            }
            imageObserver.unobserve(img)
          }
        })
      })

      lazyImages.forEach((img) => {
        imageObserver.observe(img)
      })
    } else {
      // Fallback for browsers without intersection observer
      lazyImages.forEach((img) => {
        const src = img.getAttribute("data-src")
        if (src) img.src = src
      })
    }
  }
}

// Initialize performance optimizations when the document is ready
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    detectSlowRenders()
    preloadCriticalAssets()
    optimizeImages()
  })
}

// Export these functions for potential use in components
export { detectSlowRenders, preloadCriticalAssets, optimizeImages }

