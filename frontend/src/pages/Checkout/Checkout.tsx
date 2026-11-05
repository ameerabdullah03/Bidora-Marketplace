import { useEffect, useState } from 'react'
import { CreditCard, Smartphone, Truck, Check, ChevronRight, AlertCircle, Package } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../hooks/useAuth'

interface CheckoutData {
  productId: string
  productTitle: string
  price: number
  sellerId: string
  sellerName: string
  quantity: number
  auctionId?: string
}

export default function Checkout({ checkoutData: initialCheckoutData, productId, auctionId }: { checkoutData?: CheckoutData; productId?: string; auctionId?: string }) {
  const { user } = useAuth()
  const [loadedCheckoutData, setLoadedCheckoutData] = useState<CheckoutData | undefined>()
  const [productLoading, setProductLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [orderAcknowledged, setOrderAcknowledged] = useState(false)
  const [loading, setLoading] = useState(false)
  const [orderCreated, setOrderCreated] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [error, setError] = useState('')

  const checkoutData = initialCheckoutData || loadedCheckoutData

  useEffect(() => {
    if ((!productId && !auctionId) || initialCheckoutData) return
    let cancelled = false
    setProductLoading(true)
    void (async () => {
      try {
        let data: any
        let productError: unknown
        if (auctionId) {
          const result = await supabase
            .from('auctions')
            .select('id, current_bid, starting_price, end_time, winner_id, product:products!auctions_product_id_fkey(id, title, seller_id, status, seller:public_profiles!products_seller_id_fkey(full_name))')
            .eq('id', auctionId)
            .single()
          data = result.data
          productError = result.error
        } else {
          const result = await supabase
            .from('products')
            .select('id, title, price, seller_id, seller:public_profiles!products_seller_id_fkey(full_name)')
            .eq('id', productId!)
            .eq('status', 'approved')
            .eq('is_auction', false)
            .single()
          data = result.data
          productError = result.error
        }
        if (cancelled) return
        if (productError || !data) {
          setError('This product is unavailable for purchase.')
          return
        }
        const product = auctionId ? (data.product as any) : data
        if (!product || product.status === 'pending' || product.status === 'rejected' || (auctionId && (data.winner_id !== user?.id || new Date(data.end_time) > new Date()))) {
          setError('This auction checkout is only available to its winner after it ends.')
          return
        }
        setLoadedCheckoutData({
          productId: product.id,
          productTitle: product.title,
          price: Number(auctionId ? (data.current_bid || data.starting_price) : product.price),
          sellerId: product.seller_id,
          sellerName: (product.seller as any)?.full_name || 'Seller',
          quantity: 1,
          auctionId,
        })
      } finally {
        if (!cancelled) setProductLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [productId, auctionId, user?.id, initialCheckoutData])

  const totalPrice = checkoutData?.price || 0

  const handlePlaceOrder = async () => {
    setError('')
    if (!user) {
      setError('Sign in before placing an order.')
      return
    }
    if (!checkoutData?.productId || !checkoutData.sellerId || !checkoutData.price) {
      setError('Choose a product from its listing before checking out.')
      return
    }
    if (!deliveryAddress.trim()) {
      setError('Please enter a delivery address')
      return
    }
    if (!orderAcknowledged) {
      setError('Please confirm the cash-on-delivery details before placing your order.')
      return
    }

    setLoading(true)
    try {
      if (paymentMethod !== 'cod') throw new Error('This payment method is not available yet.')
      const { data, error: insertError } = checkoutData.auctionId
        ? await supabase.rpc('place_auction_order', {
          p_auction_id: checkoutData.auctionId,
          p_delivery_address: deliveryAddress,
        })
        : await supabase.rpc('place_product_order', {
          p_product_id: checkoutData.productId,
          p_delivery_address: deliveryAddress,
        })

      if (insertError) throw insertError
      if (!data) throw new Error('Order limit reached. Please wait before placing another order.')

      setOrderId(data)
      setOrderCreated(true)
    } catch (err) {
      console.error('Error creating order:', err)
      setError(err instanceof Error && err.message.includes('limit reached')
        ? err.message
        : 'Failed to create order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (productLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading product…</div>
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  if (orderCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center border border-gray-100"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check size={32} className="text-green-600" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-6">Thank you for your purchase. Your seller will prepare your order shortly.</p>

          <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-xl mb-6 border border-gray-200">
            <p className="text-xs text-gray-600 mb-1 font-semibold uppercase tracking-wide">Order ID</p>
            <p className="font-mono font-bold text-gray-900 break-all text-sm">{orderId}</p>
          </div>

          <div className="space-y-3 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 text-sm text-gray-700 bg-green-50 p-3 rounded-lg"
            >
              <Check size={18} className="text-green-600 flex-shrink-0" />
              <span>Order confirmed</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 text-sm text-gray-700 bg-blue-50 p-3 rounded-lg"
            >
              <Truck size={18} className="text-teal-600 flex-shrink-0" />
              <span>Seller will prepare your order</span>
            </motion.div>
          </div>

          <div className="space-y-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.href = '/'}
              className="w-full bg-bidora-ink text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Continue Shopping
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.href = `/orders`}
              className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all"
            >
              View Orders
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Secure Checkout</h1>
          <p className="text-gray-600">Complete your purchase in 3 simple steps</p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <motion.div
                  animate={{
                    backgroundColor: s < step ? '#10b981' : s === step ? '#0891b2' : '#e5e7eb',
                  }}
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-md transition-all"
                >
                  {s < step ? <Check size={24} /> : s}
                </motion.div>
                {s < 3 && (
                  <motion.div
                    animate={{
                      backgroundColor: s < step ? '#10b981' : '#e5e7eb',
                    }}
                    className="flex-1 h-1 mx-3 transition-colors"
                  ></motion.div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs font-semibold text-gray-600 mt-4">
            <span>Delivery</span>
            <span>Payment</span>
            <span>Review</span>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2"
          >
            {/* Step 1: Delivery Address */}
            {step === 1 && (
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-md p-8 border border-gray-100"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Truck size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Delivery Address</h2>
                    <p className="text-sm text-gray-600">Where should we deliver your order?</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Full Address
                    </label>
                    <motion.textarea
                      whileFocus={{ scale: 1.01 }}
                      value={deliveryAddress}
                      onChange={(e) => {
                        setDeliveryAddress(e.target.value)
                        setError('')
                      }}
                      placeholder="Enter your complete delivery address (street, apartment/unit, city, postal code)"
                      rows={5}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-2">Include building name, flat number, and street address</p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{error}</p>
                    </motion.div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (deliveryAddress.trim()) {
                        setStep(2)
                        setError('')
                      } else {
                        setError('Please enter a delivery address')
                      }
                    }}
                    className="w-full py-4 bg-bidora-ink text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    Continue to Payment
                    <ChevronRight size={20} />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-md p-8 border border-gray-100"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-bidora-paper rounded-lg">
                    <CreditCard size={24} className="text-bidora-ink" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
                    <p className="text-sm text-gray-600">Choose how you'd like to pay</p>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {/* Cash on Delivery */}
                  <motion.label
                    whileHover={{ scale: 1.01 }}
                    className={`p-5 border-2 rounded-xl cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-teal-500 bg-gradient-to-r from-teal-50 to-cyan-50'
                        : 'border-gray-200 hover:border-teal-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        <input
                          type="radio"
                          name="payment"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={(e) => {
                            setPaymentMethod(e.target.value)
                            setError('')
                          }}
                          className="w-5 h-5 text-teal-600 cursor-pointer"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Truck size={20} className="text-teal-600" />
                          <p className="font-bold text-gray-900">Cash on Delivery</p>
                        </div>
                        <p className="text-sm text-gray-600">Pay in cash when your order arrives</p>
                      </div>
                    </div>
                  </motion.label>

                  {/* JazzCash */}
                  <motion.label
                    whileHover={{ scale: 1.01 }}
                    className={`p-5 border-2 rounded-xl cursor-pointer transition-all ${
                      paymentMethod === 'jazzcash'
                        ? 'border-bidora-ink bg-bidora-paper'
                        : 'border-gray-200 hover:border-bidora-ink/20 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        <input
                          type="radio"
                          name="payment"
                          value="jazzcash"
                          disabled
                          checked={paymentMethod === 'jazzcash'}
                          onChange={(e) => {
                            setPaymentMethod(e.target.value)
                            setError('')
                          }}
                          className="w-5 h-5 text-bidora-ink cursor-pointer"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Smartphone size={20} className="text-bidora-ink" />
                          <p className="font-bold text-gray-900">JazzCash</p>
                        </div>
                        <p className="text-sm text-gray-600">Coming soon</p>
                      </div>
                    </div>
                  </motion.label>

                  {/* EasyPaisa */}
                  <motion.label
                    whileHover={{ scale: 1.01 }}
                    className={`p-5 border-2 rounded-xl cursor-not-allowed opacity-60 transition-all ${
                      paymentMethod === 'easypaisa'
                        ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-red-50'
                        : 'border-gray-200 hover:border-orange-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        <input
                          type="radio"
                          name="payment"
                          value="easypaisa"
                          disabled
                          checked={paymentMethod === 'easypaisa'}
                          onChange={(e) => {
                            setPaymentMethod(e.target.value)
                            setError('')
                          }}
                          className="w-5 h-5 text-orange-600 cursor-pointer"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Smartphone size={20} className="text-orange-600" />
                          <p className="font-bold text-gray-900">EasyPaisa</p>
                        </div>
                        <p className="text-sm text-gray-600">Coming soon</p>
                      </div>
                    </div>
                  </motion.label>

                  {/* Credit Card */}
                  <motion.label
                    whileHover={{ scale: 1.01 }}
                    className={`p-5 border-2 rounded-xl cursor-not-allowed opacity-60 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50'
                        : 'border-gray-200 hover:border-blue-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        <input
                          type="radio"
                          name="payment"
                          value="card"
                          disabled
                          checked={paymentMethod === 'card'}
                          onChange={(e) => {
                            setPaymentMethod(e.target.value)
                            setError('')
                          }}
                          className="w-5 h-5 text-blue-600 cursor-pointer"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard size={20} className="text-blue-600" />
                          <p className="font-bold text-gray-900">Credit/Debit Card</p>
                        </div>
                        <p className="text-sm text-gray-600">Coming soon</p>
                      </div>
                    </div>
                  </motion.label>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 border-2 border-gray-200 text-gray-900 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep(3)}
                    className="flex-1 py-3 bg-bidora-ink text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    Continue to Review
                    <ChevronRight size={20} />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review & Confirm */}
            {step === 3 && (
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-md p-8 border border-gray-100"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <Check size={24} className="text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Review Your Order</h2>
                    <p className="text-sm text-gray-600">Please verify all details before confirming</p>
                  </div>
                </div>

                <div className="space-y-6 mb-8">
                  {/* Delivery Address */}
                  <motion.div
                    variants={itemVariants}
                    className="pb-6 border-b-2 border-gray-100"
                  >
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Truck size={18} className="text-teal-600" />
                      Delivery Address
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap bg-slate-50 p-4 rounded-lg">
                      {deliveryAddress}
                    </p>
                  </motion.div>

                  {/* Payment Method */}
                  <motion.div
                    variants={itemVariants}
                    className="pb-6 border-b-2 border-gray-100"
                  >
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <CreditCard size={18} className="text-bidora-ink" />
                      Payment Method
                    </h3>
                    <p className="text-gray-700 font-semibold">
                      {paymentMethod === 'cod'
                        ? 'Cash on Delivery'
                        : paymentMethod === 'jazzcash'
                        ? 'JazzCash'
                        : paymentMethod === 'easypaisa'
                        ? 'EasyPaisa'
                        : 'Credit/Debit Card'}
                    </p>
                  </motion.div>

                  {/* Product */}
                  <motion.div
                    variants={itemVariants}
                    className="pb-6 border-b-2 border-gray-100"
                  >
                    <h3 className="font-bold text-gray-900 mb-3">Product</h3>
                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-lg border border-teal-100">
                      <p className="font-semibold text-gray-900">{checkoutData?.productTitle}</p>
                      <p className="text-sm text-gray-600 mt-1">Seller: {checkoutData?.sellerName}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Quantity: {checkoutData?.quantity || 1}
                      </p>
                    </div>
                  </motion.div>

                  {/* Cash-on-delivery acknowledgement */}
                  <motion.label
                    variants={itemVariants}
                    className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      checked={orderAcknowledged}
                      onChange={(event) => {
                        setOrderAcknowledged(event.target.checked)
                        setError('')
                      }}
                      className="mt-1.5 w-5 h-5 text-teal-600 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">I confirm this order and understand that payment is due in cash when the order is delivered.
                    </span>
                  </motion.label>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-6"
                  >
                    <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </motion.div>
                )}

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 border-2 border-gray-200 text-gray-900 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check size={20} />
                        Place Order
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Order Summary Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 sticky top-24 space-y-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center bg-bidora-ink text-white"><Package size={18} aria-hidden="true" /></span>
                Order Summary
              </h3>

              <div className="space-y-4 pb-6 border-b-2 border-gray-100">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Product</p>
                  <p className="font-semibold text-gray-900 line-clamp-2">
                    {checkoutData?.productTitle}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Qty: {checkoutData?.quantity || 1}
                  </span>
                  <span className="font-bold text-teal-600">
                    Rs. {totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    Rs. {totalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-gray-900">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxes</span>
                  <span className="text-xs text-gray-500 font-semibold">Included</span>
                </div>
              </div>

              <div className="border-t-2 border-gray-100 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    Rs. {totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Security Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded text-sm text-green-700"
              >
                <p className="font-semibold mb-1 flex items-center gap-2">
                  <Check size={16} />
                  100% Secure Checkout
                </p>
                <p className="text-xs opacity-90">
                  Your payment information is encrypted and protected
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
