import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

export interface MarketplaceCategory {
  id: number
  name: string
  slug: string
  display_order: number | null
  parent_id: number | null
}

export interface MarketplaceCategoryNode extends MarketplaceCategory {
  children: MarketplaceCategoryNode[]
}

export function buildCategoryTree(categories: MarketplaceCategory[]): MarketplaceCategoryNode[] {
  const nodes = new Map<number, MarketplaceCategoryNode>()
  categories.forEach(category => nodes.set(category.id, { ...category, children: [] }))
  const roots: MarketplaceCategoryNode[] = []
  nodes.forEach(node => {
    const parent = node.parent_id === null ? undefined : nodes.get(node.parent_id)
    if (parent) parent.children.push(node)
    else roots.push(node)
  })
  const byOrder = (a: MarketplaceCategoryNode, b: MarketplaceCategoryNode) => (a.display_order || 0) - (b.display_order || 0) || a.name.localeCompare(b.name)
  const sort = (items: MarketplaceCategoryNode[]) => {
    items.sort(byOrder)
    items.forEach(item => sort(item.children))
  }
  sort(roots)
  return roots
}

export function getCategoryDescendantIds(category: MarketplaceCategoryNode): number[] {
  return [category.id, ...category.children.flatMap(getCategoryDescendantIds)]
}

export function getCategoryRoot(categories: MarketplaceCategory[], categoryId: number): MarketplaceCategory | undefined {
  let current = categories.find(category => category.id === categoryId)
  while (current?.parent_id !== null && current?.parent_id !== undefined) {
    current = categories.find(category => category.id === current?.parent_id)
  }
  return current
}

export function supportsGoodsTransactions(categories: MarketplaceCategory[], categoryId: number): boolean {
  const root = getCategoryRoot(categories, categoryId)
  return Boolean(root && !['services', 'jobs', 'real-estate'].includes(root.slug))
}

export function getCategoryPaths(category: MarketplaceCategoryNode, ancestors: string[] = []): Array<{ id: number; label: string }> {
  const path = [...ancestors, category.name]
  return [{ id: category.id, label: path.join(' / ') }, ...category.children.flatMap(child => getCategoryPaths(child, path))]
}

export function useCategories() {
  const [categories, setCategories] = useState<MarketplaceCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    supabase.from('categories').select('id, name, slug, display_order, parent_id').order('display_order', { ascending: true })
      .then(async result => {
        let { data, error } = result
        if (error?.code === '42703') {
          const legacyResult = await supabase.from('categories').select('id, name, slug, display_order').order('display_order', { ascending: true })
          data = (legacyResult.data || []).map(category => ({ ...category, parent_id: null }))
          error = legacyResult.error
        }
        if (error) console.error('Error fetching marketplace categories:', error)
        if (active) {
          setCategories((data || []).map(category => ({ ...category, parent_id: category.parent_id ?? null })) as MarketplaceCategory[])
          setLoading(false)
        }
      })
    return () => { active = false }
  }, [])

  return { categories, loading }
}
