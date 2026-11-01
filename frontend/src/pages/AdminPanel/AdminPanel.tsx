import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Trash2, Eye, Search } from 'lucide-react'
import { supabase } from '../../services/supabase'

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
  const [listings, setListings] = useState<PendingListing[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchListings()
  }, [filter])

  const fetchListings = async () => {
    setLoading(true)
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
          profiles!seller_id(full_name)
        `)

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      const mappedData = (data || []).map(item => ({
        ...item,
        seller_name: (item.profiles as any)?.full_name || 'Unknown'
      }))
      setListings(mappedData)
    } catch (err) {
      console.error('Error fetching listings:', err)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-1">Moderate and approve product listings</p>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or seller..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              {(['pending', 'approved', 'rejected', 'all'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === status
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-yellow-50 p-3 rounded">
              <p className="text-yellow-700 font-semibold">Pending: {listings.filter(l => l.status === 'pending').length}</p>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <p className="text-green-700 font-semibold">Approved: {listings.filter(l => l.status === 'approved').length}</p>
            </div>
            <div className="bg-red-50 p-3 rounded">
              <p className="text-red-700 font-semibold">Rejected: {listings.filter(l => l.status === 'rejected').length}</p>
            </div>
          </div>
        </div>

        {/* Listings Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-600">Loading listings...</div>
          ) : filteredListings.length === 0 ? (
            <div className="p-8 text-center text-gray-600">No listings found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Seller</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredListings.map(listing => (
                    <tr key={listing.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 line-clamp-1">{listing.title}</div>
                        <div className="text-xs text-gray-500">{listing.description.substring(0, 50)}...</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{listing.seller_name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm font-semibold">Rs. {listing.price.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
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
                              <button
                                onClick={() => handleApprove(listing.id)}
                                className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                                title="Approve"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button
                                onClick={() => handleReject(listing.id)}
                                className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                title="Reject"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(listing.id)}
                            className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                          <button
                            className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
