import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

export interface MarketplaceCategory {
  id: number
  name: string
  display_order: number | null
}

export function useCategories() {
  const [categories, setCategories] = useState<MarketplaceCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    supabase.from('categories').select('id, name, display_order').order('display_order', { ascending: true })
      .then(({ data, error }) => {
        if (error) console.error('Error fetching marketplace categories:', error)
        if (active) {
          setCategories((data || []) as MarketplaceCategory[])
          setLoading(false)
        }
      })
    return () => { active = false }
  }, [])

  return { categories, loading }
}
