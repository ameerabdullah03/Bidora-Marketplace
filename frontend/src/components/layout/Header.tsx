import { motion, AnimatePresence } from 'framer-motion'
import { Search, Menu, X, Plus, LogOut, Home, MessageSquare } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const { user, profile, signOut } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Main Header */}
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <motion.a
            whileHover={{ scale: 1.05 }}
            href="/"
            className="flex items-center gap-2 shrink-0"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-9 h-9 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center text-white font-bold text-lg"
            >
              B
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Bidora
              </h1>
              <p className="text-xs text-gray-500 font-semibold">Discover. Bid. Buy.</p>
            </div>
          </motion.a>

          {/* Desktop Search */}
          <motion.div className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="text"
                placeholder="Search products, auctions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
              />
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = '/create-listing'}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  <Plus size={18} />
                  <span className="hidden lg:inline">New Listing</span>
                </motion.button>

                <div className="relative" ref={userMenuRef}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-full flex items-center justify-center font-bold hover:shadow-lg transition-all"
                  >
                    {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </motion.button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200/50 backdrop-blur-xl py-2"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-semibold text-gray-900 text-sm">{profile?.full_name}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                          {profile?.account_type === 'seller' && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="inline-block mt-2 px-2.5 py-1 bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 text-xs font-bold rounded-full"
                            >
                              ⭐ Seller Account
                            </motion.span>
                          )}
                        </div>

                        {[
                          { icon: Home, label: 'Dashboard', href: '/dashboard' },
                          { icon: MessageSquare, label: 'Messages', href: '/messages' },
                        ].map((item, i) => (
                          <motion.a
                            key={i}
                            whileHover={{ x: 4 }}
                            href={item.href}
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700 text-sm transition-colors"
                          >
                            <item.icon size={16} className="text-teal-500" />
                            {item.label}
                          </motion.a>
                        ))}

                        <div className="border-t border-gray-100 mt-2">
                          <motion.button
                            whileHover={{ x: 4 }}
                            onClick={() => {
                              handleSignOut()
                              setShowUserMenu(false)
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-600 text-sm transition-colors"
                          >
                            <LogOut size={16} />
                            Sign Out
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/auth"
                className="px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                Sign In
              </motion.a>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 space-y-3 pb-4"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {user ? (
                <>
                  <motion.button
                    whileHover={{ x: 4 }}
                    onClick={() => {
                      window.location.href = '/create-listing'
                      setMobileMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-lg"
                  >
                    <Plus size={18} />
                    New Listing
                  </motion.button>
                  <motion.a
                    whileHover={{ x: 4 }}
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Home size={18} />
                    Dashboard
                  </motion.a>
                  <motion.a
                    whileHover={{ x: 4 }}
                    href="/messages"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MessageSquare size={18} />
                    Messages
                  </motion.a>
                  <motion.button
                    whileHover={{ x: 4 }}
                    onClick={() => {
                      handleSignOut()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </motion.button>
                </>
              ) : (
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  href="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-lg"
                >
                  Sign In
                </motion.a>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
