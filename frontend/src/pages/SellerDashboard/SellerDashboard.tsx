import { useState } from 'react'
import { Plus, Package, DollarSign, Clock, TrendingUp } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function SellerDashboard() {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'auctions' | 'orders'>('overview')

  const stats = [
    {
      label: 'Active Listings',
      value: '12',
      icon: <Package size={24} className="text-blue-500" />,
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Total Sales',
      value: profile?.total_sales || '0',
      icon: <DollarSign size={24} className="text-green-500" />,
      bgColor: 'bg-green-50',
    },
    {
      label: 'Active Auctions',
      value: '3',
      icon: <Clock size={24} className="text-orange-500" />,
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Rating',
      value: profile?.rating?.toFixed(1) || '0',
      icon: <TrendingUp size={24} className="text-primary-500" />,
      bgColor: 'bg-primary-50',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-dark-900">Seller Dashboard</h1>
              <p className="text-dark-600 mt-1">Welcome back, {profile?.full_name}</p>
            </div>
            <button className="btn-primary flex items-center gap-2">
              <Plus size={20} />
              New Listing
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-6">
              <div className={`${stat.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                {stat.icon}
              </div>
              <p className="text-dark-600 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-dark-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <div className="flex">
              {['overview', 'listings', 'auctions', 'orders'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-dark-600 hover:text-dark-900'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-dark-900 mb-2">Getting Started</h3>
                <p className="text-dark-600 mb-6">
                  Create your first product listing to start selling on Bidora
                </p>
                <button className="btn-primary">Create Your First Listing</button>
              </div>
            )}

            {activeTab === 'listings' && (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-dark-900 mb-2">No Active Listings</h3>
                <p className="text-dark-600">
                  You haven't created any product listings yet
                </p>
              </div>
            )}

            {activeTab === 'auctions' && (
              <div className="text-center py-12">
                <Clock size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-dark-900 mb-2">No Active Auctions</h3>
                <p className="text-dark-600">
                  You haven't created any auctions yet
                </p>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="text-center py-12">
                <DollarSign size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-dark-900 mb-2">No Orders Yet</h3>
                <p className="text-dark-600">
                  Your orders will appear here once you start selling
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
