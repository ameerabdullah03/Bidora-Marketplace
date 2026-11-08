import { useState, useEffect, lazy, Suspense, type ReactNode } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import FAQ from './components/marketplace/FAQ'
import { BackToTop, CookieNotice, FloatingContactButton, ScrollProgress, ThemeProvider } from './components/layout/SiteUtilities'
import Hero from './components/marketplace/Hero'
import Categories from './components/marketplace/Categories'
import FeaturedProducts from './components/marketplace/FeaturedProducts'
import AuctionSection from './components/marketplace/AuctionSection'
import { captureUtmAttribution } from './services/attribution'
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
const PrivacyPolicy = lazy(() => import('./pages/Legal/PrivacyPolicy'))
const TermsAndConditions = lazy(() => import('./pages/Legal/TermsAndConditions'))
const CookiePolicy = lazy(() => import('./pages/Legal/CookiePolicy'))
const RefundPolicy = lazy(() => import('./pages/Legal/RefundPolicy'))
const PrivacyRequestsAdmin = lazy(() => import('./pages/AdminPanel/PrivacyRequests'))

function PageLoading() {
  return <div className="flex min-h-[50vh] items-center justify-center text-bidora-muted"><span className="mr-3 h-5 w-5 animate-spin border-2 border-bidora-ink/20 border-t-bidora-ink" aria-hidden="true" />Loading Bidora</div>
}

function HomePage() {
  return <><Hero /><Categories /><FeaturedProducts /><AuctionSection /><FAQ /></>
}

function AppContent() {
  const { loading } = useAuth()
  const [currentPage, setCurrentPage] = useState('home')
  const [pageParams, setPageParams] = useState<Record<string, string>>({})

  useEffect(() => {
    const path = window.location.pathname
    const searchParams = new URLSearchParams(window.location.search)
    const params: Record<string, string> = {}
    searchParams.forEach((value, key) => { params[key] = value })
    setPageParams(params)
    captureUtmAttribution(window.location.search)
    if (path === '/auth') setCurrentPage('auth')
    else if (path === '/dashboard') setCurrentPage('dashboard')
    else if (path === '/create-listing') setCurrentPage('create-listing')
    else if (path === '/admin') setCurrentPage('admin')
    else if (path === '/product') setCurrentPage('product')
    else if (path === '/search') setCurrentPage('search')
    else if (path === '/seller') setCurrentPage('seller')
    else if (path === '/messages') setCurrentPage('messages')
    else if (path === '/auction') setCurrentPage('auction')
    else if (path === '/orders') setCurrentPage('orders')
    else if (path === '/favorites') setCurrentPage('favorites')
    else if (path === '/checkout') setCurrentPage('checkout')
    else if (path === '/privacy') setCurrentPage('privacy')
    else if (path === '/terms') setCurrentPage('terms')
    else if (path === '/cookies') setCurrentPage('cookies')
    else if (path === '/refunds') setCurrentPage('refunds')
    else setCurrentPage('home')
  }, [window.location.pathname, window.location.search])

  let page: ReactNode
  if (loading && !['privacy', 'terms', 'cookies', 'refunds'].includes(currentPage)) page = <PageLoading />
  else if (currentPage === 'auth') page = <AuthPage />
  else if (currentPage === 'dashboard') page = <SellerDashboard />
  else if (currentPage === 'create-listing') page = <CreateListing />
  else if (currentPage === 'admin') page = pageParams.view === 'privacy' ? <PrivacyRequestsAdmin /> : <AdminPanel />
  else if (currentPage === 'product') page = <ProductDetail productId={pageParams.id || ''} />
  else if (currentPage === 'search') page = <SearchPage />
  else if (currentPage === 'seller') page = <SellerProfile sellerId={pageParams.id || ''} />
  else if (currentPage === 'messages') page = <Messaging />
  else if (currentPage === 'auction') page = <AuctionDetail auctionId={pageParams.id || ''} />
  else if (currentPage === 'orders') page = <Orders />
  else if (currentPage === 'favorites') page = <Favorites />
  else if (currentPage === 'checkout') page = <Checkout productId={pageParams.id} auctionId={pageParams.auctionId} />
  else if (currentPage === 'privacy') page = <PrivacyPolicy />
  else if (currentPage === 'terms') page = <TermsAndConditions />
  else if (currentPage === 'cookies') page = <CookiePolicy />
  else if (currentPage === 'refunds') page = <RefundPolicy />
  else page = <HomePage />

  return <Suspense fallback={<PageLoading />}>{page}</Suspense>
}

function SiteFrame() {
  const { user } = useAuth()
  useEffect(() => {
    const main = document.getElementById('main-content')
    const pageTitle = document.querySelector('h1')?.textContent?.trim()
    document.title = pageTitle ? `${pageTitle} | Bidora` : 'Bidora | Buy, sell, and auction in Pakistan'
    if (main && window.location.hash === '#main-content') main.focus()
  })
  const skipToMain = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    const main = document.getElementById('main-content')
    if (!main) return
    main.focus()
    main.scrollIntoView({ block: 'start' })
  }
  return <div className="min-h-screen bg-bidora-paper text-bidora-ink">
    <a href="#main-content" onClick={skipToMain} className="skip-link">Skip to content</a>
    <ScrollProgress />
    <Header />
    <main id="main-content" tabIndex={-1} className="min-h-[50vh]"> <AppContent /> </main>
    <Footer />
    <CookieNotice />
    <BackToTop />
    <FloatingContactButton signedIn={Boolean(user)} />
  </div>
}

function App() {
  return <AuthProvider><ThemeProvider><SiteFrame /></ThemeProvider></AuthProvider>
}

export default App
