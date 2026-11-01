import { useState } from 'react'
import { CreditCard, Smartphone, Truck, Check, ChevronRight } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../hooks/useAuth'

interface CheckoutData {
  productId: string
  productTitle: string
  price: number
  sellerId: string
  sellerName: string
  quantity: number
}

export default function Checkout({ checkoutData }: { checkoutData?: CheckoutData }) {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [orderCreated, setOrderCreated] = useState(false)
  const [orderId, setOrderId] = useState('')

  const totalPrice = checkoutData?.price || 0

  const handlePlaceOrder = async () => {
    if (!deliveryAddress) {
      alert('Please enter delivery address')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          product_id: checkoutData?.productId,
          buyer_id: user?.id,
          seller_id: checkoutData?.sellerId,
          price: checkoutData?.price,
          quantity: checkoutData?.quantity || 1,
          status: paymentMethod === 'cod' ? 'pending' : 'pending',
          payment_method: paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod,
          payment_status: paymentMethod === 'cod' ? 'pending' : 'pending',
          delivery_address: deliveryAddress,
        })
        .select()

      if (error) throw error

      setOrderId(data[0].id)
      setOrderCreated(true)
    } catch (err) {
      console.error('Error creating order:', err)
      alert('Failed to create order')
    } finally {
      setLoading(false)
    }
  }

  if (orderCreated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-4">Thank you for your purchase</p>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="font-mono font-semibold text-gray-900 break-all">{orderId}</p>
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Check size={16} className="text-green-600" />
              <span>Order confirmed</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Truck size={16} className="text-teal-600" />
              <span>Seller will prepare your order</span>
            </div>
          </div>

          <button className="w-full btn-primary py-2">Continue Shopping</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-between">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                s < step ? 'bg-green-600 text-white' :
                s === step ? 'bg-teal-600 text-white' :
                'bg-gray-300 text-gray-600'
              }`}>
                {s < step ? <Check size={20} /> : s}
              </div>
              <div className={`flex-1 h-1 mx-2 ${s < step ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            </div>
          ))}
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold bg-gray-300 text-gray-600">3</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            {/* Step 1: Delivery Address */}
            {step === 1 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Delivery Address</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Full Address</label>
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter your complete delivery address"
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                  >
                    Continue to Payment
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Method</h2>

                <div className="space-y-3">
                  {/* Cash on Delivery */}
                  <label className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-teal-600 bg-teal-50'
                      : 'border-gray-300 hover:border-teal-300'
                  }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-teal-600"
                      />
                      <Truck size={24} className="text-teal-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Cash on Delivery</p>
                        <p className="text-sm text-gray-600">Pay when you receive your order</p>
                      </div>
                    </div>
                  </label>

                  {/* JazzCash */}
                  <label className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'jazzcash'
                      ? 'border-teal-600 bg-teal-50'
                      : 'border-gray-300 hover:border-teal-300'
                  }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value="jazzcash"
                        checked={paymentMethod === 'jazzcash'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-teal-600"
                      />
                      <Smartphone size={24} className="text-purple-600" />
                      <div>
                        <p className="font-semibold text-gray-900">JazzCash</p>
                        <p className="text-sm text-gray-600">Pay securely via JazzCash</p>
                      </div>
                    </div>
                  </label>

                  {/* EasyPaisa */}
                  <label className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'easypaisa'
                      ? 'border-teal-600 bg-teal-50'
                      : 'border-gray-300 hover:border-teal-300'
                  }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value="easypaisa"
                        checked={paymentMethod === 'easypaisa'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-teal-600"
                      />
                      <Smartphone size={24} className="text-orange-600" />
                      <div>
                        <p className="font-semibold text-gray-900">EasyPaisa</p>
                        <p className="text-sm text-gray-600">Pay securely via EasyPaisa</p>
                      </div>
                    </div>
                  </label>

                  {/* Credit Card */}
                  <label className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'border-teal-600 bg-teal-50'
                      : 'border-gray-300 hover:border-teal-300'
                  }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-teal-600"
                      />
                      <CreditCard size={24} className="text-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Credit/Debit Card</p>
                        <p className="text-sm text-gray-600">Pay with your card</p>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
                  >
                    Continue to Review
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review & Confirm */}
            {step === 3 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Order</h2>

                <div className="space-y-6 mb-6">
                  {/* Delivery Address */}
                  <div className="pb-6 border-b">
                    <h3 className="font-semibold text-gray-900 mb-2">Delivery Address</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{deliveryAddress}</p>
                  </div>

                  {/* Payment Method */}
                  <div className="pb-6 border-b">
                    <h3 className="font-semibold text-gray-900 mb-2">Payment Method</h3>
                    <p className="text-gray-700">
                      {paymentMethod === 'cod' ? 'Cash on Delivery' :
                       paymentMethod === 'jazzcash' ? 'JazzCash' :
                       paymentMethod === 'easypaisa' ? 'EasyPaisa' :
                       'Credit/Debit Card'}
                    </p>
                  </div>

                  {/* Product */}
                  <div className="pb-6 border-b">
                    <h3 className="font-semibold text-gray-900 mb-2">Product</h3>
                    <p className="text-gray-900">{checkoutData?.productTitle}</p>
                    <p className="text-sm text-gray-600 mt-1">Seller: {checkoutData?.sellerName}</p>
                  </div>

                  {/* Terms */}
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 text-teal-600 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      I agree to the <a href="#" className="text-teal-600 hover:underline">Terms of Service</a> and <a href="#" className="text-teal-600 hover:underline">Privacy Policy</a>
                    </span>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

              <div className="space-y-4 mb-6 pb-6 border-b">
                <div className="flex justify-between">
                  <span className="text-gray-600">{checkoutData?.productTitle}</span>
                  <span className="font-semibold">Rs. {totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">Rs. {totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">Rs. 0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxes</span>
                  <span className="font-semibold">Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between mb-4">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-teal-600">Rs. {totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 p-3 rounded text-xs text-blue-700">
                ✓ Secure checkout • 100% buyer protection
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
