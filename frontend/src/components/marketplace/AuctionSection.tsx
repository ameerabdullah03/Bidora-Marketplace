import { Clock, TrendingUp, Users } from 'lucide-react'

interface Auction {
  id: string
  name: string
  image: string
  currentBid: number
  startingPrice: number
  bids: number
  timeLeft: string
  seller: string
  condition: string
}

export default function AuctionSection() {
  const auctions: Auction[] = [
    {
      id: '1',
      name: 'iPhone 14 Pro (Mint Condition)',
      image: '📱',
      currentBid: 95000,
      startingPrice: 80000,
      bids: 24,
      timeLeft: '2h 34m',
      seller: 'Certified Seller',
      condition: 'Like New'
    },
    {
      id: '2',
      name: 'MacBook Air M2 13"',
      image: '💻',
      currentBid: 225000,
      startingPrice: 200000,
      bids: 18,
      timeLeft: '5h 12m',
      seller: 'Premium Tech',
      condition: 'Excellent'
    },
    {
      id: '3',
      name: 'Canon EOS R5',
      image: '📷',
      currentBid: 450000,
      startingPrice: 420000,
      bids: 31,
      timeLeft: '8h 45m',
      seller: 'Photography Hub',
      condition: 'Very Good'
    },
    {
      id: '4',
      name: 'Sony A7IV Camera',
      image: '📷',
      currentBid: 380000,
      startingPrice: 350000,
      bids: 22,
      timeLeft: '12h 20m',
      seller: 'Photo Experts',
      condition: 'Like New'
    }
  ]

  return (
    <section className="section-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-dark-900 mb-2">Live Auctions</h2>
          <p className="text-dark-600">Bid on exclusive electronics at competitive prices</p>
        </div>
        <button className="btn-primary hidden md:block">
          View All Auctions
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {auctions.map((auction) => (
          <div key={auction.id} className="card !p-0 overflow-hidden hover:shadow-xl transition-all duration-200 group cursor-pointer border-2 border-primary-200">
            {/* Auction Badge */}
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10 flex items-center gap-1">
              <TrendingUp size={12} />
              LIVE
            </div>

            {/* Product Image */}
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-8 flex items-center justify-center h-40 relative overflow-hidden group-hover:scale-105 transition-transform">
              <span className="text-5xl">{auction.image}</span>
            </div>

            {/* Auction Info */}
            <div className="p-4">
              <h3 className="font-semibold text-dark-900 mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">
                {auction.name}
              </h3>

              {/* Condition Badge */}
              <div className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded mb-3">
                {auction.condition}
              </div>

              {/* Current Bid */}
              <div className="mb-3 pb-3 border-b border-gray-200">
                <p className="text-xs text-dark-500 mb-1">Current Bid</p>
                <p className="text-xl font-bold text-primary-600">
                  Rs. {auction.currentBid.toLocaleString()}
                </p>
                <p className="text-xs text-dark-500 mt-1">
                  Starting: Rs. {auction.startingPrice.toLocaleString()}
                </p>
              </div>

              {/* Bids and Time */}
              <div className="flex justify-between items-center mb-4 text-xs">
                <div className="flex items-center gap-1 text-dark-600">
                  <Users size={14} />
                  <span>{auction.bids} bids</span>
                </div>
                <div className="flex items-center gap-1 text-red-600 font-semibold">
                  <Clock size={14} />
                  <span>{auction.timeLeft}</span>
                </div>
              </div>

              {/* Seller */}
              <p className="text-xs text-dark-500 mb-4">by {auction.seller}</p>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button className="flex-1 btn-secondary text-sm py-2 px-3">
                  View
                </button>
                <button className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg text-sm py-2 px-3 transition-colors">
                  Bid Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8 md:hidden">
        <button className="btn-primary px-8 py-3">
          View All Auctions
        </button>
      </div>
    </section>
  )
}
