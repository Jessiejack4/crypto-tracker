import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function CoinSkeleton() {
  return (
    <div className="space-y-8">
      {/* Coin Header Skeleton */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>
            <div className="flex items-center gap-4 mt-1">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      {/* Chart and Stats Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-full mb-4" />
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Description Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

