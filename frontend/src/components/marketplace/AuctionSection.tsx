import { useState, useEffect } from 'react'
import { Clock, TrendingUp, Users } from 'lucide-react'
import { supabase } from '../../services/supabase'

interface Auction {
  id: string
  title: string
  current_bid: number
  starting_price: number
  bid_count: number
  end_time: string
  condition: string
}

export default function AuctionSection() {
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchAuctions()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      updateTimeRemaining()
    }, 1000)
    return () => clearInterval(timer)
  }, [auctions])

  const fetchAuctions = async () => {
    try {
      const { data, error } = await supabase
        .from('auctions')
        .select('id, title, current_bid, starting_price, bid_count, end_time, condition')
        .eq('status', 'active')
        .order('end_time', { ascending: true })
        .limit(4)

      if (error) throw error
      setAuctions(data || [])
    } catch (err) {
      console.error('Error fetching auctions:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateTimeRemaining = () => {
    const remaining: Record<string, string> = {}
    const now = new Date().getTime()

    auctions.forEach(auction => {
      const endTime = new Date(auction.end_time).getTime()
      const diff = endTime - now

      if (diff <= 0) {
        remaining[auction.id] = 'Ended'
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        remaining[auction.id] = `${hours}h ${minutes}m`
      }
    })

    setTimeRemaining(remaining)
  }

  if (loading) {
    return (
      <section className="section-container">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Live Auctions</h2>
        <p className="text-gray-600 mb-12">Loading auctions...</p>
      </section>
    )
  }

  return (
    <section className="section-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Live Auctions</h2>
          <p className="text-gray-600">Bid on exclusive electronics at competitive prices</p>
        </div>
        <button
          onClick={() => window.location.href = '/search?type=auction'}
          className="btn-primary hidden md:block"
        >
          View All Auctions
        </button>
      </div>

      {auctions.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          <p>No active auctions right now. Check back soon!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {auctions.map((auction) => (
              <div key={auction.id} className="card !p-0 overflow-hidden hover:shadow-xl transition-all duration-200 group cursor-pointer border-2 border-teal-200">
                {/* Auction Badge */}
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10 flex items-center gap-1">
                  <TrendingUp size={12} />
                  LIVE
                </div>

                {/* Product Image */}
                <div className="bg-gradient-to-br from-teal-100 to-teal-200 p-8 flex items-center justify-center h-40 relative overflow-hidden group-hover:scale-105 transition-transform">
                  <span className="text-gray-400">Image</span>
                </div>

                {/* Auction Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
                    {auction.title}
                  </h3>

                  {/* Condition Badge */}
                  <div className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded mb-3 capitalize">
                    {auction.condition}
                  </div>

                  {/* Current Bid */}
                  <div className="mb-3 pb-3 border-b border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Current Bid</p>
                    <p className="text-xl font-bold text-teal-600">
                      Rs. {auction.current_bid.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Starting: Rs. {auction.starting_price.toLocaleString()}
                    </p>
                  </div>

                  {/* Bids and Time */}
                  <div className="flex justify-between items-center mb-4 text-xs">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users size={14} />
                      <span>{auction.bid_count} bids</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-600 font-semibold">
                      <Clock size={14} />
                      <span>{timeRemaining[auction.id] || 'Calculating...'}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.location.href = `/auction?id=${auction.id}`}
                      className="flex-1 btn-secondary text-sm py-2 px-3"
                    >
                      View
                    </button>
                    <button
                      onClick={() => window.location.href = `/auction?id=${auction.id}`}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg text-sm py-2 px-3 transition-colors"
                    >
                      Bid Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <button
              onClick={() => window.location.href = '/search?type=auction'}
              className="btn-primary px-8 py-3"
            >
              View All Auctions
            </button>
          </div>
        </>
      )}
    </section>
  )
}
