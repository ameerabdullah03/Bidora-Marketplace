import { Search, ShoppingCart, User, LogOut, Settings, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const { user, profile, signOut } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
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

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Logo and Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-8">
            <a href="/" className="flex flex-col hover:opacity-80 transition-opacity">
              <h1 className="text-2xl font-bold text-gray-900">Bidora</h1>
              <p className="text-xs text-teal-600 font-semibold">Discover. Bid. Buy.</p>
            </a>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#" className="text-gray-700 hover:text-teal-600 transition-colors">
              Browse
            </a>
            <a href="#" className="text-gray-700 hover:text-teal-600 transition-colors">
              Auctions
            </a>
            <a href="#" className="text-gray-700 hover:text-teal-600 transition-colors">
              Sell
            </a>
            <a href="#" className="text-gray-700 hover:text-teal-600 transition-colors">
              Help
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ShoppingCart size={20} className="text-gray-700" />
            </button>

            {user && profile ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {profile.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown size={16} className="text-gray-600" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="font-semibold text-gray-900 text-sm">{profile.full_name}</p>
                      <p className="text-xs text-gray-500">{profile.email}</p>
                      {profile.account_type === 'seller' && (
                        <span className="inline-block mt-2 px-2 py-1 bg-teal-100 text-teal-700 text-xs font-semibold rounded">
                          Seller
                        </span>
                      )}
                    </div>

                    <a
                      href="/seller-dashboard"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm"
                    >
                      <User size={16} />
                      Dashboard
                    </a>

                    {profile.account_type === 'seller' && (
                      <a
                        href="/create-listing"
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm"
                      >
                        <Settings size={16} />
                        New Listing
                      </a>
                    )}

                    <div className="border-t border-gray-200 mt-2">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-red-600 text-sm"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <a href="/auth" className="btn-primary">
                Sign In
              </a>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2">
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search electronics, phones, laptops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
          <button className="btn-primary px-8">Search</button>
        </div>
      </div>
    </header>
  )
}

