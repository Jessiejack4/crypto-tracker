/**
 * Debounce function to limit how often a function can be called
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>): void => {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout !== null) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Simple memoization function to cache API results
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  ttl = 60000, // 1 minute default TTL
): T {
  const cache = new Map<string, { value: ReturnType<T>; timestamp: number }>()

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args)
    const now = Date.now()
    const cached = cache.get(key)

    if (cached && now - cached.timestamp < ttl) {
      return cached.value
    }

    const result = func(...args)

    // Handle promises
    if (result instanceof Promise) {
      return result.then((value) => {
        cache.set(key, { value, timestamp: now })
        return value
      }) as any
    }

    cache.set(key, { value: result, timestamp: now })
    return result
  }) as T
}

/**
 * Create a lazy-loaded component that only loads when it's about to enter the viewport
 */
export function lazyLoadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = src
    img.onload = () => resolve(img)
    img.onerror = reject
  })
}

/**
 * Optimize API data by removing unnecessary fields
 */
export function optimizeApiData<T extends Record<string, any>>(data: T, fieldsToKeep: (keyof T)[]): Partial<T> {
  return fieldsToKeep.reduce(
    (obj, field) => {
      if (field in data) {
        obj[field] = data[field]
      }
      return obj
    },
    {} as Partial<T>,
  )
}

