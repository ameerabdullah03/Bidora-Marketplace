import { motion } from 'framer-motion'
import { Share2, Mail, MessageSquare, Link2, Heart, ArrowRight } from 'lucide-react'

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
        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16 p-8 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/30 rounded-2xl backdrop-blur-xl"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Subscribe to Bidora Updates</h3>
              <p className="text-slate-300">Get the latest deals, auction alerts, and exclusive offers.</p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg outline-none text-gray-900 bg-white placeholder-gray-500 focus:ring-2 focus:ring-teal-500"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:shadow-lg px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <Mail size={18} />
                Subscribe
              </motion.button>
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
            <div className="flex gap-3 pt-2">
              {[
                { icon: Share2, label: 'Facebook' },
                { icon: Mail, label: 'Email' },
                { icon: MessageSquare, label: 'Twitter' },
                { icon: Link2, label: 'LinkedIn' },
              ].map((social, i) => (
                <motion.a
                  key={i}
                  whileHover={{ scale: 1.1, y: -3 }}
                  href="#"
                  className="p-2.5 bg-teal-500/20 hover:bg-teal-500/40 border border-teal-500/30 rounded-lg transition-all"
                  title={social.label}
                >
                  <social.icon size={16} className="text-teal-300" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* For Buyers */}
          <motion.div variants={itemVariants}>
            <h4 className="font-bold mb-4 text-lg">For Buyers</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              {['Browse Products', 'Live Auctions', 'How to Bid', 'Buyer Protection', 'Payment Methods'].map((item, i) => (
                <motion.li key={i} whileHover={{ x: 4 }} className="transition-transform">
                  <a href="#" className="hover:text-teal-300 transition-colors flex items-center gap-2">
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100" />
                    {item}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* For Sellers */}
          <motion.div variants={itemVariants}>
            <h4 className="font-bold mb-4 text-lg">For Sellers</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              {['Start Selling', 'Seller Dashboard', 'Pricing & Fees', 'Seller Tools', 'Seller Protection'].map((item, i) => (
                <motion.li key={i} whileHover={{ x: 4 }} className="transition-transform">
                  <a href="#" className="hover:text-teal-300 transition-colors flex items-center gap-2">
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100" />
                    {item}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div variants={itemVariants}>
            <h4 className="font-bold mb-4 text-lg">Support</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              {['Help Center', 'Contact Us', 'FAQs', 'Report Issue', 'Community'].map((item, i) => (
                <motion.li key={i} whileHover={{ x: 4 }} className="transition-transform">
                  <a href="#" className="hover:text-teal-300 transition-colors flex items-center gap-2">
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100" />
                    {item}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2 text-sm text-slate-400">
              <p className="font-semibold text-white">Legal</p>
              <div className="flex flex-wrap gap-4">
                {['Terms of Service', 'Privacy Policy', 'Cookie Policy'].map((item, i) => (
                  <motion.a
                    key={i}
                    whileHover={{ color: '#06B6D4' }}
                    href="#"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    {item}
                  </motion.a>
                ))}
              </div>
            </div>
            <div className="space-y-2 text-sm text-slate-400">
              <p className="font-semibold text-white">Company</p>
              <div className="flex flex-wrap gap-4">
                {['About Us', 'Blog', 'Careers'].map((item, i) => (
                  <motion.a
                    key={i}
                    whileHover={{ color: '#06B6D4' }}
                    href="#"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    {item}
                  </motion.a>
                ))}
              </div>
            </div>
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
