import { ArrowUpRight, PackageOpen } from 'lucide-react'
import { buildCategoryTree, useCategories } from '../../hooks/useCategories'

export default function Categories() {
  const { categories, loading } = useCategories()
  const featuredCategories = buildCategoryTree(categories)
  return <section className="section-container pt-10">
    <div className="mb-8 flex items-end justify-between gap-5 sm:mb-10">
      <div><p className="eyebrow mb-3">Find something worth keeping</p><h2 className="text-3xl font-extrabold tracking-[-.055em] sm:text-4xl">Browse categories</h2></div>
      <a href="/search" className="hidden items-center gap-2 pb-1 text-sm font-bold hover:text-bidora-coral sm:inline-flex">All listings <ArrowUpRight size={16} /></a>
    </div>
    {loading ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Loading categories">{Array.from({ length: 4 }, (_, i) => <div key={i} className="min-h-36 animate-pulse border border-bidora-ink/10 bg-white/70" />)}</div>
      : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {featuredCategories.map(({ id, name }, index) => <a key={id} href={`/search?category=${id}`} className={`group relative flex min-h-36 flex-col justify-between overflow-hidden border border-bidora-ink/10 p-4 transition duration-300 hover:-translate-y-1 hover:border-bidora-ink/25 hover:shadow-lg sm:min-h-40 sm:p-5 ${index % 3 === 1 ? 'bg-[#eeeee5]' : 'bg-white/70'}`}>
        <span className="flex items-center justify-between text-[10px] font-bold tracking-[.15em] text-bidora-muted"><span>0{index + 1}</span><ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></span>
        <span className="flex items-end justify-between gap-2"><span className="text-sm font-bold leading-tight sm:text-[15px]">{name}</span><PackageOpen size={25} strokeWidth={1.6} aria-hidden="true" className="shrink-0 text-bidora-ink/70 transition-transform group-hover:-rotate-6 group-hover:scale-110" /></span>
      </a>)}
    </div>}
    <a href="/search" className="mt-5 inline-flex items-center gap-2 text-sm font-bold sm:hidden">All listings <ArrowUpRight size={16} /></a>
  </section>
}
