import { Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-dark-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold">Bidora</h3>
              <p className="text-sm text-gray-400 mt-1">Discover. Bid. Buy.</p>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Pakistan's trusted marketplace for electronics. Buy and sell with confidence.
            </p>
            <div className="flex gap-3 pt-2">
              <a href="#" className="p-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors">
                <Facebook size={16} />
              </a>
              <a href="#" className="p-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors">
                <Twitter size={16} />
              </a>
              <a href="#" className="p-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors">
                <Instagram size={16} />
              </a>
              <a href="#" className="p-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors">
                <Linkedin size={16} />
              </a>
            </div>
          </div>

          {/* For Buyers */}
          <div>
            <h4 className="font-semibold mb-4">For Buyers</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-primary-400 transition-colors">Browse Products</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Live Auctions</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">How to Bid</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Buyer Protection</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Payment Methods</a></li>
            </ul>
          </div>

          {/* For Sellers */}
          <div>
            <h4 className="font-semibold mb-4">For Sellers</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-primary-400 transition-colors">Start Selling</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Seller Dashboard</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Pricing & Fees</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Seller Tools</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Seller Protection</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-primary-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Report Issue</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Community</a></li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="bg-primary-600 rounded-lg p-6 mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h4 className="text-xl font-bold mb-2">Subscribe to Bidora Updates</h4>
              <p className="text-sm text-white/80">Get the latest deals, auction alerts, and exclusive offers.</p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg outline-none text-dark-900 bg-white placeholder-gray-500"
              />
              <button className="bg-dark-900 hover:bg-dark-800 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2">
                <Mail size={16} />
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-dark-800 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2 text-sm text-gray-400">
              <p><strong>Legal:</strong></p>
              <div className="flex flex-wrap gap-4">
                <a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-primary-400 transition-colors">Cookie Policy</a>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-400">
              <p><strong>Company:</strong></p>
              <div className="flex flex-wrap gap-4">
                <a href="#" className="hover:text-primary-400 transition-colors">About Us</a>
                <a href="#" className="hover:text-primary-400 transition-colors">Blog</a>
                <a href="#" className="hover:text-primary-400 transition-colors">Careers</a>
              </div>
            </div>
          </div>

          <div className="border-t border-dark-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>&copy; 2026 Bidora. All rights reserved. Pakistan's Electronics Marketplace.</p>
            <div className="flex gap-4">
              <select className="bg-transparent border border-gray-700 rounded px-3 py-1 text-gray-400 hover:border-primary-400 transition-colors">
                <option>English</option>
                <option>Urdu</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
