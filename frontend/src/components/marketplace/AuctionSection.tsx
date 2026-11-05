import { useState, useEffect } from 'react'
import { Clock, TrendingUp, Users, Flame } from 'lucide-react'
import { motion } from 'framer-motion'
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
        .select('id, current_bid, starting_price, total_bids, end_time, product:products!auctions_product_id_fkey(title, condition)')
        .eq('status', 'active')
        .eq('product.status', 'approved')
        .gt('end_time', new Date().toISOString())
        .order('end_time', { ascending: true })
        .limit(4)

      if (error) throw error
      setAuctions((data || []).map((auction: any) => ({
        id: auction.id,
        title: auction.product?.title || 'Untitled auction',
        condition: auction.product?.condition || 'Used',
        current_bid: Number(auction.current_bid || auction.starting_price),
        starting_price: Number(auction.starting_price),
        bid_count: Number(auction.total_bids || 0),
        end_time: auction.end_time,
      })))
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Live Auctions</h2>
          <p className="text-gray-600 mb-12">Loading auctions...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-red-500 to-orange-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                animate={{ rotate: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Flame size={28} className="text-red-500" />
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-slate-700 bg-clip-text text-transparent">
                Live Auctions
              </h2>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl">
              Bid on exclusive electronics at competitive prices. Limited time offers!
            </p>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/search?type=auction'}
            className="hidden md:inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl hover:shadow-xl transition-all"
          >
            View All
            <TrendingUp size={18} />
          </motion.button>
        </div>

        {auctions.length === 0 ? (
          <div className="text-center py-16 text-gray-600 bg-white rounded-2xl">
            <p className="text-lg">No active auctions right now. Check back soon!</p>
          </div>
        ) : (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            >
              {auctions.map((auction) => (
                <motion.div
                  key={auction.id}
                  variants={itemVariants}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="group h-full"
                >
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col border border-gray-100 hover:border-red-200 relative">
                    {/* Live Badge */}
                    <motion.div
                      animate={{ scale: [1, 1.1, 1], boxShadow: ['0 0 0 0 rgba(239, 68, 68, 0.5)', '0 0 0 10px rgba(239, 68, 68, 0)'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 z-10"
                    >
                      <TrendingUp size={12} />
                      LIVE
                    </motion.div>

                    {/* Product Image Container */}
                    <div className="relative h-48 bg-gradient-to-br from-red-100 to-orange-100 overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl group-hover:scale-110 transition-transform duration-300">
                        📷
                      </div>

                      {/* Time Badge */}
                      <motion.div
                        animate={{ scale: timeRemaining[auction.id]?.includes('m') ? 1 : 1.05 }}
                        className="absolute bottom-3 right-3 bg-black/80 text-red-400 text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur-sm border border-red-500/50 flex items-center gap-1"
                      >
                        <Clock size={12} />
                        {timeRemaining[auction.id] || 'Calculating...'}
                      </motion.div>
                    </div>

                    {/* Auction Info */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <motion.h3 className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-red-600 transition-colors text-lg">
                          {auction.title}
                        </motion.h3>

                        {/* Condition Badge */}
                        <div className="inline-block bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs font-bold px-3 py-1 rounded-lg capitalize mb-4">
                          {auction.condition}
                        </div>

                        {/* Current Bid Section */}
                        <div className="space-y-2 mb-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl">
                          <p className="text-xs text-gray-600 font-semibold">CURRENT BID</p>
                          <motion.p
                            className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent"
                          >
                            Rs. {auction.current_bid.toLocaleString()}
                          </motion.p>
                          <p className="text-xs text-gray-600">
                            Starting: Rs. {auction.starting_price.toLocaleString()}
                          </p>
                        </div>

                        {/* Bid Count */}
                        <div className="flex items-center gap-2 text-sm text-gray-700 font-semibold">
                          <Users size={16} className="text-blue-500" />
                          <span>{auction.bid_count} active bids</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => window.location.href = `/auction?id=${auction.id}`}
                          className="flex-1 border-2 border-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg hover:border-red-500 hover:text-red-600 transition-all text-sm"
                        >
                          View
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => window.location.href = `/auction?id=${auction.id}`}
                          className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg transition-all text-sm"
                        >
                          Bid Now
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* View All Button - Mobile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-center md:hidden"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/search?type=auction'}
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl hover:shadow-xl transition-all"
              >
                View All Auctions
                <TrendingUp size={18} />
              </motion.button>
            </motion.div>
          </>
        )}
      </div>
    </section>
  )
}
