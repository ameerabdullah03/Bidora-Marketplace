import { useState, useEffect } from 'react'
import { Heart, Share2, Clock, Gavel } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../hooks/useAuth'

interface Auction {
  id: string
  product_id: string
  title: string
  current_bid: number
  starting_price: number
  reserve_price: number
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
        .select('*')
        .eq('id', auctionId)
        .single()

      if (auctionError) throw auctionError
      setAuction(data)

      // Fetch bid history with bidder names
      const { data: bids, error: bidsError } = await supabase
        .from('bids')
        .select(`
          id,
          bidder_id,
          amount,
          created_at,
          profiles!bidder_id(full_name)
        `)
        .eq('auction_id', auctionId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (bidsError) throw bidsError
      const mappedBids = (bids || []).map(bid => ({
        ...bid,
        bidder_name: (bid.profiles as any)?.full_name || 'Anonymous'
      }))
      setBidHistory(mappedBids)
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
    const minBid = auction.current_bid + 1000 // Minimum increment of 1000 PKR

    if (bid < minBid) {
      setError(`Minimum bid is Rs. ${minBid.toLocaleString()}`)
      return
    }

    if (bid.toString() === auction.highest_bidder_id) {
      setError('You are already the highest bidder')
      return
    }

    try {
      // Place bid
      const { error: bidError } = await supabase.from('bids').insert({
        auction_id: auctionId,
        bidder_id: user.id,
        amount: bid,
      })

      if (bidError) throw bidError

      // Update auction with new highest bid
      const { error: updateError } = await supabase
        .from('auctions')
        .update({
          current_bid: bid,
          highest_bidder_id: user.id,
          bid_count: (auction.bid_count || 0) + 1,
        })
        .eq('id', auctionId)

      if (updateError) throw updateError

      setBidAmount('')
      setError('')
      fetchAuction()
    } catch (err) {
      console.error('Error placing bid:', err)
      setError('Failed to place bid. Please try again.')
    }
  }

  if (loading) return <div className="text-center py-12">Loading auction...</div>
  if (!auction) return <div className="text-center py-12">Auction not found</div>

  const isAuctionEnded = new Date(auction.end_time) < new Date()
  const isHighestBidder = auction.highest_bidder_id === user?.id

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Product Image */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="bg-gradient-to-br from-gray-200 to-gray-300 aspect-square rounded-lg flex items-center justify-center text-gray-500 mb-4">
                <Gavel size={64} />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{auction.title}</h1>

              {/* Auction Status */}
              <div className={`p-4 rounded-lg mb-6 ${isAuctionEnded ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                <p className="text-sm font-semibold mb-2">
                  {isAuctionEnded ? '❌ Auction Ended' : '🔴 Live Auction'}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">Rs. {auction.current_bid.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Current bid</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                      <Clock size={24} />
                      {timeLeft}
                    </div>
                    <p className="text-sm text-gray-600">Time remaining</p>
                  </div>
                </div>
              </div>

              {/* Bid Info */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Starting Price</p>
                  <p className="text-xl font-bold text-gray-900">Rs. {auction.starting_price.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Reserve Price</p>
                  <p className="text-xl font-bold text-gray-900">Rs. {auction.reserve_price.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Bids</p>
                  <p className="text-xl font-bold text-gray-900">{auction.bid_count}</p>
                </div>
              </div>

              {/* Highest Bidder Info */}
              {auction.highest_bidder_id && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Highest Bidder</p>
                  <p className="text-lg text-gray-900">
                    {isHighestBidder ? 'You are the highest bidder! 🎉' : auction.highest_bidder_name}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bidding Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              {/* Seller Info */}
              <div className="border-b pb-6">
                <p className="text-sm text-gray-600 mb-2">Seller</p>
                <p className="font-semibold text-gray-900">{auction.seller_name}</p>
              </div>

              {/* Bid Input */}
              {!isAuctionEnded ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Your Bid</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-600 font-semibold">Rs.</span>
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={`Min: ${(auction.current_bid + 1000).toLocaleString()}`}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Minimum increment: Rs. 1,000
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 p-3 rounded text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleBid}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Gavel size={20} />
                    Place Bid
                  </button>
                </>
              ) : (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-center">
                  <p className="text-sm font-semibold text-red-700">This auction has ended</p>
                  {isHighestBidder && (
                    <p className="text-sm text-red-600 mt-2">Congratulations! You won this auction! 🎉</p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Heart size={18} />
                  Save
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 size={18} />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bid History */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Bid History</h2>
          {bidHistory.length === 0 ? (
            <p className="text-center text-gray-600 py-8">No bids yet</p>
          ) : (
            <div className="space-y-4">
              {bidHistory.map((bid) => (
                <div key={bid.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                  <div>
                    <p className="font-semibold text-gray-900">{bid.bidder_name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(bid.created_at).toLocaleString()}
                    </p>
                  </div>
                  <p className="font-bold text-teal-600">Rs. {bid.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
