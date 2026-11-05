import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Heart, Home, LogOut, Menu, MessageSquare, Plus, Search, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { ThemeToggle } from './SiteUtilities'

export default function Header() {
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, profile, signOut } = useAuth()
  const menuRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const close = (event: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])
  const search = (event: React.FormEvent) => {
    event.preventDefault()
    if (query.trim()) window.location.href = `/search?q=${encodeURIComponent(query.trim())}`
  }
  const searchField = (compact = false) => <form onSubmit={search} role="search" className={`relative ${compact ? 'w-full' : 'hidden w-full max-w-md md:block'}`}>
    <label htmlFor={compact ? 'mobile-search' : 'desktop-search'} className="sr-only">Search listings</label>
    <Search size={17} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-bidora-muted" />
    <input id={compact ? 'mobile-search' : 'desktop-search'} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search listings" className="h-10 w-full border border-bidora-ink/15 bg-white/75 pl-10 pr-11 text-sm text-bidora-ink placeholder:text-bidora-muted/80 focus:bg-white" />
    <button type="submit" aria-label="Submit search" className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center bg-bidora-ink text-white hover:bg-bidora-deep"><ArrowRight size={15} /></button>
  </form>
  const links = [{ label: 'Explore', href: '/search' }, { label: 'Auctions', href: '/#live-auctions' }]
  const closeMobile = () => setMobileOpen(false)
  return <header className="sticky top-0 z-50 border-b border-bidora-ink/10 bg-bidora-paper/95 backdrop-blur">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
      <a href="/" aria-label="Bidora home" className="group flex shrink-0 items-center gap-2.5">
        <span className="grid h-10 w-10 place-items-center border-2 border-bidora-ink bg-bidora-ink text-lg font-black text-bidora-lime">b.</span>
        <span className="text-[21px] font-extrabold tracking-[-0.06em]">bidora<span className="text-bidora-coral">.</span></span>
      </a>
      {searchField()}
      <nav aria-label="Main navigation" className="hidden items-center gap-5 lg:flex">
        {links.map(link => <a key={link.href} className="text-sm font-semibold text-bidora-muted transition-colors hover:text-bidora-ink" href={link.href}>{link.label}</a>)}
      </nav>
      <div className="hidden items-center gap-2 md:flex">
        <ThemeToggle />
        {user ? <>
          <a href="/create-listing" className="inline-flex h-10 items-center gap-2 border border-bidora-ink bg-bidora-lime px-3 text-sm font-bold text-bidora-ink transition-colors hover:bg-white"><Plus size={16} /> Sell</a>
          <div className="relative" ref={menuRef}>
            <button aria-label="Open account menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)} className="grid h-10 w-10 place-items-center border border-bidora-ink/15 bg-white font-bold text-bidora-ink">{profile?.full_name?.charAt(0).toUpperCase() || 'U'}</button>
            <AnimatePresence>{menuOpen && <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} className="absolute right-0 mt-2 w-60 border border-bidora-ink/10 bg-white p-2 shadow-xl">
              <div className="border-b border-bidora-ink/10 px-3 py-3"><p className="truncate text-sm font-bold">{profile?.full_name || 'Your account'}</p><p className="truncate text-xs text-bidora-muted">{user.email}</p></div>
              {[[Home, 'Dashboard', '/dashboard'], [MessageSquare, 'Messages', '/messages'], [Heart, 'Saved listings', '/favorites']].map(([Icon, label, href]: any) => <a key={href} href={href} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-bidora-paper"><Icon size={16} />{label}</a>)}
              <button onClick={async () => { await signOut(); window.location.href = '/' }} className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-red-700 hover:bg-red-50"><LogOut size={16} />Sign out</button>
            </motion.div>}</AnimatePresence>
          </div>
        </> : <a href="/auth" className="inline-flex h-10 items-center gap-2 bg-bidora-ink px-4 text-sm font-bold text-white transition hover:bg-bidora-deep">Sign in <ArrowRight size={15} /></a>}
      </div>
      <button className="grid h-10 w-10 place-items-center border border-bidora-ink/10 md:hidden" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} aria-controls="mobile-navigation" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button>
    </div>
    <AnimatePresence>{mobileOpen && <motion.div id="mobile-navigation" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-t border-bidora-ink/10 px-5 pb-5 md:hidden">
      <div className="mx-auto max-w-7xl space-y-3 pt-4">{searchField(true)}<nav aria-label="Mobile navigation" className="grid grid-cols-2 gap-2">{links.map(link => <a key={link.href} href={link.href} onClick={closeMobile} className="border border-bidora-ink/10 px-3 py-3 text-sm font-semibold hover:bg-white">{link.label}</a>)}</nav>
        <ThemeToggle compact />
        {user ? <div className="grid grid-cols-2 gap-2"><a href="/create-listing" onClick={closeMobile} className="border border-bidora-ink bg-bidora-lime px-3 py-3 text-sm font-bold">Sell an item</a><a href="/dashboard" onClick={closeMobile} className="border border-bidora-ink/10 bg-white px-3 py-3 text-sm font-semibold">My account</a><button onClick={async () => { await signOut(); window.location.href = '/' }} className="px-3 py-3 text-left text-sm text-red-700">Sign out</button></div> : <a href="/auth" onClick={closeMobile} className="block border border-bidora-ink bg-bidora-ink px-4 py-3 text-center font-bold text-white">Sign in or join</a>}
      </div>
    </motion.div>}</AnimatePresence>
  </header>
}
