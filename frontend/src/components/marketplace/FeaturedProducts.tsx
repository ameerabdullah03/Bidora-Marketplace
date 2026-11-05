import { useEffect, useState } from 'react'
import { ArrowRight, Heart, Package, Star } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../hooks/useAuth'

interface Product {
  id: string
  title: string
  price: number
  rating: number | null
  total_reviews: number | null
  condition: string
  images: Array<{ image_url: string }>
}

const formatPrice = (price: number) => `Rs ${Number(price).toLocaleString('en-PK')}`

export default function FeaturedProducts() {
  const { user } = useAuth()
  const reduceMotion = useReducedMotion()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    let active = true
    supabase.from('products').select('id, title, price, rating, total_reviews, condition, images:product_images(image_url)')
      .eq('status', 'approved').order('created_at', { ascending: false }).limit(8)
      .then(({ data, error }) => { if (error) console.error('Error fetching products:', error); if (active) { setProducts((data || []) as Product[]); setLoading(false) } })
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    if (!user) { setFavoriteIds(new Set()); return }
    supabase.from('favorites').select('product_id').eq('user_id', user.id).then(({ data, error }) => {
      if (error) console.error('Error loading saved listings:', error)
      else if (active) setFavoriteIds(new Set((data || []).map(item => item.product_id)))
    })
    return () => { active = false }
  }, [user?.id])

  const toggleFavorite = async (event: React.MouseEvent, productId: string) => {
    event.preventDefault(); event.stopPropagation()
    if (!user) { window.location.href = '/auth'; return }
    const isSaved = favoriteIds.has(productId)
    const result = isSaved ? await supabase.from('favorites').delete().eq('user_id', user.id).eq('product_id', productId) : await supabase.from('favorites').insert({ user_id: user.id, product_id: productId })
    if (result.error) { console.error('Error updating saved listing:', result.error); return }
    setFavoriteIds(current => { const next = new Set(current); isSaved ? next.delete(productId) : next.add(productId); return next })
  }

  return <section className="relative overflow-hidden bg-white py-16 sm:py-24">
    <div className="mx-auto max-w-7xl px-5 sm:px-8">
      <div className="mb-9 flex items-end justify-between gap-6 sm:mb-12">
        <div><p className="eyebrow mb-3">Freshly listed</p><h2 className="text-3xl font-extrabold tracking-[-.055em] sm:text-4xl">Good things, just in</h2><p className="mt-3 max-w-xl text-sm leading-6 text-bidora-muted sm:text-base">A rotating selection from sellers across the Bidora marketplace.</p></div>
        <a href="/search" className="hidden shrink-0 items-center gap-2 border border-bidora-ink/15 px-4 py-2.5 text-sm font-bold transition hover:bg-bidora-paper sm:inline-flex">Browse all <ArrowRight size={15} /></a>
      </div>
      {loading ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5" aria-label="Loading listings">{Array.from({ length: 4 }, (_, i) => <div key={i} className="aspect-[.78] animate-pulse rounded-2xl bg-bidora-paper" />)}</div>
        : products.length === 0 ? <div className="rounded-3xl border border-dashed border-bidora-ink/20 bg-bidora-paper/50 px-6 py-14 text-center"><p className="text-lg font-bold">The shelves are waiting.</p><p className="mt-2 text-sm text-bidora-muted">Approved listings will show up here as sellers join.</p><a href="/create-listing" className="mt-5 inline-flex bg-bidora-ink px-5 py-3 text-sm font-bold text-white">List the first one</a></div>
        : <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">{products.map((product, index) => <motion.a key={product.id} href={`/product?id=${encodeURIComponent(product.id)}`} initial={reduceMotion ? false : { opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .045, duration: .35 }} className="group relative overflow-hidden rounded-2xl border border-bidora-ink/10 bg-bidora-paper/50 transition hover:-translate-y-1 hover:shadow-xl">
          <div className="relative aspect-[.94] overflow-hidden bg-[#e9e8df] sm:aspect-[.88]">{product.images?.[0]?.image_url ? <img src={product.images[0].image_url} alt={product.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" /> : <div className="grid h-full place-items-center text-bidora-ink/30"><Package size={32} aria-hidden="true" /></div>}
            <span className="absolute left-3 top-3 rounded-sm bg-bidora-paper/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-bidora-ink">{(product.condition || 'Pre-loved').replaceAll('_', ' ')}</span>
            <button type="button" onClick={event => toggleFavorite(event, product.id)} aria-label={favoriteIds.has(product.id) ? 'Remove saved listing' : 'Save listing'} aria-pressed={favoriteIds.has(product.id)} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-bidora-ink shadow-sm transition hover:scale-105 hover:text-bidora-coral"><Heart size={17} className={favoriteIds.has(product.id) ? 'fill-bidora-coral text-bidora-coral' : ''} /></button>
          </div>
          <div className="p-3.5 sm:p-4"><h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 sm:text-base">{product.title}</h3><div className="mt-2 flex min-h-5 items-center gap-1 text-xs text-bidora-muted">{product.rating ? <><Star size={13} className="fill-bidora-coral text-bidora-coral" /><span className="font-semibold text-bidora-ink">{product.rating.toFixed(1)}</span><span>({product.total_reviews || 0})</span></> : <span>Awaiting first review</span>}</div><p className="mt-3 text-base font-extrabold tracking-tight sm:text-lg">{formatPrice(product.price)}</p><span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-bidora-ink">Take a closer look <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" /></span></div>
        </motion.a>)}</div>}
      <a href="/search" className="mt-6 inline-flex items-center gap-2 border border-bidora-ink/15 px-4 py-2.5 text-sm font-bold sm:hidden">Browse all <ArrowRight size={15} /></a>
    </div>
  </section>
}
