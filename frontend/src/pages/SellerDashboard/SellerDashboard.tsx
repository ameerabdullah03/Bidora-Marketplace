import { useEffect, useState } from 'react'
import { Plus, Package, DollarSign, Clock, TrendingUp } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../hooks/useAuth'

interface Listing {
  id: string
  title: string
  price: number
  status: string
  is_auction: boolean
  created_at: string
}

interface SellerOrder {
  id: string
  amount: number
  order_status: string
  created_at: string
  product: { title: string } | null
}

interface SellerAuction {
  id: string
  starting_price: number
  current_bid: number
  total_bids: number
  end_time: string
  product: { title: string } | null
}

export default function SellerDashboard() {
  const { user, profile } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'auctions' | 'orders'>('overview')
  const [listings, setListings] = useState<Listing[]>([])
  const [auctions, setAuctions] = useState<SellerAuction[]>([])
  const [orders, setOrders] = useState<SellerOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    let cancelled = false
    const loadDashboard = async () => {
      setLoading(true)
      setError('')
      try {
        const [productResult, auctionResult, orderResult] = await Promise.all([
          supabase.from('products')
            .select('id, title, price, status, is_auction, created_at')
            .eq('seller_id', user.id)
            .order('created_at', { ascending: false }),
          supabase.from('auctions')
            .select('id, starting_price, current_bid, total_bids, end_time, product:products!auctions_product_id_fkey(title)')
            .eq('seller_id', user.id)
            .order('end_time', { ascending: true }),
          supabase.from('orders')
            .select('id, amount, order_status, created_at, product:products!orders_product_id_fkey(title)')
            .eq('seller_id', user.id)
            .order('created_at', { ascending: false }),
        ])
        if (productResult.error) throw productResult.error
        if (auctionResult.error) throw auctionResult.error
        if (orderResult.error) throw orderResult.error
        if (cancelled) return
        setListings((productResult.data || []) as Listing[])
        setAuctions((auctionResult.data || []) as unknown as SellerAuction[])
        setOrders((orderResult.data || []) as unknown as SellerOrder[])
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load seller dashboard.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void loadDashboard()
    return () => { cancelled = true }
  }, [user?.id])

  const stats = [
    { label: 'Approved Listings', value: listings.filter((item) => item.status === 'approved').length, icon: <Package size={24} className="text-blue-500" />, bg: 'bg-blue-50' },
    { label: 'Completed Sales', value: orders.filter((order) => order.order_status === 'delivered').length, icon: <DollarSign size={24} className="text-green-500" />, bg: 'bg-green-50' },
    { label: 'Active Auctions', value: auctions.filter((auction) => new Date(auction.end_time) > new Date()).length, icon: <Clock size={24} className="text-orange-500" />, bg: 'bg-orange-50' },
    { label: 'Seller Rating', value: Number(profile?.rating || 0).toFixed(1), icon: <TrendingUp size={24} className="text-teal-500" />, bg: 'bg-teal-50' },
  ]

  const tabs = ['overview', 'listings', 'auctions', 'orders'] as const

  if (!user || profile?.account_type !== 'seller') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900">Seller access required</h1>
          <p className="mt-2 text-gray-600">Sign in with a seller account to manage your listings and orders.</p>
          <a href="/auth" className="mt-5 inline-block rounded-lg bg-teal-600 px-5 py-3 font-semibold text-white">Sign in</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {profile?.full_name || 'Seller'}</p>
          </div>
          <button onClick={() => window.location.href = '/create-listing'} className="btn-primary flex items-center gap-2">
            <Plus size={20} /> New Listing
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6">
              <div className={`${stat.bg} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>{stat.icon}</div>
              <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? 'Loading' : stat.value}</p>
            </div>
          ))}
        </div>

        <section className="bg-white rounded-xl shadow-sm">
          <nav className="flex overflow-x-auto border-b border-gray-200" aria-label="Seller dashboard sections">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-4 font-medium text-sm border-b-2 capitalize ${activeTab === tab ? 'border-teal-600 text-teal-700' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
                {tab}
              </button>
            ))}
          </nav>
          <div className="p-6">
            {loading ? <p className="py-10 text-center text-gray-500">Loading your marketplace data…</p> : (
              <>
                {(activeTab === 'overview' || activeTab === 'listings') && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Your listings</h2>
                    {listings.length === 0 ? <p className="py-8 text-center text-gray-500">No listings yet. Create your first listing to get started.</p> : (
                      <div className="divide-y divide-gray-100">
                        {listings.map((item) => (
                          <div key={item.id} className="py-4 flex flex-wrap justify-between gap-3">
                            <div><p className="font-semibold text-gray-900">{item.title}</p><p className="text-sm text-gray-500">{item.is_auction ? 'Auction' : 'Fixed price'} · {new Date(item.created_at).toLocaleDateString('en-PK')}</p></div>
                            <div className="text-right"><p className="font-semibold">Rs. {Number(item.price).toLocaleString()}</p><span className="text-sm capitalize text-gray-600">{item.status}</span></div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'auctions' && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Your auctions</h2>
                    {auctions.length === 0 ? <p className="py-8 text-center text-gray-500">No auctions created yet.</p> : auctions.map((auction) => (
                      <a key={auction.id} href={`/auction?id=${auction.id}`} className="block py-4 border-b border-gray-100 hover:bg-gray-50">
                        <p className="font-semibold">{auction.product?.title || 'Auction listing'}</p>
                        <p className="text-sm text-gray-600">Current bid Rs. {Number(auction.current_bid || auction.starting_price).toLocaleString()} · {auction.total_bids} bids · ends {new Date(auction.end_time).toLocaleString('en-PK')}</p>
                      </a>
                    ))}
                  </div>
                )}
                {activeTab === 'orders' && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Incoming orders</h2>
                    {orders.length === 0 ? <p className="py-8 text-center text-gray-500">No orders yet.</p> : orders.map((order) => (
                      <div key={order.id} className="py-4 border-b border-gray-100 flex justify-between gap-3">
                        <div><p className="font-semibold">{order.product?.title || 'Product unavailable'}</p><p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('en-PK')}</p></div>
                        <div className="text-right"><p className="font-semibold">Rs. {Number(order.amount).toLocaleString()}</p><p className="text-sm capitalize text-gray-600">{order.order_status}</p></div>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === 'overview' && (
                  <div className="mt-8 flex flex-wrap gap-3">
                    <a className="btn-secondary px-4 py-2" href="/orders">Manage orders</a>
                    <a className="btn-secondary px-4 py-2" href="/messages">Open messages</a>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
