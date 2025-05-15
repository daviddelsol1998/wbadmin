"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { Wrestler } from "@/types/wrestler"

interface FilterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: {
    promotions: string[]
    factions: string[]
    championships: string[]
  }
  setFilters: (filters: {
    promotions: string[]
    factions: string[]
    championships: string[]
  }) => void
  wrestlers: Wrestler[]
}

export function FilterDialog({ open, onOpenChange, filters, setFilters, wrestlers }: FilterDialogProps) {
  // Extract unique values from wrestlers
  const allPromotions = Array.from(new Set(wrestlers.flatMap((w) => w.promotions?.map((p) => p.name) || [])))

  const allFactions = Array.from(new Set(wrestlers.flatMap((w) => w.factions?.map((f) => f.name) || [])))

  const allChampionships = Array.from(new Set(wrestlers.flatMap((w) => w.championships?.map((c) => c.name) || [])))

  const handlePromotionChange = (promotion: string, checked: boolean) => {
    if (checked) {
      setFilters({
        ...filters,
        promotions: [...filters.promotions, promotion],
      })
    } else {
      setFilters({
        ...filters,
        promotions: filters.promotions.filter((p) => p !== promotion),
      })
    }
  }

  const handleFactionChange = (faction: string, checked: boolean) => {
    if (checked) {
      setFilters({
        ...filters,
        factions: [...filters.factions, faction],
      })
    } else {
      setFilters({
        ...filters,
        factions: filters.factions.filter((f) => f !== faction),
      })
    }
  }

  const handleChampionshipChange = (championship: string, checked: boolean) => {
    if (checked) {
      setFilters({
        ...filters,
        championships: [...filters.championships, championship],
      })
    } else {
      setFilters({
        ...filters,
        championships: filters.championships.filter((c) => c !== championship),
      })
    }
  }

  const clearFilters = () => {
    setFilters({
      promotions: [],
      factions: [],
      championships: [],
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Filter Wrestlers</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {allPromotions.length > 0 && (
            <div className="grid gap-2">
              <Label>Promotions</Label>
              <div className="grid max-h-40 gap-2 overflow-y-auto">
                {allPromotions.map((promotion) => (
                  <div key={promotion} className="flex items-center space-x-2">
                    <Checkbox
                      id={`promotion-${promotion}`}
                      checked={filters.promotions.includes(promotion)}
                      onCheckedChange={(checked) => handlePromotionChange(promotion, checked as boolean)}
                    />
                    <Label htmlFor={`promotion-${promotion}`} className="cursor-pointer">
                      {promotion}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {allFactions.length > 0 && (
            <div className="grid gap-2">
              <Label>Factions</Label>
              <div className="grid max-h-40 gap-2 overflow-y-auto">
                {allFactions.map((faction) => (
                  <div key={faction} className="flex items-center space-x-2">
                    <Checkbox
                      id={`faction-${faction}`}
                      checked={filters.factions.includes(faction)}
                      onCheckedChange={(checked) => handleFactionChange(faction, checked as boolean)}
                    />
                    <Label htmlFor={`faction-${faction}`} className="cursor-pointer">
                      {faction}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {allChampionships.length > 0 && (
            <div className="grid gap-2">
              <Label>Championships</Label>
              <div className="grid max-h-40 gap-2 overflow-y-auto">
                {allChampionships.map((championship) => (
                  <div key={championship} className="flex items-center space-x-2">
                    <Checkbox
                      id={`championship-${championship}`}
                      checked={filters.championships.includes(championship)}
                      onCheckedChange={(checked) => handleChampionshipChange(championship, checked as boolean)}
                    />
                    <Label htmlFor={`championship-${championship}`} className="cursor-pointer">
                      {championship}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
          <Button onClick={() => onOpenChange(false)} className="bg-green-600 hover:bg-green-700">
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
