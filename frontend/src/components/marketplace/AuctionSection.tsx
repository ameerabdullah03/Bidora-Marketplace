import { useEffect, useState } from 'react'
import { ArrowRight, Clock3, Gavel, Users } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { supabase } from '../../services/supabase'

interface Auction { id: string; title: string; current_bid: number; starting_price: number; bid_count: number; end_time: string; condition: string; image_url: string | null }
const money = (amount: number) => `Rs ${Number(amount).toLocaleString('en-PK')}`
const remaining = (end: string, now: number) => {
  const ms = new Date(end).getTime() - now
  if (ms <= 0) return 'Ended'
  const days = Math.floor(ms / 86400000)
  const hours = Math.floor(ms % 86400000 / 3600000)
  const mins = Math.floor(ms % 3600000 / 60000)
  return days ? `${days}d ${hours}h left` : `${hours}h ${mins}m left`
}

export default function AuctionSection() {
  const reduceMotion = useReducedMotion()
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [loading, setLoading] = useState(true)
  const [clock, setClock] = useState(Date.now())

  useEffect(() => {
    let active = true
    supabase.from('auctions').select('id, current_bid, starting_price, total_bids, end_time, product:products!auctions_product_id_fkey(title, condition, images:product_images(image_url))')
      .eq('status', 'active').eq('product.status', 'approved').gt('end_time', new Date().toISOString()).order('end_time', { ascending: true }).limit(4)
      .then(({ data, error }) => {
        if (error) console.error('Error fetching auctions:', error)
        if (!active) return
        setAuctions((data || []).map((auction: any) => ({ id: auction.id, title: auction.product?.title || 'Auction listing', condition: auction.product?.condition || 'Pre-loved', image_url: auction.product?.images?.[0]?.image_url || null, current_bid: Number(auction.current_bid || auction.starting_price), starting_price: Number(auction.starting_price), bid_count: Number(auction.total_bids || 0), end_time: auction.end_time })))
        setLoading(false)
      })
    const timer = window.setInterval(() => setClock(Date.now()), 60000)
    return () => { active = false; window.clearInterval(timer) }
  }, [])

  return <section id="live-auctions" className="bg-bidora-ink px-5 py-16 text-white sm:px-8 sm:py-24">
    <div className="mx-auto max-w-7xl">
      <div className="mb-10 flex flex-col justify-between gap-6 sm:mb-12 md:flex-row md:items-end">
        <div><p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-bidora-lime"><span className="h-2 w-2 rounded-full bg-bidora-coral" /> Bidora after hours</p><h2 className="text-3xl font-extrabold tracking-[-.055em] sm:text-5xl">The thrill of the find.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/60 sm:text-base">Put rare, vintage, and collectible finds up for timed bidding.</p></div>
        <a href="/#live-auctions" className="inline-flex w-fit items-center gap-2 border border-white/25 px-5 py-3 text-sm font-bold transition hover:border-bidora-lime hover:text-bidora-lime">Explore auctions <ArrowRight size={16} /></a>
      </div>
      {loading ? <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">{Array.from({ length: 4 }, (_, i) => <div key={i} className="aspect-[.85] animate-pulse rounded-2xl bg-white/10" />)}</div>
        : auctions.length === 0 ? <div className="rounded-3xl border border-white/15 bg-white/[.04] px-6 py-12 text-center"><Gavel size={26} className="mx-auto mb-4 text-bidora-lime" /><p className="font-bold">No live auctions at this moment.</p><p className="mt-2 text-sm text-white/55">Check in again soon for something special.</p></div>
        : <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">{auctions.map((auction, i) => <motion.a key={auction.id} href={`/auction?id=${encodeURIComponent(auction.id)}`} initial={reduceMotion ? false : { opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .05 }} className="group overflow-hidden rounded-2xl border border-white/15 bg-white/[.05] transition hover:-translate-y-1 hover:border-bidora-lime/60 hover:bg-white/[.08]">
          <div className="relative aspect-[1.15] overflow-hidden bg-white/5">{auction.image_url ? <img src={auction.image_url} alt={auction.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" /> : <div className="grid h-full place-items-center text-white/60"><Gavel size={32} aria-hidden="true" /></div>}<span className="absolute left-3 top-3 rounded-sm bg-bidora-lime px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-bidora-deep">Live</span><span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-sm bg-bidora-deep/90 px-2.5 py-1.5 text-[10px] font-bold text-white"><Clock3 size={12} />{remaining(auction.end_time, clock)}</span></div>
          <div className="p-3.5 sm:p-4"><p className="line-clamp-2 min-h-10 text-sm font-bold leading-5 sm:text-base">{auction.title}</p><div className="mt-4 border-t border-white/10 pt-3"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-white/60">Current bid</p><div className="mt-1 flex items-center justify-between gap-2"><p className="text-lg font-extrabold tracking-tight text-bidora-lime sm:text-xl">{money(auction.current_bid)}</p><span className="flex items-center gap-1 text-[10px] text-white/60"><Users size={12} />{auction.bid_count}</span></div></div><span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-white/80">Place a bid <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" /></span></div>
        </motion.a>)}</div>}
    </div>
  </section>
}
