import { useState, useEffect } from 'react'
import { Search, X, Sliders, Package, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../services/supabase'
import { useCategories } from '../../hooks/useCategories'

interface Product {
  id: string
  title: string
  price: number
  condition: string
  rating: number
  total_reviews: number
  category_id: number
  images: Array<{ image_url: string }>
}

interface FilterOptions {
  category: number | null
  minPrice: number
  maxPrice: number
  condition: string | null
  search: string
}

export default function SearchPage() {
  const { categories } = useCategories()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterOptions>(() => {
    const params = new URLSearchParams(window.location.search)
    const categoryValue = Number(params.get('category'))
    return {
      category: Number.isInteger(categoryValue) && categoryValue > 0 ? categoryValue : null,
      minPrice: 0,
      maxPrice: 1000000,
      condition: null,
      search: params.get('q') || '',
    }
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    searchProducts()
  }, [filters])

  const searchProducts = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('products')
        .select('id, title, price, condition, rating, total_reviews, category_id, images:product_images(image_url)')
        .eq('status', 'approved')
        .gte('price', filters.minPrice)
        .lte('price', filters.maxPrice)

      if (filters.category) {
        query = query.eq('category_id', filters.category)
      }

      if (filters.condition) {
        query = query.eq('condition', filters.condition)
      }

      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`)
      }

      const { data, error } = await query.order('created_at', { ascending: false }).limit(50)

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      console.error('Error searching products:', err)
    } finally {
      setLoading(false)
    }
  }

  const conditions = ['new', 'like_new', 'excellent', 'good', 'fair']

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-16 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 py-6 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-4">
            Search Products
          </h1>

          {/* Mobile Search & Filter Toggle */}
          <div className="flex gap-2 md:hidden">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="text"
                placeholder="Search..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-semibold flex items-center gap-2"
            >
              <Sliders size={18} />
              Filters
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <AnimatePresence>
            <motion.div
              initial={showFilters ? { opacity: 0, height: 0 } : { opacity: 1, x: 0 }}
              animate={showFilters || window.innerWidth >= 768 ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
              className={`${showFilters || window.innerWidth >= 768 ? 'block' : 'hidden'} md:block w-full md:w-72 space-y-4`}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-md p-6 border border-gray-200"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                  <motion.button
                    onClick={() => setShowFilters(false)}
                    className="md:hidden text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </motion.button>
                </div>

                <div className="space-y-6">
                  {/* Search */}
                  <div className="hidden md:block">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Search Products</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                      <motion.input
                        whileFocus={{ scale: 1.02 }}
                        type="text"
                        placeholder="Search..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Category</label>
                    <div className="space-y-2">
                      <motion.button
                        whileHover={{ x: 4 }}
                        onClick={() => setFilters({ ...filters, category: null })}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                          filters.category === null
                            ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        All Categories
                      </motion.button>
                      {categories.map(cat => (
                        <motion.button
                          key={cat.id}
                          whileHover={{ x: 4 }}
                          onClick={() => setFilters({ ...filters, category: cat.id })}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                            filters.category === cat.id
                              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {cat.name}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Price Range</label>
                    <div className="space-y-2">
                      <motion.input
                        whileFocus={{ scale: 1.02 }}
                        type="number"
                        placeholder="Min price"
                        value={filters.minPrice}
                        onChange={(e) => setFilters({ ...filters, minPrice: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <motion.input
                        whileFocus={{ scale: 1.02 }}
                        type="number"
                        placeholder="Max price"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) || 1000000 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  {/* Condition */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Condition</label>
                    <div className="space-y-2">
                      <motion.button
                        whileHover={{ x: 4 }}
                        onClick={() => setFilters({ ...filters, condition: null })}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                          filters.condition === null
                            ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Any Condition
                      </motion.button>
                      {conditions.map(cond => (
                        <motion.button
                          key={cond}
                          whileHover={{ x: 4 }}
                          onClick={() => setFilters({ ...filters, condition: cond })}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-all capitalize ${
                            filters.condition === cond
                              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {cond.replace('_', ' ')}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Reset */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setFilters({ category: null, minPrice: 0, maxPrice: 1000000, condition: null, search: '' })}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition-all"
                  >
                    Reset Filters
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex justify-center items-center py-20"
              >
                <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full"></div>
              </motion.div>
            ) : products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl p-16 text-center shadow-md"
              >
                <Search size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-xl font-semibold text-gray-900">No products found</p>
                <p className="text-gray-600 mt-2">Try adjusting your filters</p>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    variants={itemVariants}
                    whileHover={{ y: -8 }}
                    onClick={() => window.location.href = `/product?id=${product.id}`}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden cursor-pointer group"
                  >
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-48 overflow-hidden">
                      {product.images?.[0]?.image_url ? <img src={product.images[0].image_url} alt={product.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform" loading="lazy" /> : <div className="h-full flex items-center justify-center text-gray-400"><Package size={28} aria-hidden="true" /></div>}
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-3 group-hover:text-teal-600 transition-colors">
                        {product.title}
                      </h3>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} aria-hidden="true" className={i < Math.round(product.rating) ? 'fill-bidora-coral text-bidora-coral' : 'text-gray-300'} />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">{product.total_reviews > 0 ? `(${product.total_reviews} reviews)` : 'No reviews yet'}</span>
                      </div>

                      <p className="text-2xl font-bold text-teal-600 mb-2">
                        Rs. {product.price.toLocaleString()}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full capitalize">
                          {product.condition}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
