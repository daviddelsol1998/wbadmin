"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { getWrestlersByChampionship } from "@/lib/database"
import type { Wrestler } from "@/types/wrestler"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface ChampionshipWrestlersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  championshipId: number
  championshipName: string
}

export function ChampionshipWrestlersDialog({
  open,
  onOpenChange,
  championshipId,
  championshipName,
}: ChampionshipWrestlersDialogProps) {
  const [wrestlers, setWrestlers] = useState<Wrestler[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      loadWrestlers()
    }
  }, [open, championshipId])

  const loadWrestlers = async () => {
    setIsLoading(true)
    try {
      const data = await getWrestlersByChampionship(championshipId)
      setWrestlers(data)
    } catch (error) {
      console.error("Error loading wrestlers:", error)
      toast({
        title: "Error",
        description: "Failed to load wrestlers",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Wrestlers holding {championshipName}</DialogTitle>
          <DialogDescription>View all wrestlers currently holding the {championshipName}.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex animate-pulse items-center gap-4 rounded-md p-2">
                  <div className="aspect-square h-12 w-12 rounded-md bg-muted"></div>
                  <div className="h-6 w-2/3 rounded-md bg-muted"></div>
                </div>
              ))}
            </div>
          ) : wrestlers.length > 0 ? (
            <div className="divide-y">
              {wrestlers.map((wrestler) => (
                <div key={wrestler.id} className="flex items-center gap-4 py-3">
                  {wrestler.image_url ? (
                    <img
                      src={wrestler.image_url || "/placeholder.svg"}
                      alt={wrestler.name}
                      className="aspect-square h-12 w-12 rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex aspect-square h-12 w-12 items-center justify-center rounded-md bg-muted">
                      <span className="text-lg font-bold text-muted-foreground">{wrestler.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium">{wrestler.name}</h3>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {wrestler.promotions?.map((promotion) => (
                        <Badge key={promotion.id} variant="outline">
                          {promotion.name}
                        </Badge>
                      ))}
                      {wrestler.factions?.map((faction) => (
                        <Badge key={faction.id} variant="secondary">
                          {faction.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
              <p className="text-muted-foreground">No wrestlers hold this championship</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
