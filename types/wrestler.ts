export interface Wrestler {
  id: number
  name: string
  image_url?: string
  created_at?: string
  updated_at?: string
  promotions?: Promotion[]
  factions?: Faction[]
  championships?: Championship[]
}

export interface Promotion {
  id: number
  name: string
  image_url?: string
  created_at?: string
  updated_at?: string
}

export interface Faction {
  id: number
  name: string
  image_url?: string
  created_at?: string
  updated_at?: string
}

export interface Championship {
  id: number
  name: string
  created_at?: string
}

export interface WrestlerFormData {
  id?: number
  name: string
  image_url?: string
  promotions?: number[]
  factions?: number[]
  championships?: number[]
}

export interface PromotionFormData {
  id?: number
  name: string
  image_url?: string
}

export interface FactionFormData {
  id?: number
  name: string
  image_url?: string
}
