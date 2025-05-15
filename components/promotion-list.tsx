"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { getPromotionsWithWrestlerCount, deletePromotion } from "@/lib/database"
import type { Promotion } from "@/types/wrestler"
import { useToast } from "@/hooks/use-toast"
import { PromotionDialog } from "./promotion-dialog"
import { PromotionWrestlersDialog } from "./promotion-wrestlers-dialog"

interface PromotionWithCount extends Promotion {
  wrestler_count: number
}

export function PromotionList() {
  const [promotions, setPromotions] = useState<PromotionWithCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isWrestlersDialogOpen, setIsWrestlersDialogOpen] = useState(false)
  const [currentPromotion, setCurrentPromotion] = useState<Promotion | null>(null)
  const [selectedPromotionId, setSelectedPromotionId] = useState<number | null>(null)
  const [selectedPromotionName, setSelectedPromotionName] = useState<string>("")
  const [imageUploadSupported, setImageUploadSupported] = useState(true)
  const [sortOrder, setSortOrder] = useState<"name" | "count">("name")
  const { toast } = useToast()

  // Load promotions on component mount
  useEffect(() => {
    loadPromotions()
  }, [])

  const loadPromotions = async () => {
    setIsLoading(true)
    try {
      const data = await getPromotionsWithWrestlerCount()
      setPromotions(data)

      // Check if image_url is supported by checking if any promotion has it
      const hasImageUrl = data.some((promotion) => "image_url" in promotion)
      setImageUploadSupported(hasImageUrl)
    } catch (error) {
      console.error("Error loading promotions:", error)
      toast({
        title: "Error",
        description: "Failed to load promotions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter promotions based on search query
  const filteredPromotions = promotions.filter((promotion) => {
    return promotion.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // Sort promotions based on sort order
  const sortedPromotions = [...filteredPromotions].sort((a, b) => {
    if (sortOrder === "name") {
      return a.name.localeCompare(b.name)
    } else {
      return b.wrestler_count - a.wrestler_count
    }
  })

  const handleCreatePromotion = async (promotion: Promotion) => {
    await loadPromotions()
    setIsCreateDialogOpen(false)
    toast({
      title: "Promotion created",
      description: `${promotion.name} has been added successfully`,
    })
  }

  const handleEditPromotion = async (promotion: Promotion) => {
    await loadPromotions()
    setIsEditDialogOpen(false)
    setCurrentPromotion(null)
    toast({
      title: "Promotion updated",
      description: `${promotion.name} has been updated successfully`,
    })
  }

  const handleDeletePromotion = async (id: number) => {
    try {
      const success = await deletePromotion(id)
      if (success) {
        await loadPromotions()
        toast({
          title: "Promotion deleted",
          description: "The promotion has been deleted successfully",
        })
      } else {
        throw new Error("Failed to delete promotion")
      }
    } catch (error) {
      console.error("Error deleting promotion:", error)
      toast({
        title: "Error",
        description: "Failed to delete promotion",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (promotion: Promotion) => {
    setCurrentPromotion(promotion)
    setIsEditDialogOpen(true)
  }

  const openWrestlersDialog = (promotionId: number, promotionName: string) => {
    setSelectedPromotionId(promotionId)
    setSelectedPromotionName(promotionName)
    setIsWrestlersDialogOpen(true)
  }

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "name" ? "count" : "name")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Promotions</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Promotion
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search promotions..."
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
          {sortedPromotions.map((promotion) => (
            <Card key={promotion.id} className="group relative overflow-hidden transition-all hover:shadow-md">
              {/* Action buttons - top right */}
              <div className="absolute right-2 top-2 flex gap-2 z-10">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 bg-white/80 backdrop-blur-sm hover:bg-white"
                  onClick={() => openEditDialog(promotion)}
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span className="sr-only">Edit {promotion.name}</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 bg-white/80 text-red-500 backdrop-blur-sm hover:bg-white hover:text-red-600"
                  onClick={() => handleDeletePromotion(promotion.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Delete {promotion.name}</span>
                </Button>
              </div>

              <CardContent className="p-4">
                {/* Square image container */}
                <div
                  className="aspect-square w-full overflow-hidden rounded-md bg-gray-100 mb-3"
                  onClick={() => openEditDialog(promotion)}
                >
                  {imageUploadSupported && promotion.image_url ? (
                    <img
                      src={promotion.image_url || "/placeholder.svg"}
                      alt={promotion.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-green-600 text-white">
                      <span className="text-4xl font-bold">{promotion.name.charAt(0)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">{promotion.name}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm font-normal text-muted-foreground hover:text-foreground"
                    onClick={() => openWrestlersDialog(promotion.id, promotion.name)}
                  >
                    {promotion.wrestler_count} {promotion.wrestler_count === 1 ? "Wrestler" : "Wrestlers"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && sortedPromotions.length === 0 && (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">No promotions found</p>
        </div>
      )}

      <PromotionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSave={handleCreatePromotion}
        title="Add Promotion"
      />

      {currentPromotion && (
        <PromotionDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleEditPromotion}
          title="Edit Promotion"
          promotion={currentPromotion}
        />
      )}

      {selectedPromotionId && (
        <PromotionWrestlersDialog
          open={isWrestlersDialogOpen}
          onOpenChange={setIsWrestlersDialogOpen}
          promotionId={selectedPromotionId}
          promotionName={selectedPromotionName}
        />
      )}
    </div>
  )
}
