import { useState, useEffect } from 'react'
import { Heart, Star } from 'lucide-react'
import { supabase } from '../../services/supabase'

interface Product {
  id: string
  title: string
  price: number
  rating: number
  total_reviews: number
  condition: string
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, price, rating, total_reviews, condition')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(8)

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="section-container bg-white">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Listings</h2>
        <p className="text-gray-600 mb-12">Loading products...</p>
      </section>
    )
  }

  return (
    <section className="section-container bg-white">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Listings</h2>
      <p className="text-gray-600 mb-12">Check out our most popular electronics right now</p>

      {products.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          <p>No products available yet. Check back soon!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="card !p-0 overflow-hidden hover:shadow-xl transition-all duration-200 group cursor-pointer">
                {/* Product Image */}
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 flex items-center justify-center h-40 relative overflow-hidden group-hover:scale-105 transition-transform">
                  <span className="text-gray-400">Image</span>
                  <button className="absolute top-3 left-3 p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50">
                    <Heart size={16} className="text-gray-400 hover:text-red-500" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
                    {product.title}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold text-gray-900">{product.rating?.toFixed(1) || 'N/A'}</span>
                    </div>
                    <span className="text-xs text-gray-600">({product.total_reviews})</span>
                  </div>

                  {/* Price */}
                  <div className="mb-3">
                    <p className="text-xl font-bold text-teal-600">
                      Rs. {product.price.toLocaleString()}
                    </p>
                  </div>

                  {/* Condition */}
                  <p className="text-xs text-gray-600 mb-4 capitalize">Condition: {product.condition}</p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.location.href = `/product?id=${product.id}`}
                      className="flex-1 btn-secondary text-sm py-2 px-3"
                    >
                      View
                    </button>
                    <button className="flex-1 btn-primary text-sm py-2 px-3">
                      Contact
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => window.location.href = '/search'}
              className="btn-primary px-8 py-3"
            >
              View All Products
            </button>
          </div>
        </>
      )}
    </section>
  )
}
