import { useState, useEffect } from 'react'
import { Heart, Star, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  if (loading) {
    return (
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Listings</h2>
          <p className="text-gray-600 mb-12">Loading products...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-slate-700 bg-clip-text text-transparent mb-4">
            Featured Listings
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl">
            Check out our most popular electronics right now. Discover amazing deals from verified sellers.
          </p>
        </motion.div>

        {products.length === 0 ? (
          <div className="text-center py-16 text-gray-600 bg-white rounded-2xl">
            <p className="text-lg">No products available yet. Check back soon!</p>
          </div>
        ) : (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            >
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="group h-full"
                >
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col">
                    {/* Product Image Container */}
                    <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl group-hover:scale-110 transition-transform duration-300">
                        📱
                      </div>

                      {/* Badge */}
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="absolute top-3 right-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full"
                      >
                        NEW
                      </motion.div>

                      {/* Favorite Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute top-3 left-3 p-2 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Heart size={18} className="text-gray-400 hover:text-red-500 transition-colors" />
                      </motion.button>
                    </div>

                    {/* Product Info */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <motion.h3
                          className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-teal-600 transition-colors text-lg"
                        >
                          {product.title}
                        </motion.h3>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < Math.round(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {product.rating?.toFixed(1) || 'N/A'}
                          </span>
                          <span className="text-xs text-gray-600">
                            ({product.total_reviews})
                          </span>
                        </div>

                        {/* Price */}
                        <motion.p
                          className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-3"
                        >
                          Rs. {product.price.toLocaleString()}
                        </motion.p>

                        {/* Condition */}
                        <div className="inline-block bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1 rounded-lg capitalize">
                          {product.condition}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-6 mt-4 border-t border-gray-200">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => window.location.href = `/product?id=${product.id}`}
                          className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg transition-all text-sm"
                        >
                          View
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 border-2 border-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg hover:border-teal-500 hover:text-teal-600 transition-all text-sm"
                        >
                          Contact
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* View All Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-center"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(20, 184, 166, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/search'}
                className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-2xl transition-all group"
              >
                View All Products
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ArrowRight size={20} />
                </motion.div>
              </motion.button>
            </motion.div>
          </>
        )}
      </div>
    </section>
  )
}
