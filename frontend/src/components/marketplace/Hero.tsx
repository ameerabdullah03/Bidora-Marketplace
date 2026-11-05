import { motion, useReducedMotion } from 'framer-motion'
import { ArrowDownRight, ArrowRight, CircleCheck, Sparkles } from 'lucide-react'

export default function Hero() {
  const reduceMotion = useReducedMotion()
  return <section className="relative overflow-hidden px-5 pb-14 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:pt-20">
    <div className="pointer-events-none absolute -right-32 -top-40 h-[32rem] w-[32rem] rounded-full bg-bidora-lime/25 blur-[100px]" />
    <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.02fr_.98fr] lg:gap-14">
      <motion.div initial={reduceMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55 }} className="relative z-10">
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-bidora-ink/10 bg-white/70 px-3.5 py-2 text-xs font-bold text-bidora-ink"><Sparkles size={14} className="text-bidora-coral" /> A better way to buy tech</div>
        <h1 className="max-w-[760px] text-[clamp(3.1rem,7vw,6.6rem)] font-black leading-[.93] tracking-[-.075em]">Good tech.<br /><span className="font-display font-medium italic tracking-[-.065em] text-bidora-coral">Better stories.</span></h1>
        <p className="mt-7 max-w-lg text-base leading-7 text-bidora-muted sm:text-lg sm:leading-8">Find your next favorite device, discover a one-of-a-kind auction, or pass a great piece of tech on to someone new.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href="/search" className="inline-flex h-13 items-center justify-center gap-3 rounded-full bg-bidora-ink px-7 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-bidora-deep">Explore the marketplace <ArrowRight size={17} /></a>
          <a href="/create-listing" className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-bidora-ink/15 bg-white/60 px-7 text-sm font-bold transition hover:bg-white">Sell on Bidora <ArrowDownRight size={16} /></a>
        </div>
        <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-bidora-muted"><span className="inline-flex items-center gap-2"><CircleCheck size={15} className="text-bidora-ink" /> Listings reviewed before approval</span><span className="inline-flex items-center gap-2"><CircleCheck size={15} className="text-bidora-ink" /> Made for Pakistan</span></div>
      </motion.div>
      <motion.div initial={reduceMotion ? false : { opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .65, delay: .1 }} className="relative mx-auto w-full max-w-[620px]">
        <div className="relative min-h-[350px] overflow-hidden rounded-[2rem] bg-bidora-ink sm:min-h-[450px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_23%,rgba(217,239,105,.32),transparent_30%),radial-gradient(circle_at_10%_90%,rgba(244,130,98,.24),transparent_32%)]" />
          <div className="absolute -right-14 top-8 h-60 w-60 rounded-full border border-white/15 sm:h-80 sm:w-80" />
          <div className="absolute -right-2 top-20 h-44 w-44 rounded-full border border-white/10 sm:h-60 sm:w-60" />
          <div className="absolute left-7 top-8 z-10 text-xs font-bold uppercase tracking-[.2em] text-white/60 sm:left-10 sm:top-10">The good-find department</div>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-center px-8 pb-8 sm:px-12 sm:pb-10">
            <motion.div animate={reduceMotion ? undefined : { y: [0, -8, 0], rotate: [-2, -1, -2] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="relative z-10 flex h-56 w-44 items-center justify-center rounded-[2.4rem] border border-white/35 bg-gradient-to-br from-[#deddd7] via-[#a6aaa2] to-[#626e67] shadow-[0_36px_80px_rgba(0,0,0,.35)] sm:h-72 sm:w-56">
              <div className="absolute inset-3 rounded-[2rem] border border-white/25" /><div className="absolute left-6 top-6 grid h-14 w-14 grid-cols-2 gap-1 rounded-2xl bg-[#263d35] p-2 shadow-inner"><i className="rounded-full bg-[#b7c2b6]"/><i className="rounded-full bg-[#b7c2b6]"/><i className="rounded-full bg-[#b7c2b6]"/></div><div className="h-3 w-3 rounded-full bg-white/70 shadow-[0_0_16px_white]" />
            </motion.div>
          </div>
          <div className="absolute bottom-6 left-5 z-20 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white backdrop-blur-md sm:bottom-8 sm:left-8"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-white/60">The next chapter</p><p className="mt-1 text-sm font-semibold">Starts with a good find.</p></div>
          <div className="absolute right-5 top-20 z-20 rotate-6 rounded-full bg-bidora-lime px-4 py-2 text-xs font-black text-bidora-ink sm:right-9 sm:top-24">PRE-LOVED, WELL-LOVED</div>
        </div>
        <div className="absolute -bottom-4 right-6 h-8 w-28 rounded-full bg-bidora-ink/10 blur-xl" />
      </motion.div>
    </div>
    <div className="mx-auto mt-14 flex max-w-7xl items-center justify-between border-t border-bidora-ink/10 pt-5 text-[10px] font-bold uppercase tracking-[.2em] text-bidora-muted"><span>Thoughtful tech marketplace</span><span>Scroll to find your next thing ↓</span></div>
  </section>
}
