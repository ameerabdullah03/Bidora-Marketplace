import { motion } from 'framer-motion'
import { ArrowRight, Zap, Sparkles, Shield } from 'lucide-react'

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white pt-20 pb-24 md:pt-32 md:pb-32">
      {/* Animated gradient orbs */}
      <motion.div
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: 8, repeat: Infinity, repeatType: 'loop' as const }}
        className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-500/40 to-cyan-500/40 rounded-full blur-3xl"
      ></motion.div>
      <motion.div
        animate={{ y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, repeatType: 'loop' as const, delay: 1 }}
        className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-3xl"
      ></motion.div>

      <div className="relative max-w-7xl mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          {/* Left Content */}
          <motion.div variants={itemVariants} className="space-y-8">
            {/* Badge */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 px-4 py-2 rounded-full backdrop-blur-md border border-teal-500/30 hover:border-teal-500/60 transition-all w-fit"
            >
              <Zap size={16} className="text-teal-400" />
              <span className="text-sm font-semibold text-teal-300">Pakistan's Premier Electronics Marketplace</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-tight">
              <span className="bg-gradient-to-r from-white via-teal-100 to-cyan-200 bg-clip-text text-transparent">
                Discover.
              </span>
              <br />
              <span className="bg-gradient-to-r from-teal-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent">
                Bid. Buy.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-xl">
              The trusted marketplace for buying and selling electronics in Pakistan. Authentic products, fair prices, and secure transactions.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold px-8 py-4 rounded-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 group"
              >
                Start Shopping
                <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity, repeatType: 'loop' as const }}>
                  <ArrowRight size={20} />
                </motion.div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-slate-500 text-white font-bold px-8 py-4 rounded-xl hover:border-teal-500 transition-all backdrop-blur-sm"
              >
                Become a Seller
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-700/50">
              {[
                { value: '10K+', label: 'Active Sellers' },
                { value: '50K+', label: 'Products Listed' },
                { value: '100K+', label: 'Happy Buyers' },
              ].map((stat, i) => (
                <motion.div key={i} whileHover={{ y: -5 }} className="group">
                  <motion.div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent group-hover:from-teal-200 group-hover:to-cyan-200">
                    {stat.value}
                  </motion.div>
                  <div className="text-sm text-slate-400 group-hover:text-slate-300">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Trust badges */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 pt-4">
              {[
                { icon: Shield, text: 'Secure Payments', color: 'text-green-400' },
                { icon: Sparkles, text: 'Verified Sellers', color: 'text-blue-400' },
              ].map((badge, i) => (
                <motion.div key={i} whileHover={{ x: 5 }} className="flex items-center gap-2 text-slate-400 hover:text-slate-200">
                  <badge.icon size={18} className={badge.color} />
                  <span className="text-sm font-medium">{badge.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Visual */}
          <motion.div variants={itemVariants} className="hidden md:flex justify-center relative h-96">
            {/* Floating cards */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 6, repeat: Infinity, repeatType: 'loop' as const }}
              className="absolute w-48 h-48 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 backdrop-blur-xl rounded-2xl border border-teal-500/30 p-6 flex flex-col items-center justify-center"
              style={{ top: '20px', left: '50%', transform: 'translateX(-50%)' }}
            >
              <div className="text-5xl mb-4">⚡</div>
              <p className="text-sm text-center text-white">Live Auctions</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 7, repeat: Infinity, repeatType: 'loop' as const, delay: 0.5 }}
              className="absolute w-48 h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6 flex flex-col items-center justify-center"
              style={{ bottom: '0px', left: '0px' }}
            >
              <div className="text-5xl mb-4">🛍️</div>
              <p className="text-sm text-center text-white">Best Deals</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 8, repeat: Infinity, repeatType: 'loop' as const, delay: 1 }}
              className="absolute w-48 h-48 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6 flex flex-col items-center justify-center"
              style={{ bottom: '20px', right: '0px' }}
            >
              <div className="text-5xl mb-4">✨</div>
              <p className="text-sm text-center text-white">Verified Sellers</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
