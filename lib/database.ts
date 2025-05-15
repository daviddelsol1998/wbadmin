import { getSupabaseBrowserClient } from "./supabase"
import type { Wrestler, Promotion, Faction, Championship, WrestlerFormData } from "@/types/wrestler"

// Wrestler operations
export async function getWrestlers(): Promise<Wrestler[]> {
  const supabase = getSupabaseBrowserClient()

  const { data: wrestlers, error } = await supabase.from("wrestlers").select("*").order("name")

  if (error) {
    console.error("Error fetching wrestlers:", error)
    return []
  }

  // Get related data for each wrestler
  const wrestlersWithRelations = await Promise.all(
    wrestlers.map(async (wrestler) => {
      const [promotions, factions, championships] = await Promise.all([
        getWrestlerPromotions(wrestler.id),
        getWrestlerFactions(wrestler.id),
        getWrestlerChampionships(wrestler.id),
      ])

      return {
        ...wrestler,
        promotions,
        factions,
        championships,
      }
    }),
  )

  return wrestlersWithRelations
}

export async function getWrestlerPromotions(wrestlerId: number): Promise<Promotion[]> {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase
    .from("wrestler_promotions")
    .select("promotion_id")
    .eq("wrestler_id", wrestlerId)

  if (error || !data.length) {
    return []
  }

  const promotionIds = data.map((item) => item.promotion_id)

  const { data: promotions, error: promotionsError } = await supabase
    .from("promotions")
    .select("*")
    .in("id", promotionIds)

  if (promotionsError) {
    console.error("Error fetching promotions:", promotionsError)
    return []
  }

  return promotions || []
}

export async function getWrestlerFactions(wrestlerId: number): Promise<Faction[]> {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase.from("wrestler_factions").select("faction_id").eq("wrestler_id", wrestlerId)

  if (error || !data.length) {
    return []
  }

  const factionIds = data.map((item) => item.faction_id)

  const { data: factions, error: factionsError } = await supabase.from("factions").select("*").in("id", factionIds)

  if (factionsError) {
    console.error("Error fetching factions:", factionsError)
    return []
  }

  return factions || []
}

export async function getWrestlerChampionships(wrestlerId: number): Promise<Championship[]> {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase
    .from("wrestler_championships")
    .select("championship_id")
    .eq("wrestler_id", wrestlerId)

  if (error || !data.length) {
    return []
  }

  const championshipIds = data.map((item) => item.championship_id)

  const { data: championships, error: championshipsError } = await supabase
    .from("championships")
    .select("*")
    .in("id", championshipIds)

  if (championshipsError) {
    console.error("Error fetching championships:", championshipsError)
    return []
  }

  return championships || []
}

export async function createWrestler(wrestlerData: WrestlerFormData): Promise<Wrestler | null> {
  const supabase = getSupabaseBrowserClient()

  // Insert wrestler
  const { data: wrestler, error } = await supabase
    .from("wrestlers")
    .insert({
      name: wrestlerData.name,
      image_url: wrestlerData.image_url,
    })
    .select()
    .single()

  if (error || !wrestler) {
    console.error("Error creating wrestler:", error)
    return null
  }

  // Insert relations
  await Promise.all([
    // Add promotions
    ...(wrestlerData.promotions || []).map((promotionId) =>
      supabase.from("wrestler_promotions").insert({ wrestler_id: wrestler.id, promotion_id: promotionId }),
    ),

    // Add factions
    ...(wrestlerData.factions || []).map((factionId) =>
      supabase.from("wrestler_factions").insert({ wrestler_id: wrestler.id, faction_id: factionId }),
    ),

    // Add championships
    ...(wrestlerData.championships || []).map((championshipId) =>
      supabase.from("wrestler_championships").insert({ wrestler_id: wrestler.id, championship_id: championshipId }),
    ),
  ])

  // Get the complete wrestler with relations
  const [promotions, factions, championships] = await Promise.all([
    getWrestlerPromotions(wrestler.id),
    getWrestlerFactions(wrestler.id),
    getWrestlerChampionships(wrestler.id),
  ])

  return {
    ...wrestler,
    promotions,
    factions,
    championships,
  }
}

