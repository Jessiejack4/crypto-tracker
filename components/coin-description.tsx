"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface CoinDescriptionProps {
  coin: any
}

export function CoinDescription({ coin }: CoinDescriptionProps) {
  const [expanded, setExpanded] = useState(false)

  // Get the description in English or fallback to the first available description
  const description = coin.description?.en || Object.values(coin.description || {})[0] || ""

  // Clean the HTML content (remove excessive line breaks, etc.)
  const cleanDescription = description.replace(/<\/p>\s*<p>/g, "</p><p>")

  // Determine if the description is long enough to need truncation
  const isLongDescription = cleanDescription.length > 500

  // Truncate the description if it's not expanded
  const displayDescription =
    !expanded && isLongDescription ? cleanDescription.substring(0, 500) + "..." : cleanDescription

  return (
    <Card>
      <CardHeader>
        <CardTitle>About {coin.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {description ? (
          <>
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: displayDescription }}
            />
            {isLongDescription && (
              <Button variant="ghost" className="mt-4" onClick={() => setExpanded(!expanded)}>
                {expanded ? "Show Less" : "Read More"}
              </Button>
            )}
          </>
        ) : (
          <p className="text-muted-foreground">No description available for this cryptocurrency.</p>
        )}
      </CardContent>
    </Card>
  )
}

