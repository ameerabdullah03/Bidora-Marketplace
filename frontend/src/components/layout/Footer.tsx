import { motion } from 'framer-motion'
import { Mail, Heart, ArrowRight } from 'lucide-react'

export default function Footer() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-white pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Marketplace call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16 p-8 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/30 rounded-2xl backdrop-blur-xl"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Find your next great deal</h3>
              <p className="text-slate-300">Browse approved listings or start selling on Bidora.</p>
            </div>
            <div className="flex w-full md:w-auto gap-3">
              <a href="/search" className="rounded-lg bg-teal-600 px-5 py-3 text-center font-semibold text-white hover:bg-teal-700">Browse listings</a>
              <a href="/create-listing" className="rounded-lg border border-teal-300 px-5 py-3 text-center font-semibold text-teal-100 hover:bg-white/10">Start selling</a>
            </div>
          </div>
        </motion.div>

        {/* Main Footer Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12"
        >
          {/* Brand */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">
                Bidora
              </h3>
              <p className="text-sm text-slate-400 mt-1">Discover. Bid. Buy.</p>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Pakistan's trusted marketplace for electronics. Buy and sell with confidence.
            </p>
            <a href="mailto:ameer@bidora.dev" className="inline-flex items-center gap-2 pt-2 text-sm text-teal-300 hover:text-teal-100"><Mail size={16} /> Contact Bidora</a>
          </motion.div>

          {/* For Buyers */}
          <motion.div variants={itemVariants}>
            <h4 className="font-bold mb-4 text-lg">For Buyers</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              {[
                { label: 'Browse Products', href: '/search' },
                { label: 'Live Auctions', href: '/search?type=auction' },
                { label: 'Saved Listings', href: '/favorites' },
                { label: 'My Orders', href: '/orders' },
              ].map((item, i) => (
                <motion.li key={i} whileHover={{ x: 4 }} className="transition-transform">
                  <a href={item.href} className="group flex items-center gap-2 hover:text-teal-300 transition-colors">
                    <ArrowRight size={14} className="opacity-70" />
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* For Sellers */}
          <motion.div variants={itemVariants}>
            <h4 className="font-bold mb-4 text-lg">For Sellers</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              {[
                { label: 'Create a Listing', href: '/create-listing' },
                { label: 'Seller Dashboard', href: '/dashboard' },
                { label: 'Manage Orders', href: '/orders' },
                { label: 'Messages', href: '/messages' },
              ].map((item, i) => (
                <motion.li key={i} whileHover={{ x: 4 }} className="transition-transform">
                  <a href={item.href} className="group flex items-center gap-2 hover:text-teal-300 transition-colors">
                    <ArrowRight size={14} className="opacity-70" />
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div variants={itemVariants}>
            <h4 className="font-bold mb-4 text-lg">Support</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              {[
                { label: 'Email Support', href: 'mailto:ameer@bidora.dev' },
                { label: 'Sign In', href: '/auth' },
                { label: 'Browse Listings', href: '/search' },
              ].map((item, i) => (
                <motion.li key={i} whileHover={{ x: 4 }} className="transition-transform">
                  <a href={item.href} className="group flex items-center gap-2 hover:text-teal-300 transition-colors">
                    <ArrowRight size={14} className="opacity-70" />
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Bottom Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="border-t border-slate-800 pt-8"
        >
          <div className="mb-6 text-sm text-slate-400">
            <p>Need help with an order or listing?</p>
            <a href="mailto:ameer@bidora.dev" className="mt-1 inline-block text-teal-300 hover:text-teal-100">ameer@bidora.dev</a>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
              &copy; 2026 Bidora. All rights reserved. Pakistan's Electronics Marketplace.
            </motion.p>
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-1 text-teal-400"
            >
              Made with <Heart size={16} className="fill-red-500 text-red-500" /> in Pakistan
            </motion.div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