export async function updateWrestler(wrestlerData: WrestlerFormData): Promise<Wrestler | null> {
  if (!wrestlerData.id) return null

  const supabase = getSupabaseBrowserClient()

  // Update wrestler
  const { data: wrestler, error } = await supabase
    .from("wrestlers")
    .update({
      name: wrestlerData.name,
      image_url: wrestlerData.image_url,
      updated_at: new Date().toISOString(),
    })
    .eq("id", wrestlerData.id)
    .select()
    .single()

  if (error || !wrestler) {
    console.error("Error updating wrestler:", error)
    return null
  }

  // Delete existing relations
  await Promise.all([
    supabase.from("wrestler_promotions").delete().eq("wrestler_id", wrestler.id),
    supabase.from("wrestler_factions").delete().eq("wrestler_id", wrestler.id),
    supabase.from("wrestler_championships").delete().eq("wrestler_id", wrestler.id),
  ])

  // Insert new relations
  await Promise.all([
    // Add promotions
    ...(wrestlerData.promotions || []).map((promotionId) =>
      supabase.from("wrestler_promotions").insert({ wrestler_id: wrestler.id, promotion_id: promotionId }),
    ),

    // Add factions
    ...(wrestlerData.factions || []).map((factionId) =>
      supabase.from("wrestler_factions").insert({ wrestler_id: wrestler.id, faction_id: factionId }),
    ),

    // Add championships
    ...(wrestlerData.championships || []).map((championshipId) =>
      supabase.from("wrestler_championships").insert({ wrestler_id: wrestler.id, championship_id: championshipId }),
    ),
  ])

  // Get the complete wrestler with relations
  const [promotions, factions, championships] = await Promise.all([
    getWrestlerPromotions(wrestler.id),
    getWrestlerFactions(wrestler.id),
    getWrestlerChampionships(wrestler.id),
  ])

  return {
    ...wrestler,
    promotions,
    factions,
    championships,
  }
}

export async function deleteWrestler(id: number): Promise<boolean> {
  const supabase = getSupabaseBrowserClient()

  const { error } = await supabase.from("wrestlers").delete().eq("id", id)

  if (error) {
    console.error("Error deleting wrestler:", error)
    return false
  }

  return true
}

// Promotion operations
export async function getPromotions(): Promise<Promotion[]> {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase.from("promotions").select("*").order("name")

  if (error) {
    console.error("Error fetching promotions:", error)
    return []
  }

  return data
}

export async function getPromotion(id: number): Promise<Promotion | null> {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase.from("promotions").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching promotion:", error)
    return null
  }

  return data
}

