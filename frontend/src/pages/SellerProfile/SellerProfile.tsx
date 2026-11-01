import { useState, useEffect } from 'react'
import { Star, Calendar, Mail } from 'lucide-react'
import { supabase } from '../../services/supabase'

interface SellerInfo {
  id: string
  full_name: string
  email: string
  account_type: string
  avg_rating: number
  total_reviews: number
  created_at: string
}

interface SellerProduct {
  id: string
  title: string
  price: number
  condition: string
  rating: number
  total_reviews: number
  created_at: string
}

export default function SellerProfile({ sellerId }: { sellerId: string }) {
  const [seller, setSeller] = useState<SellerInfo | null>(null)
  const [products, setProducts] = useState<SellerProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active'>('active')

  useEffect(() => {
    fetchSellerData()
  }, [sellerId])

  const fetchSellerData = async () => {
    setLoading(true)
    try {
      // Fetch seller info from auth.users via profiles
      const { data: sellerData, error: sellerError } = await supabase
        .from('profiles')
        .select('id, full_name, email, account_type, avg_rating, total_reviews, created_at')
        .eq('id', sellerId)
        .single()

      if (sellerError) throw sellerError
      setSeller(sellerData)

      // Fetch seller's products
      let query = supabase
        .from('products')
        .select('id, title, price, condition, rating, total_reviews, created_at')
        .eq('seller_id', sellerId)

      if (filter === 'active') {
        query = query.eq('status', 'approved')
      }

      const { data: productsData, error: productsError } = await query.order('created_at', { ascending: false })

      if (productsError) throw productsError
      setProducts(productsData || [])
    } catch (err) {
      console.error('Error fetching seller data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-12">Loading seller profile...</div>
  if (!seller) return <div className="text-center py-12">Seller not found</div>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Seller Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-start gap-6 mb-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {seller.full_name.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{seller.full_name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={i < Math.round(seller.avg_rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="text-gray-600 font-semibold">
                  {seller.avg_rating?.toFixed(1)} ({seller.total_reviews} reviews)
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>Member since {new Date(seller.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  <span>{seller.email}</span>
                </div>
              </div>
            </div>

            {/* Action */}
            <button className="btn-primary px-6 py-2">Contact Seller</button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Listings</p>
              <p className="text-2xl font-bold text-teal-600">{products.length}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Response Rate</p>
              <p className="text-2xl font-bold text-teal-600">95%</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Positive Feedback</p>
              <p className="text-2xl font-bold text-teal-600">{Math.round(seller.avg_rating * 20)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Listings Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Active Listings</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'active'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center text-gray-600">
            No products found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="bg-gray-200 h-40 flex items-center justify-center text-gray-400">
                  Image
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{product.title}</h3>
                  <p className="text-xl font-bold text-teal-600 mb-2">Rs. {product.price.toLocaleString()}</p>
                  <div className="flex items-center justify-between mb-4 text-sm">
                    <span className="text-gray-600">★ {product.rating?.toFixed(1)}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded capitalize text-xs">
                      {product.condition}
                    </span>
                  </div>
                  <button className="w-full btn-primary py-2 text-sm">View Details</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
