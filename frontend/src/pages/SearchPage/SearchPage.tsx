import { useState, useEffect } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { supabase } from '../../services/supabase'

interface Product {
  id: string
  title: string
  price: number
  condition: string
  rating: number
  total_reviews: number
  category_id: number
}

interface FilterOptions {
  category: number | null
  minPrice: number
  maxPrice: number
  condition: string | null
  search: string
}

export default function SearchPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterOptions>({
    category: null,
    minPrice: 0,
    maxPrice: 1000000,
    condition: null,
    search: '',
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
        .select('id, title, price, condition, rating, total_reviews, category_id')
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

  const categories = [
    { id: 1, name: 'Phones & Tablets' },
    { id: 2, name: 'Laptops & Computers' },
    { id: 3, name: 'Audio & Headphones' },
    { id: 4, name: 'Wearables' },
    { id: 5, name: 'Cameras & Photography' },
    { id: 6, name: 'Gaming & Consoles' },
  ]

  const conditions = ['new', 'like_new', 'excellent', 'good', 'fair']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Search Products</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 space-y-6`}>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="md:hidden text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Search</label>
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Price Range</label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min price"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                  <input
                    type="number"
                    placeholder="Max price"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) || 1000000 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              {/* Condition */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Condition</label>
                <select
                  value={filters.condition || ''}
                  onChange={(e) => setFilters({ ...filters, condition: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                >
                  <option value="">All Conditions</option>
                  {conditions.map(cond => (
                    <option key={cond} value={cond}>
                      {cond.charAt(0).toUpperCase() + cond.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset */}
              <button
                onClick={() => setFilters({ category: null, minPrice: 0, maxPrice: 1000000, condition: null, search: '' })}
                className="w-full bg-gray-200 text-gray-900 font-semibold py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden mb-4 flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-300"
            >
              <Filter size={18} />
              Filters
            </button>

            {loading ? (
              <div className="text-center py-12">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center text-gray-600">
                No products found matching your criteria
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                    <div className="bg-gray-200 h-48 flex items-center justify-center text-gray-400">
                      Image
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{product.title}</h3>
                      <p className="text-2xl font-bold text-teal-600 mb-2">Rs. {product.price.toLocaleString()}</p>
                      <div className="flex items-center justify-between mb-4 text-sm">
                        <span className="text-gray-600">★ {product.rating?.toFixed(1)} ({product.total_reviews})</span>
                        <span className="bg-gray-100 px-2 py-1 rounded capitalize text-xs">
                          {product.condition}
                        </span>
                      </div>
                      <button className="w-full btn-primary py-2">View Details</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
