"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Filter, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WrestlerDialog } from "./wrestler-dialog"
import { FilterDialog } from "./filter-dialog"
import { getWrestlers, deleteWrestler } from "@/lib/database"
import type { Wrestler } from "@/types/wrestler"
import { useToast } from "@/hooks/use-toast"

export function WrestlerList() {
  const [wrestlers, setWrestlers] = useState<Wrestler[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const [currentWrestler, setCurrentWrestler] = useState<Wrestler | null>(null)
  const [filters, setFilters] = useState({
    promotions: [] as string[],
    factions: [] as string[],
    championships: [] as string[],
  })
  const { toast } = useToast()

  // Load wrestlers on component mount
  useEffect(() => {
    loadWrestlers()
  }, [])

  const loadWrestlers = async () => {
    setIsLoading(true)
    try {
      const data = await getWrestlers()
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

  // Filter wrestlers based on search query and filters
  const filteredWrestlers = wrestlers.filter((wrestler) => {
    // Search by name
    const matchesSearch = wrestler.name.toLowerCase().includes(searchQuery.toLowerCase())

    // Filter by promotions, factions, and championships
    const matchesPromotions =
      filters.promotions.length === 0 ||
      wrestler.promotions?.some((promotion) => filters.promotions.includes(promotion.name))

    const matchesFactions =
      filters.factions.length === 0 || wrestler.factions?.some((faction) => filters.factions.includes(faction.name))

    const matchesChampionships =
      filters.championships.length === 0 ||
      wrestler.championships?.some((championship) => filters.championships.includes(championship.name))

    return matchesSearch && matchesPromotions && matchesFactions && matchesChampionships
  })

  const handleCreateWrestler = async (wrestler: Wrestler) => {
    await loadWrestlers()
    setIsCreateDialogOpen(false)
    toast({
      title: "Wrestler created",
      description: `${wrestler.name} has been added successfully`,
    })
  }

  const handleEditWrestler = async (wrestler: Wrestler) => {
    await loadWrestlers()
    setIsEditDialogOpen(false)
    setCurrentWrestler(null)
    toast({
      title: "Wrestler updated",
      description: `${wrestler.name} has been updated successfully`,
    })
  }

  const handleDeleteWrestler = async (id: number) => {
    try {
      const success = await deleteWrestler(id)
      if (success) {
        await loadWrestlers()
        toast({
          title: "Wrestler deleted",
          description: "The wrestler has been deleted successfully",
        })
      } else {
        throw new Error("Failed to delete wrestler")
      }
    } catch (error) {
      console.error("Error deleting wrestler:", error)
      toast({
        title: "Error",
        description: "Failed to delete wrestler",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (wrestler: Wrestler) => {
    setCurrentWrestler(wrestler)
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Wrestlers</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Wrestler
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search wrestlers..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={() => setIsFilterDialogOpen(true)} className="sm:w-auto">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Active filters display */}
      {(filters.promotions.length > 0 || filters.factions.length > 0 || filters.championships.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {filters.promotions.map((promotion) => (
            <Badge key={promotion} variant="outline">
              {promotion}
            </Badge>
          ))}
          {filters.factions.map((faction) => (
            <Badge key={faction} variant="outline">
              {faction}
            </Badge>
          ))}
          {filters.championships.map((championship) => (
            <Badge key={championship} variant="outline">
              {championship}
            </Badge>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="animate-pulse overflow-hidden">
              <div className="aspect-square w-full bg-muted"></div>
              <CardContent className="p-3">
                <div className="h-5 w-2/3 rounded-md bg-muted"></div>
                <div className="mt-2 space-y-2">
                  <div className="h-4 w-full rounded-md bg-muted"></div>
                  <div className="h-4 w-3/4 rounded-md bg-muted"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredWrestlers.map((wrestler) => (
            <Card
              key={wrestler.id}
              className="group relative overflow-hidden transition-all hover:shadow-md"
              onClick={() => openEditDialog(wrestler)}
            >
              {/* Square image container */}
              <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-b from-gray-100 to-gray-200">
                {wrestler.image_url ? (
                  <img
                    src={wrestler.image_url || "/placeholder.svg"}
                    alt={wrestler.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-5xl font-bold text-gray-300">{wrestler.name.charAt(0)}</span>
                  </div>
                )}

                {/* Name overlay at the bottom of the image with solid background */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-3 text-white">
                  <h3 className="font-bold leading-tight text-lg">{wrestler.name}</h3>
                </div>

                {/* Championship badges - displayed at the top */}
                {wrestler.championships && wrestler.championships.length > 0 && (
                  <div className="absolute left-0 top-0 flex flex-wrap gap-1 p-2">
                    {wrestler.championships.map((championship) => (
                      <Badge key={championship.id} className="bg-green-600 text-white">
                        {championship.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Action buttons - top right */}
                <div className="absolute right-2 top-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 bg-white/80 backdrop-blur-sm hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      openEditDialog(wrestler)
                    }}
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span className="sr-only">Edit {wrestler.name}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 bg-white/80 text-red-500 backdrop-blur-sm hover:bg-white hover:text-red-600"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteWrestler(wrestler.id)
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sr-only">Delete {wrestler.name}</span>
                  </Button>
                </div>
              </div>

              <CardContent className="p-3">
                {/* Compact info section with larger logos */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {/* Promotions with logos */}
                  {wrestler.promotions && wrestler.promotions.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {wrestler.promotions.map((promotion) => (
                        <div key={promotion.id} className="inline-flex items-center" title={promotion.name}>
                          {promotion.image_url ? (
                            <img
                              src={promotion.image_url || "/placeholder.svg"}
                              alt={promotion.name}
                              className="h-12 w-12 rounded-sm object-contain border border-gray-200 bg-white p-1"
                              title={promotion.name}
                            />
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-sm font-medium px-3 py-2 h-12">
                              {promotion.name}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Factions with logos */}
                  {wrestler.factions && wrestler.factions.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {wrestler.factions.map((faction) => (
                        <div key={faction.id} className="inline-flex items-center" title={faction.name}>
                          {faction.image_url ? (
                            <img
                              src={faction.image_url || "/placeholder.svg"}
                              alt={faction.name}
                              className="h-12 w-12 rounded-sm object-contain border border-gray-200 bg-white p-1"
                              title={faction.name}
                            />
                          ) : (
                            <Badge variant="secondary" className="text-sm font-medium px-3 py-2 h-12">
                              {faction.name}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredWrestlers.length === 0 && (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">No wrestlers found</p>
        </div>
      )}

      <WrestlerDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSave={handleCreateWrestler}
        title="Add Wrestler"
      />

      {currentWrestler && (
        <WrestlerDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleEditWrestler}
          title="Edit Wrestler"
          wrestler={currentWrestler}
        />
      )}

      <FilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        filters={filters}
        setFilters={setFilters}
        wrestlers={wrestlers}
      />
    </div>
  )
}
