import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Trash2, Eye, Search as SearchIcon, Filter } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../hooks/useAuth'

interface PendingListing {
  id: string
  title: string
  price: number
  seller_id: string
  seller_name: string
  description: string
  created_at: string
  status: string
  category_id: number
}

export default function AdminPanel() {
  const { user } = useAuth()
  const [listings, setListings] = useState<PendingListing[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!user) {
      setLoading(false)
      setErrorMessage('Sign in with an administrator account to moderate listings.')
      return
    }
    const load = async () => {
      const { data: admin, error } = await supabase.from('admins').select('user_id').eq('user_id', user.id).maybeSingle()
      if (error || !admin) {
        setLoading(false)
        setErrorMessage('Administrator access is required to view this page.')
        return
      }
      setErrorMessage('')
      await fetchListings()
    }
    void load()
  }, [filter, user?.id])

  const fetchListings = async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      let query = supabase
        .from('products')
        .select(`
          id,
          title,
          price,
          seller_id,
          description,
          created_at,
          status,
          category_id,
          seller:public_profiles!products_seller_id_fkey(full_name)
        `)

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      const mappedData = (data || []).map(item => ({
        ...item,
        seller_name: (item.seller as any)?.full_name || 'Unknown'
      }))
      setListings(mappedData)
    } catch (err) {
      console.error('Error fetching listings:', err)
      setErrorMessage(err instanceof Error ? err.message : 'Could not load moderation queue.')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: 'approved', approved_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      setListings(listings.map(l => l.id === id ? { ...l, status: 'approved' } : l))
    } catch (err) {
      console.error('Error approving listing:', err)
    }
  }

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: 'rejected' })
        .eq('id', id)

      if (error) throw error
      setListings(listings.map(l => l.id === id ? { ...l, status: 'rejected' } : l))
    } catch (err) {
      console.error('Error rejecting listing:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will delete the listing.')) return

    try {
      const { error } = await supabase.from('products').delete().eq('id', id)

      if (error) throw error
      setListings(listings.filter(l => l.id !== id))
    } catch (err) {
      console.error('Error deleting listing:', err)
    }
  }

  const filteredListings = listings.filter(l =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.seller_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = [
    { label: 'Pending', count: listings.filter(l => l.status === 'pending').length, color: 'from-yellow-500 to-orange-500' },
    { label: 'Approved', count: listings.filter(l => l.status === 'approved').length, color: 'from-green-500 to-emerald-500' },
    { label: 'Rejected', count: listings.filter(l => l.status === 'rejected').length, color: 'from-red-500 to-pink-500' },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        {errorMessage && <div role="alert" className="my-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{errorMessage}</div>}
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
            Admin Panel
          </h1>
          <p className="text-xl text-slate-600">Moderate and approve product listings</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className={`p-6 bg-gradient-to-br ${stat.color} text-white rounded-2xl shadow-lg hover:shadow-xl transition-all`}
            >
              <p className="text-sm font-semibold opacity-90">{stat.label}</p>
              <p className="text-4xl font-bold mt-2">{stat.count}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Search */}
            <div className="relative">
              <SearchIcon size={18} className="absolute left-3 top-3 text-gray-400" />
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="text"
                placeholder="Search by title or seller..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
              />
            </div>

            {/* Filter */}
            <div className="flex gap-2 flex-wrap md:flex-nowrap">
              {(['pending', 'approved', 'rejected', 'all'] as const).map(status => (
                <motion.button
                  key={status}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    filter === status
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Listings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200"
        >
          {loading ? (
            <div className="p-12 text-center text-gray-600">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block"
              >
                <Filter size={32} className="text-teal-500 mb-4" />
              </motion.div>
              <p>Loading listings...</p>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="p-12 text-center text-gray-600">
              <p className="text-lg">No listings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-100 to-slate-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Seller</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Date</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredListings.map((listing, idx) => (
                    <motion.tr
                      key={listing.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-gradient-to-r hover:from-teal-50 to-cyan-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 line-clamp-1">{listing.title}</div>
                        <div className="text-xs text-gray-500">{listing.description.substring(0, 50)}...</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{listing.seller_name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm font-bold text-teal-600">Rs. {listing.price.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          listing.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          listing.status === 'approved' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(listing.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {listing.status === 'pending' && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleApprove(listing.id)}
                                className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all"
                                title="Approve"
                              >
                                <CheckCircle size={18} />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleReject(listing.id)}
                                className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                                title="Reject"
                              >
                                <XCircle size={18} />
                              </motion.button>
                            </>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(listing.id)}
                            className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
                            title="View"
                          >
                            <Eye size={18} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