export async function createPromotion(name: string, imageUrl?: string): Promise<Promotion | null> {
  const supabase = getSupabaseBrowserClient()

  // First, check if the image_url column exists
  try {
    // Create a simple object with just the name
    const promotionData: Record<string, any> = { name }

    // Only add image_url if provided
    if (imageUrl) {
      promotionData.image_url = imageUrl
    }

    const { data, error } = await supabase.from("promotions").insert(promotionData).select().single()

    if (error) {
      console.error("Error creating promotion:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in createPromotion:", error)

    // Fallback to just inserting the name if there was an error with image_url
    const { data, error: fallbackError } = await supabase.from("promotions").insert({ name }).select().single()

    if (fallbackError) {
      console.error("Error in fallback createPromotion:", fallbackError)
      return null
    }

    return data
  }
}

export async function updatePromotion(id: number, name: string, imageUrl?: string): Promise<Promotion | null> {
  const supabase = getSupabaseBrowserClient()

  try {
    // Create update object with just the required fields
    const updateData: Record<string, any> = {
      name,
      updated_at: new Date().toISOString(),
    }

    // Only add image_url if provided
    if (imageUrl !== undefined) {
      updateData.image_url = imageUrl
    }

    const { data, error } = await supabase.from("promotions").update(updateData).eq("id", id).select().single()

    if (error) {
      console.error("Error updating promotion:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in updatePromotion:", error)

    // Fallback to just updating the name
    const { data, error: fallbackError } = await supabase
      .from("promotions")
      .update({ name })
      .eq("id", id)
      .select()
      .single()

    if (fallbackError) {
      console.error("Error in fallback updatePromotion:", fallbackError)
      return null
    }

    return data
  }
}

export async function deletePromotion(id: number): Promise<boolean> {
  const supabase = getSupabaseBrowserClient()

  const { error } = await supabase.from("promotions").delete().eq("id", id)

  if (error) {
    console.error("Error deleting promotion:", error)
    return false
  }

  return true
}

// Add this function to the existing database.ts file
export async function getPromotionsWithWrestlerCount(): Promise<(Promotion & { wrestler_count: number })[]> {
  const supabase = getSupabaseBrowserClient()

  // First get all promotions
  const { data: promotions, error } = await supabase.from("promotions").select("*").order("name")

  if (error) {
    console.error("Error fetching promotions:", error)
    return []
  }

  // Then get the wrestler count for each promotion
  const promotionsWithCount = await Promise.all(
    promotions.map(async (promotion) => {
      const { count, error: countError } = await supabase
        .from("wrestler_promotions")
        .select("*", { count: "exact", head: true })
        .eq("promotion_id", promotion.id)

      if (countError) {
        console.error(`Error getting count for promotion ${promotion.id}:`, countError)
        return { ...promotion, wrestler_count: 0 }
      }

      return { ...promotion, wrestler_count: count || 0 }
    }),
  )

  return promotionsWithCount
}

// Add this function to the existing database.ts file
export async function getWrestlersByPromotion(promotionId: number): Promise<Wrestler[]> {
  const supabase = getSupabaseBrowserClient()

  // Get wrestler IDs associated with this promotion
  const { data: wrestlerPromotions, error: relationError } = await supabase
    .from("wrestler_promotions")
    .select("wrestler_id")
    .eq("promotion_id", promotionId)

  if (relationError || !wrestlerPromotions.length) {
    console.error("Error fetching wrestler promotions:", relationError)
    return []
  }

  const wrestlerIds = wrestlerPromotions.map((wp) => wp.wrestler_id)

  // Get the wrestlers
  const { data: wrestlers, error: wrestlersError } = await supabase
    .from("wrestlers")
    .select("*")
    .in("id", wrestlerIds)
    .order("name")

  if (wrestlersError) {
    console.error("Error fetching wrestlers:", wrestlersError)
    return []
  }

  // Get championships for each wrestler
  const wrestlersWithChampionships = await Promise.all(
    wrestlers.map(async (wrestler) => {
      const championships = await getWrestlerChampionships(wrestler.id)
      return {
        ...wrestler,
        championships,
      }
    }),
  )

  return wrestlersWithChampionships
}

// Faction operations
export async function getFactions(): Promise<Faction[]> {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase.from("factions").select("*").order("name")

  if (error) {
    console.error("Error fetching factions:", error)
    return []
  }

  return data
}

// Update the createFaction function to accept an image URL
export async function createFaction(name: string, imageUrl?: string): Promise<Faction | null> {
  const supabase = getSupabaseBrowserClient()

  try {
    // Create a simple object with just the name
    const factionData: Record<string, any> = { name }

    // Only add image_url if provided
    if (imageUrl) {
      factionData.image_url = imageUrl
    }

    const { data, error } = await supabase.from("factions").insert(factionData).select().single()

    if (error) {
      console.error("Error creating faction:", error)

      // If the error is related to the image_url column, try again with just the name
      if (error.message.includes("image_url")) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("factions")
          .insert({ name })
          .select()
          .single()

        if (fallbackError) {
          console.error("Error in fallback createFaction:", fallbackError)
          return null
        }

        return fallbackData
      }

      return null
    }

    return data
  } catch (error) {
    console.error("Error in createFaction:", error)

    // Fallback to just inserting the name if there was an error
    const { data, error: fallbackError } = await supabase.from("factions").insert({ name }).select().single()

    if (fallbackError) {
      console.error("Error in fallback createFaction:", fallbackError)
      return null
    }

    return data
  }
}

// Update the updateFaction function to accept an image URL
export async function updateFaction(id: number, name: string, imageUrl?: string): Promise<Faction | null> {
  const supabase = getSupabaseBrowserClient()

  try {
    // Create update object with just the required fields
    const updateData: Record<string, any> = {
      name,
      updated_at: new Date().toISOString(),
    }

    // Only add image_url if provided
    if (imageUrl !== undefined) {
      updateData.image_url = imageUrl
    }

    const { data, error } = await supabase.from("factions").update(updateData).eq("id", id).select().single()

    if (error) {
      console.error("Error updating faction:", error)

      // If the error is related to the image_url column, try again with just the name
      if (error.message.includes("image_url")) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("factions")
          .update({ name })
          .eq("id", id)
          .select()
          .single()

        if (fallbackError) {
          console.error("Error in fallback updateFaction:", fallbackError)
          return null
        }

        return fallbackData
      }

      return null
    }

    return data
  } catch (error) {
    console.error("Error in updateFaction:", error)

    // Fallback to just updating the name
    const { data, error: fallbackError } = await supabase
      .from("factions")
      .update({ name })
      .eq("id", id)
      .select()
      .single()

    if (fallbackError) {
      console.error("Error in fallback updateFaction:", fallbackError)
      return null
    }

    return data
  }
}

