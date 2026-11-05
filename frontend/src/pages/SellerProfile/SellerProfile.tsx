import { useState, useEffect } from 'react'
import { Star, Calendar, MessageCircle, AlertCircle, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '../../services/supabase'

interface SellerInfo {
  id: string
  full_name: string
  account_type: string
  rating: number
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
  }, [sellerId, filter])

  const fetchSellerData = async () => {
    setLoading(true)
    try {
      const { data: sellerData, error: sellerError } = await supabase
        .from('public_profiles')
        .select('id, full_name, account_type, rating, total_reviews, created_at')
        .eq('id', sellerId)
        .single()

      if (sellerError) throw sellerError
      setSeller(sellerData)

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading seller profile...</p>
        </motion.div>
      </div>
    )
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white p-12 rounded-2xl shadow-lg border border-gray-100"
        >
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <p className="text-gray-900 text-xl font-semibold">Seller not found</p>
          <p className="text-gray-600 mt-2">This seller profile may have been removed or is no longer available.</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Seller Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-teal-50 via-white to-cyan-50 border-b border-gray-100 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            {/* Avatar */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-24 h-24 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg"
            >
              {seller.full_name.charAt(0).toUpperCase()}
            </motion.div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-1">{seller.full_name}</h1>
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-teal-600" />
                    <span className="text-sm font-semibold text-teal-600 capitalize">
                      Verified {seller.account_type || 'Seller'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 mb-4"
              >
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ rotate: -180, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Star
                        size={18}
                        className={i < Math.round(seller.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    </motion.div>
                  ))}
                </div>
                <span className="font-bold text-gray-900">
                  {seller.rating?.toFixed(1)} ({seller.total_reviews} reviews)
                </span>
              </motion.div>

              {/* Contact Info */}
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-teal-600" />
                  <span>Member since {new Date(seller.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'long' })}</span>
                </div>
              </div>
            </div>

            {/* Action */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle size={20} />
              Contact Seller
            </motion.button>
          </div>

          {/* Stats */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl p-6 shadow-md border border-gray-100"
            >
              <p className="text-sm text-gray-600 mb-2 font-semibold">Total Listings</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                {products.length}
              </p>
            </motion.div>
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl p-6 shadow-md border border-gray-100"
            >
              <p className="text-sm text-gray-600 mb-2 font-semibold">Response Rate</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                95%
              </p>
            </motion.div>
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl p-6 shadow-md border border-gray-100"
            >
              <p className="text-sm text-gray-600 mb-2 font-semibold">Positive Feedback</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                {Math.round(seller.rating * 20)}%
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Listings Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8"
        >
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">Seller Listings</h2>
            <p className="text-gray-600">Browse all products from this seller</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter('active')}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                filter === 'active'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter('all')}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </motion.button>
          </div>
        </motion.div>

        {products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-16 text-center shadow-md border border-gray-100"
          >
            <AlertCircle size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-xl font-semibold text-gray-900">No products found</p>
            <p className="text-gray-600 mt-2">This seller doesn't have any listings yet</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {products.map((product) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                onClick={() => window.location.href = `/product?id=${product.id}`}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden cursor-pointer group border border-gray-100"
              >
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-48 flex items-center justify-center text-gray-400 group-hover:scale-105 transition-transform">
                  📦
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-3 group-hover:text-teal-600 transition-colors">
                    {product.title}
                  </h3>

                  <p className="text-2xl font-bold text-teal-600 mb-3">
                    Rs. {product.price.toLocaleString()}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold text-gray-900">{product.rating?.toFixed(1)}</span>
                      <span className="text-xs text-gray-500">({product.total_reviews})</span>
                    </div>
                    <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full capitalize">
                      {product.condition}
                    </span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all text-sm"
                  >
                    View Details
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
