"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { getFactionsWithWrestlerCount, deleteFaction } from "@/lib/database"
import type { Faction } from "@/types/wrestler"
import { useToast } from "@/hooks/use-toast"
import { FactionWrestlersDialog } from "./faction-wrestlers-dialog"
import { FactionDialog } from "./faction-dialog"

interface FactionWithCount extends Faction {
  wrestler_count: number
}

export function FactionList() {
  const [factions, setFactions] = useState<FactionWithCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isWrestlersDialogOpen, setIsWrestlersDialogOpen] = useState(false)
  const [currentFaction, setCurrentFaction] = useState<Faction | null>(null)
  const [selectedFactionId, setSelectedFactionId] = useState<number | null>(null)
  const [selectedFactionName, setSelectedFactionName] = useState<string>("")
  const [imageUploadSupported, setImageUploadSupported] = useState(true)
  const [sortOrder, setSortOrder] = useState<"name" | "count">("name")
  const { toast } = useToast()

  // Load factions on component mount
  useEffect(() => {
    loadFactions()
  }, [])

  const loadFactions = async () => {
    setIsLoading(true)
    try {
      const data = await getFactionsWithWrestlerCount()
      setFactions(data)

      // Check if image_url is supported by checking if any faction has it
      const hasImageUrl = data.some((faction) => "image_url" in faction)
      setImageUploadSupported(hasImageUrl)
    } catch (error) {
      console.error("Error loading factions:", error)
      toast({
        title: "Error",
        description: "Failed to load factions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter factions based on search query
  const filteredFactions = factions.filter((faction) => {
    return faction.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // Sort factions based on sort order
  const sortedFactions = [...filteredFactions].sort((a, b) => {
    if (sortOrder === "name") {
      return a.name.localeCompare(b.name)
    } else {
      return b.wrestler_count - a.wrestler_count
    }
  })

  const handleCreateFaction = async (faction: Faction) => {
    await loadFactions()
    setIsCreateDialogOpen(false)
    toast({
      title: "Faction created",
      description: `${faction.name} has been added successfully`,
    })
  }

  const handleEditFaction = async (faction: Faction) => {
    await loadFactions()
    setIsEditDialogOpen(false)
    setCurrentFaction(null)
    toast({
      title: "Faction updated",
      description: `${faction.name} has been updated successfully`,
    })
  }

  const handleDeleteFaction = async (id: number) => {
    try {
      const success = await deleteFaction(id)
      if (success) {
        await loadFactions()
        toast({
          title: "Faction deleted",
          description: "The faction has been deleted successfully",
        })
      } else {
        throw new Error("Failed to delete faction")
      }
    } catch (error) {
      console.error("Error deleting faction:", error)
      toast({
        title: "Error",
        description: "Failed to delete faction",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (faction: Faction) => {
    setCurrentFaction(faction)
    setIsEditDialogOpen(true)
  }

  const openWrestlersDialog = (factionId: number, factionName: string) => {
    setSelectedFactionId(factionId)
    setSelectedFactionName(factionName)
    setIsWrestlersDialogOpen(true)
  }

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "name" ? "count" : "name")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Factions</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Faction
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search factions..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={toggleSortOrder} className="gap-2">
          <ArrowUpDown className="mr-2 h-4 w-4" />
          Sort by {sortOrder === "name" ? "Name" : "Wrestler Count"}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="aspect-square w-full rounded-md bg-muted"></div>
                <div className="mt-3 h-5 w-2/3 rounded-md bg-muted"></div>
                <div className="mt-2 h-4 w-1/3 rounded-md bg-muted"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {sortedFactions.map((faction) => (
            <Card key={faction.id} className="group relative overflow-hidden transition-all hover:shadow-md">
              {/* Action buttons - top right */}
              <div className="absolute right-2 top-2 flex gap-2 z-10">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 bg-white/80 backdrop-blur-sm hover:bg-white"
                  onClick={() => openEditDialog(faction)}
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span className="sr-only">Edit {faction.name}</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 bg-white/80 text-red-500 backdrop-blur-sm hover:bg-white hover:text-red-600"
                  onClick={() => handleDeleteFaction(faction.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Delete {faction.name}</span>
                </Button>
              </div>

              <CardContent className="p-4">
                {/* Square image container */}
                <div
                  className="aspect-square w-full overflow-hidden rounded-md mb-3"
                  onClick={() => openEditDialog(faction)}
                >
                  {imageUploadSupported && faction.image_url ? (
                    <img
                      src={faction.image_url || "/placeholder.svg"}
                      alt={faction.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-green-600 text-white">
                      <span className="text-4xl font-bold">{faction.name.charAt(0)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">{faction.name}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm font-normal text-muted-foreground hover:text-foreground"
                    onClick={() => openWrestlersDialog(faction.id, faction.name)}
                  >
                    {faction.wrestler_count} {faction.wrestler_count === 1 ? "Wrestler" : "Wrestlers"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && sortedFactions.length === 0 && (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">No factions found</p>
        </div>
      )}

      <FactionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSave={handleCreateFaction}
        title="Add Faction"
      />

      {currentFaction && (
        <FactionDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleEditFaction}
          title="Edit Faction"
          faction={currentFaction}
        />
      )}

      {selectedFactionId && (
        <FactionWrestlersDialog
          open={isWrestlersDialogOpen}
          onOpenChange={setIsWrestlersDialogOpen}
          factionId={selectedFactionId}
          factionName={selectedFactionName}
        />
      )}
    </div>
  )
}