export async function getFaction(id: number): Promise<Faction | null> {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase.from("factions").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching faction:", error)
    return null
  }

  return data
}

export async function deleteFaction(id: number): Promise<boolean> {
  const supabase = getSupabaseBrowserClient()

  const { error } = await supabase.from("factions").delete().eq("id", id)

  if (error) {
    console.error("Error deleting faction:", error)
    return false
  }

  return true
}

// Add this function to get factions with wrestler count
export async function getFactionsWithWrestlerCount(): Promise<(Faction & { wrestler_count: number })[]> {
  const supabase = getSupabaseBrowserClient()

  // First get all factions
  const { data: factions, error } = await supabase.from("factions").select("*").order("name")

  if (error) {
    console.error("Error fetching factions:", error)
    return []
  }

  // Then get the wrestler count for each faction
  const factionsWithCount = await Promise.all(
    factions.map(async (faction) => {
      const { count, error: countError } = await supabase
        .from("wrestler_factions")
        .select("*", { count: "exact", head: true })
        .eq("faction_id", faction.id)

      if (countError) {
        console.error(`Error getting count for faction ${faction.id}:`, countError)
        return { ...faction, wrestler_count: 0 }
      }

      return { ...faction, wrestler_count: count || 0 }
    }),
  )

  return factionsWithCount
}

// Add this function to get wrestlers by faction ID
export async function getWrestlersByFaction(factionId: number): Promise<Wrestler[]> {
  const supabase = getSupabaseBrowserClient()

  // Get wrestler IDs associated with this faction
  const { data: wrestlerFactions, error: relationError } = await supabase
    .from("wrestler_factions")
    .select("wrestler_id")
    .eq("faction_id", factionId)

  if (relationError || !wrestlerFactions.length) {
    console.error("Error fetching wrestler factions:", relationError)
    return []
  }

  const wrestlerIds = wrestlerFactions.map((wf) => wf.wrestler_id)

  // Get the wrestlers
  const { data: wrestlers, error: wrestlersError } = await supabase
    .from("wrestlers")
    .select("*")
    .in("id", wrestlerIds)
    .order("name")

  if (wrestlersError) {
    console.error("Error fetching wrestlers:", wrestlersError)
    return []
  }

  // Get championships for each wrestler
  const wrestlersWithChampionships = await Promise.all(
    wrestlers.map(async (wrestler) => {
      const championships = await getWrestlerChampionships(wrestler.id)
      return {
        ...wrestler,
        championships,
      }
    }),
  )

  return wrestlersWithChampionships
}

