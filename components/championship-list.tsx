"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  getChampionshipsWithWrestlerCount,
  deleteChampionship,
  createChampionship,
  updateChampionship,
} from "@/lib/database"
import type { Championship } from "@/types/wrestler"
import { useToast } from "@/hooks/use-toast"
import { ChampionshipWrestlersDialog } from "./championship-wrestlers-dialog"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface ChampionshipWithCount extends Championship {
  wrestler_count: number
}

interface ChampionshipDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (championship: Championship) => void
  title: string
  championship?: Championship
}

function ChampionshipDialog({ open, onOpenChange, onSave, title, championship }: ChampionshipDialogProps) {
  const [name, setName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Initialize form with championship data if editing
  useEffect(() => {
    if (championship) {
      setName(championship.name)
    } else {
      resetForm()
    }
  }, [championship, open])

  const resetForm = () => {
    setName("")
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)

      let savedChampionship: Championship | null

      if (championship) {
        // Update existing championship
        savedChampionship = await updateChampionship(championship.id, name)
      } else {
        // Create new championship
        savedChampionship = await createChampionship(name)
      }

      if (savedChampionship) {
        onSave(savedChampionship)
        resetForm()
      } else {
        throw new Error("Failed to save championship")
      }
    } catch (error) {
      console.error("Error saving championship:", error)
      toast({
        title: "Error",
        description: "Failed to save championship",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter championship name"
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name || isSaving} className="bg-green-600 hover:bg-green-700">
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ChampionshipList() {
  const [championships, setChampionships] = useState<ChampionshipWithCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isWrestlersDialogOpen, setIsWrestlersDialogOpen] = useState(false)
  const [currentChampionship, setCurrentChampionship] = useState<Championship | null>(null)
  const [selectedChampionshipId, setSelectedChampionshipId] = useState<number | null>(null)
  const [selectedChampionshipName, setSelectedChampionshipName] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<"name" | "count">("name")
  const { toast } = useToast()

  // Load championships on component mount
  useEffect(() => {
    loadChampionships()
  }, [])

  const loadChampionships = async () => {
    setIsLoading(true)
    try {
      const data = await getChampionshipsWithWrestlerCount()
      setChampionships(data)
    } catch (error) {
      console.error("Error loading championships:", error)
      toast({
        title: "Error",
        description: "Failed to load championships",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter championships based on search query
  const filteredChampionships = championships.filter((championship) => {
    return championship.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // Sort championships based on sort order
  const sortedChampionships = [...filteredChampionships].sort((a, b) => {
    if (sortOrder === "name") {
      return a.name.localeCompare(b.name)
    } else {
      return b.wrestler_count - a.wrestler_count
    }
  })

  const handleCreateChampionship = async (championship: Championship) => {
    await loadChampionships()
    setIsCreateDialogOpen(false)
    toast({
      title: "Championship created",
      description: `${championship.name} has been added successfully`,
    })
  }

  const handleEditChampionship = async (championship: Championship) => {
    await loadChampionships()
    setIsEditDialogOpen(false)
    setCurrentChampionship(null)
    toast({
      title: "Championship updated",
      description: `${championship.name} has been updated successfully`,
    })
  }

  const handleDeleteChampionship = async (id: number) => {
    try {
      const success = await deleteChampionship(id)
      if (success) {
        await loadChampionships()
        toast({
          title: "Championship deleted",
          description: "The championship has been deleted successfully",
        })
      } else {
        throw new Error("Failed to delete championship")
      }
    } catch (error) {
      console.error("Error deleting championship:", error)
      toast({
        title: "Error",
        description: "Failed to delete championship",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (championship: Championship) => {
    setCurrentChampionship(championship)
    setIsEditDialogOpen(true)
  }

  const openWrestlersDialog = (championshipId: number, championshipName: string) => {
    setSelectedChampionshipId(championshipId)
    setSelectedChampionshipName(championshipName)
    setIsWrestlersDialogOpen(true)
  }

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "name" ? "count" : "name")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Championships</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Championship
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search championships..."
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
          {sortedChampionships.map((championship) => (
            <Card key={championship.id} className="group relative overflow-hidden transition-all hover:shadow-md">
              {/* Action buttons - top right */}
              <div className="absolute right-2 top-2 flex gap-2 z-10">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 bg-white/80 backdrop-blur-sm hover:bg-white"
                  onClick={() => openEditDialog(championship)}
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span className="sr-only">Edit {championship.name}</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 bg-white/80 text-red-500 backdrop-blur-sm hover:bg-white hover:text-red-600"
                  onClick={() => handleDeleteChampionship(championship.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Delete {championship.name}</span>
                </Button>
              </div>

              <CardContent className="p-4">
                {/* Square image container */}
                <div
                  className="aspect-square w-full overflow-hidden rounded-md mb-3"
                  onClick={() => openEditDialog(championship)}
                >
                  <div className="flex h-full w-full items-center justify-center bg-amber-500 text-white">
                    <span className="text-4xl font-bold">🏆</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">{championship.name}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm font-normal text-muted-foreground hover:text-foreground"
                    onClick={() => openWrestlersDialog(championship.id, championship.name)}
                  >
                    {championship.wrestler_count} {championship.wrestler_count === 1 ? "Wrestler" : "Wrestlers"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && sortedChampionships.length === 0 && (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">No championships found</p>
        </div>
      )}

      <ChampionshipDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSave={handleCreateChampionship}
        title="Add Championship"
      />

      {currentChampionship && (
        <ChampionshipDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleEditChampionship}
          title="Edit Championship"
          championship={currentChampionship}
        />
      )}

      {selectedChampionshipId && (
        <ChampionshipWrestlersDialog
          open={isWrestlersDialogOpen}
          onOpenChange={setIsWrestlersDialogOpen}
          championshipId={selectedChampionshipId}
          championshipName={selectedChampionshipName}
        />
      )}
    </div>
  )
}
