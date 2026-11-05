import { useState, useEffect } from 'react'
import { Heart, Share2, Clock, Gavel, AlertCircle, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../hooks/useAuth'

interface Auction {
  id: string
  product_id: string
  title: string
  current_bid: number
  starting_price: number
  minimum_increment: number
  end_time: string
  seller_id: string
  seller_name: string
  bid_count: number
  highest_bidder_id: string | null
  highest_bidder_name: string | null
  status: string
}

interface BidHistory {
  id: string
  bidder_id: string
  bidder_name: string
  amount: number
  created_at: string
}

export default function AuctionDetail({ auctionId }: { auctionId: string }) {
  const { user } = useAuth()
  const [auction, setAuction] = useState<Auction | null>(null)
  const [bidHistory, setBidHistory] = useState<BidHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [bidAmount, setBidAmount] = useState('')
  const [timeLeft, setTimeLeft] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAuction()
  }, [auctionId])

  useEffect(() => {
    if (auction) {
      const interval = setInterval(updateTimeLeft, 1000)
      return () => clearInterval(interval)
    }
  }, [auction])

  const fetchAuction = async () => {
    try {
      const { data, error: auctionError } = await supabase
        .from('auctions')
        .select('*, product:products!auctions_product_id_fkey(title), seller:public_profiles!auctions_seller_id_fkey(full_name)')
        .eq('id', auctionId)
        .single()

      if (auctionError) throw auctionError
      const { data: bids, error: bidsError } = await supabase
        .from('bids')
        .select(`
          id,
          bidder_id,
          amount,
          created_at,
          bidder:public_profiles!bids_bidder_id_fkey(full_name)
        `)
        .eq('auction_id', auctionId)
        .order('amount', { ascending: false })
        .limit(20)

      if (bidsError) throw bidsError
      const mappedBids = (bids || []).map(bid => ({
        ...bid,
        bidder_name: (bid.bidder as any)?.full_name || 'Anonymous'
      }))
      setBidHistory(mappedBids)
      setAuction({
        ...data,
        current_bid: Number(data.total_bids > 0 ? data.current_bid : data.starting_price),
        title: (data.product as any)?.title || 'Auction listing',
        seller_name: (data.seller as any)?.full_name || 'Seller',
        bid_count: Number(data.total_bids || 0),
        highest_bidder_id: mappedBids[0]?.bidder_id || null,
        highest_bidder_name: mappedBids[0]?.bidder_name || null,
      })
    } catch (err) {
      console.error('Error fetching auction:', err)
      setError('Failed to load auction')
    } finally {
      setLoading(false)
    }
  }

  const updateTimeLeft = () => {
    if (!auction) return

    const now = new Date().getTime()
    const endTime = new Date(auction.end_time).getTime()
    const diff = endTime - now

    if (diff <= 0) {
      setTimeLeft('Ended')
      return
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    if (days > 0) {
      setTimeLeft(`${days}d ${hours}h`)
    } else if (hours > 0) {
      setTimeLeft(`${hours}h ${minutes}m`)
    } else {
      setTimeLeft(`${minutes}m ${seconds}s`)
    }
  }

  const handleBid = async () => {
    if (!bidAmount || !auction || !user) {
      setError('Please enter a valid bid amount')
      return
    }

    const bid = parseFloat(bidAmount)
    const minBid = auction.bid_count === 0 ? auction.starting_price : auction.current_bid + auction.minimum_increment

    if (bid < minBid) {
      setError(`Minimum bid is Rs. ${minBid.toLocaleString()}`)
      return
    }

    if (auction.highest_bidder_id === user.id) {
      setError('You are already the highest bidder')
      return
    }

    try {
      const { error: bidError } = await supabase.rpc('place_auction_bid', {
        p_auction_id: auctionId,
        p_amount: bid,
      })

      if (bidError) throw bidError

      setBidAmount('')
      setError('')
      fetchAuction()
    } catch (err) {
      console.error('Error placing bid:', err)
      setError('Failed to place bid. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading auction...</p>
        </motion.div>
      </div>
    )
  }

  if (!auction) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white p-12 rounded-2xl shadow-lg border border-gray-100"
        >
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <p className="text-gray-900 text-xl font-semibold">Auction not found</p>
        </motion.div>
      </div>
    )
  }

  const isAuctionEnded = new Date(auction.end_time) < new Date()
  const isHighestBidder = auction.highest_bidder_id === user?.id

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
              {/* Auction Image */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-orange-100 via-red-100 to-orange-200 aspect-square rounded-2xl flex items-center justify-center text-orange-400 mb-6 overflow-hidden"
              >
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }}>
                  <Gavel size={96} />
                </motion.div>
              </motion.div>

              {/* Title */}
              <h1 className="text-4xl font-bold text-gray-900 mb-6">{auction.title}</h1>

              {/* Auction Status */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-6 rounded-2xl mb-8 border-2 ${
                  isAuctionEnded
                    ? 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'
                    : 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    {isAuctionEnded ? (
                      <p className="text-sm font-bold text-red-700">❌ AUCTION ENDED</p>
                    ) : (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="flex items-center gap-2"
                      >
                        <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                        <p className="text-sm font-bold text-orange-700">🔴 LIVE AUCTION</p>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Current Bid</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      Rs. {auction.current_bid.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1 flex items-center justify-end gap-2">
                      <Clock size={16} />
                      Time Remaining
                    </p>
                    <p className="text-4xl font-bold text-gray-900">
                      {timeLeft}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Bid Stats */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-3 gap-4 mb-8"
              >
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-100"
                >
                  <p className="text-sm text-gray-600 mb-2">Starting Price</p>
                  <p className="text-2xl font-bold text-blue-600">
                    Rs. {auction.starting_price.toLocaleString()}
                  </p>
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100"
                >
                  <p className="text-sm text-gray-600 mb-2">Minimum Increment</p>
                  <p className="text-2xl font-bold text-purple-600">
                    Rs. {auction.minimum_increment.toLocaleString()}
                  </p>
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100"
                >
                  <p className="text-sm text-gray-600 mb-2">Total Bids</p>
                  <p className="text-2xl font-bold text-green-600">{auction.bid_count}</p>
                </motion.div>
              </motion.div>

              {/* Highest Bidder */}
              {auction.highest_bidder_id && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 p-6 rounded-2xl"
                >
                  <div className="flex items-start gap-3">
                    <TrendingUp size={24} className="text-yellow-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm font-bold text-yellow-700 mb-1">Highest Bidder</p>
                      <p className="text-xl font-bold text-gray-900">
                        {isHighestBidder ? '🎉 You are the highest bidder!' : auction.highest_bidder_name}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
              {isAuctionEnded && isHighestBidder && (
                <a href={`/checkout?auctionId=${auction.id}`} className="mt-4 block rounded-xl bg-green-600 px-6 py-3 text-center font-bold text-white hover:bg-green-700">
                  Complete winning purchase
                </a>
              )}
            </div>
          </motion.div>

          {/* Bidding Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 sticky top-24 space-y-6">
              {/* Seller Info */}
              <motion.div
                whileHover={{ y: -2 }}
                className="border-b-2 border-gray-100 pb-6"
              >
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Seller</p>
                <p className="text-lg font-bold text-gray-900">{auction.seller_name}</p>
              </motion.div>

              {/* Bid Input */}
              {!isAuctionEnded ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Your Bid Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-4 text-gray-600 font-bold">Rs.</span>
                      <motion.input
                        whileFocus={{ scale: 1.02 }}
                        type="number"
                        value={bidAmount}
                        onChange={(e) => {
                          setBidAmount(e.target.value)
                          setError('')
                        }}
                        placeholder={`Min: ${(auction.bid_count === 0 ? auction.starting_price : auction.current_bid + auction.minimum_increment).toLocaleString()}`}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Minimum increment: Rs. 1,000</p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-sm text-red-700"
                    >
                      {error}
                    </motion.div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBid}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-lg text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Gavel size={20} />
                    Place Bid Now
                  </motion.button>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 p-6 rounded-2xl text-center"
                >
                  <p className="text-sm font-bold text-red-700 mb-2">This auction has ended</p>
                  {isHighestBidder && (
                    <p className="text-sm font-semibold text-red-600">🎉 Congratulations! You won!</p>
                  )}
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  <Heart size={18} />
                  Save
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  <Share2 size={18} />
                  Share
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bid History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 mt-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Bid History</h2>
          {bidHistory.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 text-gray-500"
            >
              <AlertCircle size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No bids yet. Be the first to bid!</p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {bidHistory.map((bid, idx) => (
                <motion.div
                  key={bid.id}
                  variants={itemVariants}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-100"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{bid.bidder_name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(bid.created_at).toLocaleString('en-PK')}
                    </p>
                  </div>
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="text-right"
                  >
                    <p className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      Rs. {bid.amount.toLocaleString()}
                    </p>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