// Championship operations
export async function getChampionships(): Promise<Championship[]> {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase.from("championships").select("*").order("name")

  if (error) {
    console.error("Error fetching championships:", error)
    return []
  }

  return data
}

export async function createChampionship(name: string): Promise<Championship | null> {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase.from("championships").insert({ name }).select().single()

  if (error) {
    console.error("Error creating championship:", error)
    return null
  }

  return data
}

export async function getChampionship(id: number): Promise<Championship | null> {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase.from("championships").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching championship:", error)
    return null
  }

  return data
}

export async function updateChampionship(id: number, name: string): Promise<Championship | null> {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase
    .from("championships")
    .update({ name, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating championship:", error)
    return null
  }

  return data
}

export async function deleteChampionship(id: number): Promise<boolean> {
  const supabase = getSupabaseBrowserClient()

  const { error } = await supabase.from("championships").delete().eq("id", id)

  if (error) {
    console.error("Error deleting championship:", error)
    return false
  }

  return true
}

// Add this function to get championships with wrestler count
export async function getChampionshipsWithWrestlerCount(): Promise<(Championship & { wrestler_count: number })[]> {
  const supabase = getSupabaseBrowserClient()

  // First get all championships
  const { data: championships, error } = await supabase.from("championships").select("*").order("name")

  if (error) {
    console.error("Error fetching championships:", error)
    return []
  }

  // Then get the wrestler count for each championship
  const championshipsWithCount = await Promise.all(
    championships.map(async (championship) => {
      const { count, error: countError } = await supabase
        .from("wrestler_championships")
        .select("*", { count: "exact", head: true })
        .eq("championship_id", championship.id)

      if (countError) {
        console.error(`Error getting count for championship ${championship.id}:`, countError)
        return { ...championship, wrestler_count: 0 }
      }

      return { ...championship, wrestler_count: count || 0 }
    }),
  )

  return championshipsWithCount
}

// Add this function to get wrestlers by championship ID
export async function getWrestlersByChampionship(championshipId: number): Promise<Wrestler[]> {
  const supabase = getSupabaseBrowserClient()

  // Get wrestler IDs associated with this championship
  const { data: wrestlerChampionships, error: relationError } = await supabase
    .from("wrestler_championships")
    .select("wrestler_id")
    .eq("championship_id", championshipId)

  if (relationError || !wrestlerChampionships.length) {
    console.error("Error fetching wrestler championships:", relationError)
    return []
  }

  const wrestlerIds = wrestlerChampionships.map((wc) => wc.wrestler_id)

  // Get the wrestlers
  const { data: wrestlers, error: wrestlersError } = await supabase
    .from("wrestlers")
    .select("*")
    .in("id", wrestlerIds)
    .order("name")

  if (wrestlersError) {
    console.error("Error fetching wrestlers:", wrestlersError)
    return []
  }

  // Get promotions and factions for each wrestler
  const wrestlersWithRelations = await Promise.all(
    wrestlers.map(async (wrestler) => {
      const [promotions, factions] = await Promise.all([
        getWrestlerPromotions(wrestler.id),
        getWrestlerFactions(wrestler.id),
      ])
      return {
        ...wrestler,
        promotions,
        factions,
      }
    }),
  )

  return wrestlersWithRelations
}
