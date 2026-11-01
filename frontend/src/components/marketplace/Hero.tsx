import { ArrowRight, Zap } from 'lucide-react'

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-dark-900 via-primary-600 to-primary-500 text-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur">
              <Zap size={16} />
              <span className="text-sm font-semibold">Pakistan's Premier Electronics Marketplace</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Discover. Bid. Buy.
            </h2>

            <p className="text-lg text-white/80 leading-relaxed">
              The trusted marketplace for buying and selling electronics in Pakistan. Authentic products, fair prices, and secure transactions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                Start Shopping
                <ArrowRight size={18} />
              </button>
              <button className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors">
                Become a Seller
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-8 border-t border-white/20">
              <div>
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-sm text-white/70">Active Sellers</div>
              </div>
              <div>
                <div className="text-2xl font-bold">50K+</div>
                <div className="text-sm text-white/70">Products Listed</div>
              </div>
              <div>
                <div className="text-2xl font-bold">100K+</div>
                <div className="text-sm text-white/70">Happy Buyers</div>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="hidden md:flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Placeholder for hero image/graphic */}
              <div className="bg-white/10 backdrop-blur rounded-2xl p-8 aspect-square flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">📱</div>
                  <p className="text-white/80">Featured Electronics</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
