import { useState, useEffect } from 'react'
import { Check, X, Truck, Package } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../hooks/useAuth'
import ConfirmationDialog from '../../components/shared/ConfirmationDialog'

interface Order {
  id: string
  product_id: string
  product_title: string
  buyer_id: string
  seller_id: string
  seller_name: string
  price: number
  quantity: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  payment_method: string
  payment_status: 'pending' | 'completed' | 'failed'
  delivery_address: string
  tracking_number: string | null
  created_at: string
  updated_at: string
}

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'shipped' | 'delivered'>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [trackingDrafts, setTrackingDrafts] = useState<Record<string, string>>({})
  const [actionError, setActionError] = useState('')
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    void fetchOrders()
  }, [user?.id, filter])

  const fetchOrders = async () => {
    if (!user) return
    try {
      let query = supabase
        .from('orders')
        .select('*, product:products!orders_product_id_fkey(title), seller:public_profiles!orders_seller_id_fkey(full_name)')
        .or(`buyer_id.eq.${user?.id},seller_id.eq.${user?.id}`)

      if (filter !== 'all') {
        query = query.eq('order_status', filter)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      setOrders((data || []).map((order: any) => ({
        ...order,
        price: Number(order.amount),
        status: order.order_status,
        product_title: order.product?.title || 'Product unavailable',
        seller_name: order.seller?.full_name || 'Seller',
      })))
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const advanceOrder = async (order: Order, nextStatus: 'confirmed' | 'shipped' | 'delivered' | 'cancelled') => {
    setActionError('')
    const trackingNumber = trackingDrafts[order.id]?.trim()
    if (nextStatus === 'shipped' && !trackingNumber) {
      setActionError(`Add tracking details before shipping order ${order.id}.`)
      return
    }
    const { error } = await supabase.rpc('advance_order_status', {
      p_order_id: order.id,
      p_new_status: nextStatus,
      p_tracking_number: nextStatus === 'shipped' ? trackingNumber : null,
    })
    if (error) {
      setActionError(error.message)
      return
    }
    await fetchOrders()
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700'
      case 'confirmed':
        return 'bg-blue-50 border-blue-200 text-blue-700'
      case 'shipped':
        return 'bg-bidora-paper border-bidora-ink/20 text-bidora-ink'
      case 'delivered':
        return 'bg-green-50 border-green-200 text-green-700'
      case 'cancelled':
        return 'bg-red-50 border-red-200 text-red-700'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700'
    }
  }

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Package size={20} />
      case 'confirmed':
        return <Check size={20} />
      case 'shipped':
        return <Truck size={20} />
      case 'delivered':
        return <Check size={20} />
      case 'cancelled':
        return <X size={20} />
      default:
        return <Package size={20} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your purchases and sales</p>
        </div>
        {actionError && <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{actionError}</div>}

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {(['all', 'pending', 'confirmed', 'shipped', 'delivered'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-teal-600'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{order.product_title}</h3>
                      <p className="text-sm text-gray-600">Order ID: {order.id}</p>
                    </div>
                    <div className={`p-3 rounded-lg border ${getStatusColor(order.status)} flex items-center gap-2`}>
                      {getStatusIcon(order.status)}
                      <span className="font-semibold">
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Seller</p>
                      <p className="font-semibold text-gray-900">{order.seller_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Price</p>
                      <p className="font-semibold text-gray-900">Rs. {order.price.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="font-semibold text-gray-900">{order.payment_method}</p>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="mb-4 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600 mb-1">Delivery Address</p>
                    <p className="text-gray-900">{order.delivery_address}</p>
                    {order.tracking_number && <p className="mt-2 text-sm text-teal-700">Tracking: {order.tracking_number}</p>}
                  </div>

                  {/* Timeline */}
                  <div className="mb-4 flex items-center gap-2">
                    <span className="text-xs text-gray-600">Ordered</span>
                    <span className="text-xs text-gray-600">{new Date(order.created_at).toLocaleDateString()}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-600">
                      Payment: <span className={order.payment_status === 'completed' ? 'text-green-600' : 'text-yellow-600'}>
                        {order.payment_status}
                      </span>
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors font-medium"
                    >
                      View Details
                    </button>
                    {order.seller_id === user?.id && order.status === 'pending' && (
                      <button onClick={() => advanceOrder(order, 'confirmed')} className="flex-1 px-4 py-2 border border-teal-600 text-teal-700 rounded-lg hover:bg-teal-50 font-medium">Confirm order</button>
                    )}
                    {order.seller_id === user?.id && order.status === 'confirmed' && (
                      <div className="flex flex-1 gap-2">
                        <input aria-label="Tracking details" value={trackingDrafts[order.id] || ''} onChange={(e) => setTrackingDrafts({ ...trackingDrafts, [order.id]: e.target.value })} placeholder="Tracking number" className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3" />
                        <button onClick={() => advanceOrder(order, 'shipped')} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium">Mark shipped</button>
                      </div>
                    )}
                    {order.buyer_id === user?.id && order.status === 'shipped' && (
                      <button onClick={() => advanceOrder(order, 'delivered')} className="flex-1 px-4 py-2 border border-green-600 text-green-700 rounded-lg hover:bg-green-50 font-medium">Confirm delivery</button>
                    )}
                    {(order.status === 'pending') && (
                      <button onClick={() => setCancelTarget(order)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Product</p>
                    <p className="font-semibold text-gray-900">{selectedOrder.product_title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="font-semibold text-gray-900">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Seller</p>
                    <p className="font-semibold text-gray-900">{selectedOrder.seller_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-semibold text-gray-900 capitalize">{selectedOrder.status}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Price Breakdown</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Product Price</span>
                      <span className="font-semibold">Rs. {selectedOrder.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-semibold">Rs. 0</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-teal-600">Rs. {selectedOrder.price.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Payment Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Method</span>
                      <span className="font-semibold">{selectedOrder.payment_method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status</span>
                      <span className={`font-semibold ${selectedOrder.payment_status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {selectedOrder.payment_status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Delivery Address</h3>
                  <p className="text-gray-700">{selectedOrder.delivery_address}</p>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors font-medium">
                  Track Order
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {cancelTarget && <ConfirmationDialog
        title="Cancel this order?"
        description={`Cancel the order for ${cancelTarget.product_title}? This cannot be undone.`}
        confirmText="Cancel order"
        danger
        onClose={() => setCancelTarget(null)}
        onConfirm={async () => { await advanceOrder(cancelTarget, 'cancelled'); setCancelTarget(null) }}
      />}
    </div>
  )
}
