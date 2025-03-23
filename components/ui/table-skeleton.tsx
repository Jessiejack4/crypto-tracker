import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface TableSkeletonProps {
  rows?: number
  columns?: number
  showHeader?: boolean
}

export function TableSkeleton({ rows = 5, columns = 6, showHeader = true }: TableSkeletonProps) {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        {showHeader && (
          <TableHeader>
            <TableRow>
              {Array.from({ length: columns }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  {colIndex === 0 ? (
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                  ) : (
                    <Skeleton className={`h-4 w-${12 + (colIndex % 3) * 8}`} />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="p-4 border-t text-center">
        <Skeleton className="h-9 w-40 mx-auto" />
      </div>
    </div>
  )
}

