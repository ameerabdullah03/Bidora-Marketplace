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

  useEffect(() => {
    // Check if user should be on auth page
    const path = window.location.pathname
    if (path === '/auth') {
      setCurrentPage('auth')
    }
  }, [])

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

