"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createPromotion, updatePromotion } from "@/lib/database"
import { uploadImage } from "@/lib/storage"
import type { Promotion } from "@/types/wrestler"
import { useToast } from "@/hooks/use-toast"

interface PromotionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (promotion: Promotion) => void
  title: string
  promotion?: Promotion
}

export function PromotionDialog({ open, onOpenChange, onSave, title, promotion }: PromotionDialogProps) {
  const [name, setName] = useState("")
  const [imageUrl, setImageUrl] = useState<string>("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)
  const [imageUploadSupported, setImageUploadSupported] = useState(true)
  const { toast } = useToast()

  // Initialize form with promotion data if editing
  useEffect(() => {
    if (promotion) {
      setName(promotion.name)
      if (promotion.image_url) {
        setImageUrl(promotion.image_url)
        setImagePreview(promotion.image_url)
        setImageUploadSupported(true)
      }
    } else {
      resetForm()
    }
  }, [promotion, open])

  const resetForm = () => {
    setName("")
    setImageUrl("")
    setImageFile(null)
    setImagePreview("")
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)

      // Upload image if there's a new one and image upload is supported
      let finalImageUrl = imageUrl
      if (imageFile && imageUploadSupported) {
        try {
          const uploadedUrl = await uploadImage(imageFile)
          if (uploadedUrl) {
            finalImageUrl = uploadedUrl
          }
        } catch (error) {
          console.error("Error uploading image:", error)
          // If we get an error related to image_url column, disable image upload
          setImageUploadSupported(false)
          finalImageUrl = ""
        }
      }

      let savedPromotion: Promotion | null

      if (promotion) {
        // Update existing promotion
        savedPromotion = await updatePromotion(promotion.id, name, imageUploadSupported ? finalImageUrl : undefined)
      } else {
        // Create new promotion
        savedPromotion = await createPromotion(name, imageUploadSupported ? finalImageUrl : undefined)
      }

      if (savedPromotion) {
        // If the saved promotion doesn't have image_url, disable image upload for future
        if (finalImageUrl && !savedPromotion.image_url) {
          setImageUploadSupported(false)
          toast({
            title: "Image Upload Not Supported",
            description: "The database doesn't support image uploads for promotions. Only the name was saved.",
            variant: "warning",
          })
        }

        onSave(savedPromotion)
        resetForm()
      } else {
        throw new Error("Failed to save promotion")
      }
    } catch (error) {
      console.error("Error saving promotion:", error)
      toast({
        title: "Error",
        description: "Failed to save promotion",
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
              placeholder="Enter promotion name"
              required
            />
          </div>

          {imageUploadSupported && (
            <div className="grid gap-2">
              <Label>Logo (Optional)</Label>
              <div
                className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-4"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => document.getElementById("promotion-image-upload")?.click()}
              >
                {imagePreview ? (
                  <div className="relative h-full w-full">
                    <img
                      src={imagePreview || "/placeholder.svg"}
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
                    <p className="text-sm text-muted-foreground">Drag and drop a logo or click to browse</p>
                  </>
                )}
                <input
                  id="promotion-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </div>
          )}
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
