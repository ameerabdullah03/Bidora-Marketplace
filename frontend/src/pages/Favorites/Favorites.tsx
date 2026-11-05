import { useEffect, useState } from 'react'
import { Heart, Package, Trash2 } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../hooks/useAuth'

interface SavedProduct {
  id: string
  title: string
  price: number
  condition: string
  images: Array<{ image_url: string }>
}

export default function Favorites() {
  const { user } = useAuth()
  const [products, setProducts] = useState<SavedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    let cancelled = false
    const load = async () => {
      const { data, error: queryError } = await supabase
        .from('favorites')
        .select('product:products!favorites_product_id_fkey(id, title, price, condition, status, images:product_images(image_url))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (cancelled) return
      if (queryError) setError(queryError.message)
      else setProducts((data || []).map((row: any) => row.product).filter((product: any) => product?.status === 'approved'))
      setLoading(false)
    }
    void load()
    return () => { cancelled = true }
  }, [user?.id])

  const removeFavorite = async (productId: string) => {
    if (!user) return
    const { error: deleteError } = await supabase.from('favorites').delete().eq('user_id', user.id).eq('product_id', productId)
    if (deleteError) setError(deleteError.message)
    else setProducts((current) => current.filter((product) => product.id !== productId))
  }

  if (!user) return <main className="min-h-[50vh] grid place-items-center p-6"><div className="text-center"><Heart className="mx-auto mb-3 text-teal-600" size={36} /><h1 className="text-2xl font-bold">Sign in to view saved listings</h1><a href="/auth" className="mt-4 inline-block text-teal-700 underline">Sign in</a></div></main>

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900">Saved Listings</h1><p className="mt-1 text-gray-600">Products you’ve bookmarked for later.</p></div>
        {error && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</p>}
        {loading ? <p className="py-12 text-center text-gray-500">Loading saved listings…</p> : products.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm"><Heart className="mx-auto mb-3 text-gray-300" size={42} /><p className="text-lg font-semibold text-gray-900">No saved listings yet</p><a className="mt-4 inline-block text-teal-700 underline" href="/search">Browse products</a></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <article key={product.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <button onClick={() => window.location.href = `/product?id=${product.id}`} className="block h-48 w-full bg-gray-100">
                  {product.images?.[0]?.image_url ? <img src={product.images[0].image_url} alt={product.title} className="h-full w-full object-cover" loading="lazy" /> : <span className="grid h-full place-items-center text-gray-400"><Package size={28} aria-hidden="true" /></span>}
                </button>
                <div className="p-4"><h2 className="line-clamp-2 font-semibold text-gray-900">{product.title}</h2><div className="mt-3 flex items-center justify-between"><p className="font-bold text-teal-700">Rs. {Number(product.price).toLocaleString()}</p><span className="text-xs capitalize text-gray-500">{product.condition}</span></div><button onClick={() => removeFavorite(product.id)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 py-2 text-sm text-gray-700 hover:bg-gray-50"><Trash2 size={15} />Remove saved listing</button></div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
