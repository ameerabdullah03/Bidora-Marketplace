import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ArrowUp, MessageCircle, Moon, Sun, X } from 'lucide-react'

export type Theme = 'light' | 'dark'
interface ThemeContextValue { theme: Theme; toggleTheme: () => void }
const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try { return localStorage.getItem('bidora-theme') === 'dark' ? 'dark' : 'light' } catch { return 'light' }
  })
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('bidora-theme', theme) } catch { /* storage may be disabled */ }
  }, [theme])
  const value = useMemo(() => ({ theme, toggleTheme: () => setTheme(current => current === 'dark' ? 'light' : 'dark') }), [theme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used inside ThemeProvider')
  return context
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggleTheme } = useTheme()
  return <button type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} aria-pressed={theme === 'dark'} className={`inline-flex items-center justify-center gap-2 border border-bidora-ink/20 px-3 py-2 text-sm font-semibold transition-colors hover:bg-bidora-lime/30 ${compact ? 'w-full' : ''}`}>
    {theme === 'dark' ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
    <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
  </button>
}

export function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const update = () => {
      const maximum = document.documentElement.scrollHeight - window.innerHeight
      setProgress(maximum > 0 ? Math.min(100, (window.scrollY / maximum) * 100) : 0)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [])
  return <div role="progressbar" aria-label="Scroll progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} className="scroll-progress fixed inset-x-0 top-0 z-[90] h-1 bg-transparent"><div aria-hidden="true" className="h-full bg-bidora-coral transition-[width] duration-100" style={{ width: `${progress}%` }} /></div>
}

export function CookieNotice() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    try { setVisible(localStorage.getItem('bidora-cookie-notice') !== 'dismissed') } catch { setVisible(false) }
  }, [])
  const dismiss = () => {
    try { localStorage.setItem('bidora-cookie-notice', 'dismissed') } catch { /* storage may be disabled */ }
    setVisible(false)
  }
  if (!visible) return null
  return <aside aria-label="Cookie notice" className="fixed bottom-4 left-4 z-[80] max-w-sm border border-bidora-ink/15 bg-bidora-paper p-4 text-bidora-ink shadow-xl">
    <div className="flex items-start justify-between gap-4"><div><h2 className="text-sm font-bold">A note about browser storage</h2><p className="mt-1 text-xs leading-5 text-bidora-muted">Bidora uses essential sign-in storage and saves your display preference. We do not use advertising cookies.</p><a className="mt-2 inline-block text-xs font-bold underline underline-offset-2" href="/privacy">Read the privacy policy</a></div><button type="button" onClick={dismiss} aria-label="Dismiss cookie notice" className="p-1 hover:bg-bidora-ink/10"><X size={16} /></button></div>
    <button type="button" onClick={dismiss} className="mt-3 border border-bidora-ink bg-bidora-ink px-3 py-2 text-xs font-bold text-white hover:bg-bidora-deep">Understood</button>
  </aside>
}

export function BackToTop() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const update = () => setVisible(window.scrollY > 480)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
  if (!visible) return null
  return <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top" className="fixed bottom-5 right-5 z-40 grid h-11 w-11 place-items-center border border-bidora-ink/20 bg-bidora-paper text-bidora-ink shadow-lg transition hover:bg-bidora-lime"><ArrowUp size={19} /></button>
}

export function FloatingContactButton({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false)
  return <div className="fixed bottom-5 right-[4.5rem] z-40">
    {open && <div id="contact-options" className="mb-2 w-64 border border-bidora-ink/15 bg-bidora-paper p-4 text-bidora-ink shadow-xl">
      <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold">Help and contact</p><p className="mt-1 text-xs leading-5 text-bidora-muted">Find an answer or contact a seller about a listing.</p></div><button type="button" onClick={() => setOpen(false)} aria-label="Close help options" className="p-1 hover:bg-bidora-ink/10"><X size={15} /></button></div>
      <a href="/#help" onClick={() => setOpen(false)} className="mt-3 block border border-bidora-ink/20 px-3 py-2 text-sm font-semibold hover:bg-bidora-lime/30">Read common questions</a>
      <a href={signedIn ? '/messages' : '/auth?next=%2Fmessages'} onClick={() => setOpen(false)} className="mt-2 block bg-bidora-ink px-3 py-2 text-sm font-semibold text-white hover:bg-bidora-deep">{signedIn ? 'Open messages' : 'Sign in to message a seller'}</a>
    </div>}
    <button type="button" aria-expanded={open} aria-controls="contact-options" onClick={() => setOpen(!open)} className="inline-flex h-11 items-center gap-2 border border-bidora-ink bg-bidora-lime px-4 text-sm font-bold text-bidora-ink shadow-md transition hover:bg-white"><MessageCircle size={17} />Help</button>
  </div>
}
