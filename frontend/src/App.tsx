import './App.css'
import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Header from './components/layout/Header'
import Hero from './components/marketplace/Hero'
import Categories from './components/marketplace/Categories'
import FeaturedProducts from './components/marketplace/FeaturedProducts'
import AuctionSection from './components/marketplace/AuctionSection'
import Footer from './components/layout/Footer'
import AuthPage from './pages/Auth/AuthPage'
import SellerDashboard from './pages/SellerDashboard/SellerDashboard'
import CreateListing from './pages/CreateListing/CreateListing'
import AdminPanel from './pages/AdminPanel/AdminPanel'
import ProductDetail from './pages/ProductDetail/ProductDetail'
import SearchPage from './pages/SearchPage/SearchPage'
import SellerProfile from './pages/SellerProfile/SellerProfile'
import Messaging from './pages/Messaging/Messaging'
import AuctionDetail from './pages/AuctionDetail/AuctionDetail'
import Orders from './pages/Orders/Orders'
import Checkout from './pages/Checkout/Checkout'

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Hero />
      <Categories />
      <FeaturedProducts />
      <AuctionSection />
      <Footer />
    </div>
  )
}

function AppContent() {
  const { loading } = useAuth()
  const [currentPage, setCurrentPage] = useState('home')
  const [pageParams, setPageParams] = useState<Record<string, string>>({})

  useEffect(() => {
    // Parse URL for routing
    const path = window.location.pathname
    const searchParams = new URLSearchParams(window.location.search)
    const params: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      params[key] = value
    })
    setPageParams(params)

    // Route based on path
    if (path === '/auth') {
      setCurrentPage('auth')
    } else if (path === '/dashboard') {
      setCurrentPage('dashboard')
    } else if (path === '/create-listing') {
      setCurrentPage('create-listing')
    } else if (path === '/admin') {
      setCurrentPage('admin')
    } else if (path === '/product') {
      setCurrentPage('product')
    } else if (path === '/search') {
      setCurrentPage('search')
    } else if (path === '/seller') {
      setCurrentPage('seller')
    } else if (path === '/messages') {
      setCurrentPage('messages')
    } else if (path === '/auction') {
      setCurrentPage('auction')
    } else if (path === '/orders') {
      setCurrentPage('orders')
    } else if (path === '/checkout') {
      setCurrentPage('checkout')
    } else {
      setCurrentPage('home')
    }
  }, [window.location.pathname, window.location.search])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Bidora...</p>
        </div>
      </div>
    )
  }

  if (currentPage === 'auth') {
    return <AuthPage />
  }

  if (currentPage === 'dashboard') {
    return (
      <>
        <Header />
        <SellerDashboard />
        <Footer />
      </>
    )
  }

  if (currentPage === 'create-listing') {
    return (
      <>
        <Header />
        <CreateListing />
        <Footer />
      </>
    )
  }

  if (currentPage === 'admin') {
    return (
      <>
        <Header />
        <AdminPanel />
        <Footer />
      </>
    )
  }

  if (currentPage === 'product') {
    return (
      <>
        <Header />
        <ProductDetail productId={pageParams.id || ''} />
        <Footer />
      </>
    )
  }

  if (currentPage === 'search') {
    return (
      <>
        <Header />
        <SearchPage />
        <Footer />
      </>
    )
  }

  if (currentPage === 'seller') {
    return (
      <>
        <Header />
        <SellerProfile sellerId={pageParams.id || ''} />
        <Footer />
      </>
    )
  }

  if (currentPage === 'messages') {
    return (
      <>
        <Header />
        <Messaging />
      </>
    )
  }

  if (currentPage === 'auction') {
    return (
      <>
        <Header />
        <AuctionDetail auctionId={pageParams.id || ''} />
        <Footer />
      </>
    )
  }

  if (currentPage === 'orders') {
    return (
      <>
        <Header />
        <Orders />
        <Footer />
      </>
    )
  }

  if (currentPage === 'checkout') {
    return (
      <>
        <Header />
        <Checkout productId={pageParams.id} />
        <Footer />
      </>
    )
  }

  return <HomePage />
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App

