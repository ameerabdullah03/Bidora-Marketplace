import './App.css'
import { useState, useEffect, lazy, Suspense } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Header from './components/layout/Header'
import Hero from './components/marketplace/Hero'
import Categories from './components/marketplace/Categories'
import FeaturedProducts from './components/marketplace/FeaturedProducts'
import AuctionSection from './components/marketplace/AuctionSection'
import Footer from './components/layout/Footer'
const AuthPage = lazy(() => import('./pages/Auth/AuthPage'))
const SellerDashboard = lazy(() => import('./pages/SellerDashboard/SellerDashboard'))
const CreateListing = lazy(() => import('./pages/CreateListing/CreateListing'))
const AdminPanel = lazy(() => import('./pages/AdminPanel/AdminPanel'))
const ProductDetail = lazy(() => import('./pages/ProductDetail/ProductDetail'))
const SearchPage = lazy(() => import('./pages/SearchPage/SearchPage'))
const SellerProfile = lazy(() => import('./pages/SellerProfile/SellerProfile'))
const Messaging = lazy(() => import('./pages/Messaging/Messaging'))
const AuctionDetail = lazy(() => import('./pages/AuctionDetail/AuctionDetail'))
const Orders = lazy(() => import('./pages/Orders/Orders'))
const Checkout = lazy(() => import('./pages/Checkout/Checkout'))
const Favorites = lazy(() => import('./pages/Favorites/Favorites'))

function PageLoading() {
  return <div className="min-h-[50vh] flex items-center justify-center text-gray-600">Loading Bidora…</div>
}

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
    } else if (path === '/favorites') {
      setCurrentPage('favorites')
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
    return <Suspense fallback={<PageLoading />}><AuthPage /></Suspense>
  }

  if (currentPage === 'dashboard') {
    return (
      <Suspense fallback={<PageLoading />}>
        <Header />
        <SellerDashboard />
        <Footer />
      </Suspense>
    )
  }

  if (currentPage === 'create-listing') {
    return (
      <Suspense fallback={<PageLoading />}>
        <Header />
        <CreateListing />
        <Footer />
      </Suspense>
    )
  }

  if (currentPage === 'admin') {
    return (
      <Suspense fallback={<PageLoading />}>
        <Header />
        <AdminPanel />
        <Footer />
      </Suspense>
    )
  }

  if (currentPage === 'product') {
    return (
      <Suspense fallback={<PageLoading />}>
        <Header />
        <ProductDetail productId={pageParams.id || ''} />
        <Footer />
      </Suspense>
    )
  }

  if (currentPage === 'search') {
    return (
      <Suspense fallback={<PageLoading />}>
        <Header />
        <SearchPage />
        <Footer />
      </Suspense>
    )
  }

  if (currentPage === 'seller') {
    return (
      <Suspense fallback={<PageLoading />}>
        <Header />
        <SellerProfile sellerId={pageParams.id || ''} />
        <Footer />
      </Suspense>
    )
  }

  if (currentPage === 'messages') {
    return (
      <Suspense fallback={<PageLoading />}>
        <Header />
        <Messaging />
      </Suspense>
    )
  }

  if (currentPage === 'auction') {
    return (
      <Suspense fallback={<PageLoading />}>
        <Header />
        <AuctionDetail auctionId={pageParams.id || ''} />
        <Footer />
      </Suspense>
    )
  }

  if (currentPage === 'orders') {
    return (
      <Suspense fallback={<PageLoading />}>
        <Header />
        <Orders />
        <Footer />
      </Suspense>
    )
  }

  if (currentPage === 'favorites') {
    return <Suspense fallback={<PageLoading />}><Header /><Favorites /><Footer /></Suspense>
  }

  if (currentPage === 'checkout') {
    return (
      <Suspense fallback={<PageLoading />}>
        <Header />
        <Checkout productId={pageParams.id} auctionId={pageParams.auctionId} />
        <Footer />
      </Suspense>
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

