"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Plus, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  getPromotions,
  getFactions,
  getChampionships,
  createWrestler,
  updateWrestler,
  createPromotion,
  createFaction,
  createChampionship,
} from "@/lib/database"
import { uploadImage } from "@/lib/storage"
import type { Wrestler, Promotion, Faction, Championship, WrestlerFormData } from "@/types/wrestler"
import { CreateEntityDialog } from "./create-entity-dialog"
import { useToast } from "@/hooks/use-toast"

interface WrestlerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (wrestler: Wrestler) => void
  title: string
  wrestler?: Wrestler
}

export function WrestlerDialog({ open, onOpenChange, onSave, title, wrestler }: WrestlerDialogProps) {
  const [name, setName] = useState("")
  const [selectedPromotions, setSelectedPromotions] = useState<number[]>([])
  const [selectedFactions, setSelectedFactions] = useState<number[]>([])
  const [selectedChampionships, setSelectedChampionships] = useState<number[]>([])
  const [imageUrl, setImageUrl] = useState<string>("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [isAddPromotionOpen, setIsAddPromotionOpen] = useState(false)
  const [isAddFactionOpen, setIsAddFactionOpen] = useState(false)
  const [isAddChampionshipOpen, setIsAddChampionshipOpen] = useState(false)

  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [factions, setFactions] = useState<Faction[]>([])
  const [championships, setChampionships] = useState<Championship[]>([])

  const { toast } = useToast()

  // Load data when dialog opens
  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

  // Initialize form with wrestler data if editing
  useEffect(() => {
    if (wrestler) {
      setName(wrestler.name)
      setSelectedPromotions(wrestler.promotions?.map((p) => p.id) || [])
      setSelectedFactions(wrestler.factions?.map((f) => f.id) || [])
      setSelectedChampionships(wrestler.championships?.map((c) => c.id) || [])
      setImageUrl(wrestler.image_url || "")
      setImagePreview(wrestler.image_url || "")
    } else {
      resetForm()
    }
  }, [wrestler, open])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [promotionsData, factionsData, championshipsData] = await Promise.all([
        getPromotions(),
        getFactions(),
        getChampionships(),
      ])

      setPromotions(promotionsData)
      setFactions(factionsData)
      setChampionships(championshipsData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setName("")
    setSelectedPromotions([])
    setSelectedFactions([])
    setSelectedChampionships([])
    setImageUrl("")
    setImageFile(null)
    setImagePreview("")
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)

      // Upload image if there's a new one
      let finalImageUrl = imageUrl
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile)
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl
        }
      }

      const wrestlerData: WrestlerFormData = {
        id: wrestler?.id,
        name,
        image_url: finalImageUrl,
        promotions: selectedPromotions,
        factions: selectedFactions,
        championships: selectedChampionships,
      }

      let savedWrestler: Wrestler | null

      if (wrestler) {
        // Update existing wrestler
        savedWrestler = await updateWrestler(wrestlerData)
      } else {
        // Create new wrestler
        savedWrestler = await createWrestler(wrestlerData)
      }

      if (savedWrestler) {
        onSave(savedWrestler)
        resetForm()
      } else {
        throw new Error("Failed to save wrestler")
      }
    } catch (error) {
      console.error("Error saving wrestler:", error)
      toast({
        title: "Error",
        description: "Failed to save wrestler",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleAddPromotion = async (name: string) => {
    try {
      const newPromotion = await createPromotion(name)
      if (newPromotion) {
        setPromotions([...promotions, newPromotion])
        setSelectedPromotions([...selectedPromotions, newPromotion.id])
        setIsAddPromotionOpen(false)
        toast({
          title: "Promotion created",
          description: `${name} has been added successfully`,
        })
      }
    } catch (error) {
      console.error("Error creating promotion:", error)
      toast({
        title: "Error",
        description: "Failed to create promotion",
        variant: "destructive",
      })
    }
  }

  const handleAddFaction = async (name: string) => {
    try {
      const newFaction = await createFaction(name)
      if (newFaction) {
        setFactions([...factions, newFaction])
        setSelectedFactions([...selectedFactions, newFaction.id])
        setIsAddFactionOpen(false)
        toast({
          title: "Faction created",
          description: `${name} has been added successfully`,
        })
      }
    } catch (error) {
      console.error("Error creating faction:", error)
      toast({
        title: "Error",
        description: "Failed to create faction",
        variant: "destructive",
      })
    }
  }

  const handleAddChampionship = async (name: string) => {
    try {
      const newChampionship = await createChampionship(name)
      if (newChampionship) {
        setChampionships([...championships, newChampionship])
        setSelectedChampionships([...selectedChampionships, newChampionship.id])
        setIsAddChampionshipOpen(false)
        toast({
          title: "Championship created",
          description: `${name} has been added successfully`,
        })
      }
    } catch (error) {
      console.error("Error creating championship:", error)
      toast({
        title: "Error",
        description: "Failed to create championship",
        variant: "destructive",
      })
    }
  }

  const removePromotion = (promotionId: number) => {
    setSelectedPromotions(selectedPromotions.filter((id) => id !== promotionId))
  }

  const removeFaction = (factionId: number) => {
    setSelectedFactions(selectedFactions.filter((id) => id !== factionId))
  }

  const removeChampionship = (championshipId: number) => {
    setSelectedChampionships(selectedChampionships.filter((id) => id !== championshipId))
  }

  const getPromotionName = (id: number) => {
    return promotions.find((p) => p.id === id)?.name || ""
  }

  const getFactionName = (id: number) => {
    return factions.find((f) => f.id === id)?.name || ""
  }

  const getChampionshipName = (id: number) => {
    return championships.find((c) => c.id === id)?.name || ""
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
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
                placeholder="Enter wrestler name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Promotions</Label>
              <div className="flex flex-wrap gap-2">
                {selectedPromotions.map((promotionId) => (
                  <Badge key={promotionId} variant="secondary" className="flex items-center gap-1">
                    {getPromotionName(promotionId)}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0"
                      onClick={() => removePromotion(promotionId)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {getPromotionName(promotionId)}</span>
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Select
                  onValueChange={(value) => {
                    const promotionId = Number.parseInt(value)
                    if (!selectedPromotions.includes(promotionId)) {
                      setSelectedPromotions([...selectedPromotions, promotionId])
                    }
                  }}
                  value=""
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select promotion" />
                  </SelectTrigger>
                  <SelectContent>
                    {promotions
                      .filter((p) => !selectedPromotions.includes(p.id))
                      .map((promotion) => (
                        <SelectItem key={promotion.id} value={promotion.id.toString()}>
                          {promotion.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={() => setIsAddPromotionOpen(true)}>
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Add new promotion</span>
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Factions</Label>
              <div className="flex flex-wrap gap-2">
                {selectedFactions.map((factionId) => (
                  <Badge key={factionId} variant="secondary" className="flex items-center gap-1">
                    {getFactionName(factionId)}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0"
                      onClick={() => removeFaction(factionId)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {getFactionName(factionId)}</span>
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Select
                  onValueChange={(value) => {
                    const factionId = Number.parseInt(value)
                    if (!selectedFactions.includes(factionId)) {
                      setSelectedFactions([...selectedFactions, factionId])
                    }
                  }}
                  value=""
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select faction" />
                  </SelectTrigger>
                  <SelectContent>
                    {factions
                      .filter((f) => !selectedFactions.includes(f.id))
                      .map((faction) => (
                        <SelectItem key={faction.id} value={faction.id.toString()}>
                          {faction.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={() => setIsAddFactionOpen(true)}>
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Add new faction</span>
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Championships</Label>
              <div className="flex flex-wrap gap-2">
                {selectedChampionships.map((championshipId) => (
                  <Badge key={championshipId} variant="secondary" className="flex items-center gap-1">
                    {getChampionshipName(championshipId)}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0"
                      onClick={() => removeChampionship(championshipId)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {getChampionshipName(championshipId)}</span>
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Select
                  onValueChange={(value) => {
                    const championshipId = Number.parseInt(value)
                    if (!selectedChampionships.includes(championshipId)) {
                      setSelectedChampionships([...selectedChampionships, championshipId])
                    }
                  }}
                  value=""
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select championship" />
                  </SelectTrigger>
                  <SelectContent>
                    {championships
                      .filter((c) => !selectedChampionships.includes(c.id))
                      .map((championship) => (
                        <SelectItem key={championship.id} value={championship.id.toString()}>
                          {championship.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={() => setIsAddChampionshipOpen(true)}>
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Add new championship</span>
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Image</Label>
              <div
                className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-4"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                {imagePreview ? (
                  <div className="relative h-full w-full">
                    <img
                      src={imagePreview || "/placeholder.svg?height=100&width=100"}
                      alt="Preview"
                      className="h-full w-full rounded-lg object-contain"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute right-0 top-0 h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        setImagePreview("")
                        setImageFile(null)
                        setImageUrl("")
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="mb-2 h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Drag and drop an image or click to browse</p>
                  </>
                )}
                <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>
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

      <CreateEntityDialog
        open={isAddPromotionOpen}
        onOpenChange={setIsAddPromotionOpen}
        onSave={handleAddPromotion}
        title="Add Promotion"
        label="Promotion Name"
      />

      <CreateEntityDialog
        open={isAddFactionOpen}
        onOpenChange={setIsAddFactionOpen}
        onSave={handleAddFaction}
        title="Add Faction"
        label="Faction Name"
      />

      <CreateEntityDialog
        open={isAddChampionshipOpen}
        onOpenChange={setIsAddChampionshipOpen}
        onSave={handleAddChampionship}
        title="Add Championship"
        label="Championship Name"
      />
    </>
  )
}
