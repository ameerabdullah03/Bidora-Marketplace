import { ArrowRight } from 'lucide-react'

const groups = [
  { title: 'Explore', links: [['All listings', '/search'], ['Live auctions', '/#live-auctions'], ['Search antiques', '/search?q=antique']] },
  { title: 'Your Bidora', links: [['Saved listings', '/favorites'], ['Orders', '/orders'], ['Messages', '/messages']] },
  { title: 'Sell with us', links: [['Create a listing', '/create-listing'], ['Seller dashboard', '/dashboard'], ['Join Bidora', '/auth']] },
]

export default function Footer() {
  return <footer className="bg-bidora-deep px-5 pb-7 pt-12 text-white sm:px-8 sm:pt-16">
    <div className="mx-auto max-w-7xl">
      <div className="mb-12 flex flex-col justify-between gap-7 border-b border-white/15 pb-10 md:flex-row md:items-end">
        <div><p className="mb-3 text-xs font-bold uppercase tracking-[.16em] text-bidora-lime">Marketplace in Pakistan</p><h2 className="max-w-2xl text-3xl font-extrabold tracking-[-.05em] sm:text-4xl">Buy and sell everyday finds. Auction the rare ones.</h2></div>
        <div className="flex flex-wrap gap-3"><a href="/search" className="inline-flex items-center gap-2 border border-bidora-lime bg-bidora-lime px-5 py-3 text-sm font-bold text-bidora-deep hover:bg-white">Explore listings <ArrowRight size={16} /></a><a href="/create-listing" className="border border-white/30 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">Start selling</a></div>
      </div>
      <div className="grid grid-cols-2 gap-x-7 gap-y-9 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="col-span-2 md:col-span-1"><a href="/" className="text-2xl font-black tracking-[-.06em]">bidora<span className="text-bidora-lime">.</span></a><p className="mt-3 max-w-xs text-sm leading-6 text-white/65">A local marketplace for useful finds, unique pieces, and everything between.</p></div>
        {groups.map(group => <div key={group.title}><h3 className="mb-4 text-xs font-bold uppercase tracking-[.16em] text-white/55">{group.title}</h3><ul className="space-y-3">{group.links.map(([label, href]) => <li key={href}><a href={href} className="group inline-flex items-center gap-2 text-sm text-white/80 transition hover:text-bidora-lime"><ArrowRight size={13} className="opacity-0 transition group-hover:opacity-100" />{label}</a></li>)}</ul></div>)}
      </div>
      <div className="mt-10 flex flex-col gap-4 border-t border-white/15 pt-5 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} Bidora, Pakistan</p><nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2"><a className="underline underline-offset-4 hover:text-white" href="/privacy">Privacy policy</a><a className="underline underline-offset-4 hover:text-white" href="/terms">Terms and conditions</a><a className="underline underline-offset-4 hover:text-white" href="/refunds">Refunds and cancellations</a><a className="underline underline-offset-4 hover:text-white" href="/cookies">Cookie policy</a></nav></div>
    </div>
  </footer>
}
