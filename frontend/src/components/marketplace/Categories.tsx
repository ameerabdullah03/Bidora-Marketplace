import { Camera, Gamepad2, Headphones, Laptop, Smartphone, Watch, ArrowUpRight } from 'lucide-react'

const categories = [
  { id: 1, name: 'Phones & tablets', icon: Smartphone, mark: '01' },
  { id: 2, name: 'Computers', icon: Laptop, mark: '02' },
  { id: 3, name: 'Audio', icon: Headphones, mark: '03' },
  { id: 4, name: 'Wearables', icon: Watch, mark: '04' },
  { id: 5, name: 'Cameras', icon: Camera, mark: '05' },
  { id: 6, name: 'Gaming', icon: Gamepad2, mark: '06' },
]

export default function Categories() {
  return <section className="section-container pt-10">
    <div className="mb-8 flex items-end justify-between gap-5 sm:mb-10">
      <div><p className="eyebrow mb-3">A place for every kind of tech</p><h2 className="text-3xl font-extrabold tracking-[-.055em] sm:text-4xl">Browse your way</h2></div>
      <a href="/search" className="hidden items-center gap-2 pb-1 text-sm font-bold hover:text-bidora-coral sm:inline-flex">All listings <ArrowUpRight size={16} /></a>
    </div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
      {categories.map(({ id, name, icon: Icon }, index) => <a key={id} href={`/search?category=${id}`} className={`group relative flex min-h-36 flex-col justify-between overflow-hidden rounded-2xl border border-bidora-ink/10 p-4 transition duration-300 hover:-translate-y-1 hover:border-bidora-ink/25 hover:shadow-lg sm:min-h-40 sm:p-5 ${index % 3 === 1 ? 'bg-[#eeeee5]' : 'bg-white/70'}`}>
        <span className="flex items-center justify-between text-[10px] font-bold tracking-[.15em] text-bidora-muted"><span>0{index + 1}</span><ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></span>
        <span className="flex items-end justify-between gap-2"><span className="text-sm font-bold leading-tight sm:text-[15px]">{name}</span><Icon size={25} strokeWidth={1.6} className="shrink-0 text-bidora-ink/70 transition-transform group-hover:rotate-[-8deg] group-hover:scale-110" /></span>
      </a>)}
    </div>
    <a href="/search" className="mt-5 inline-flex items-center gap-2 text-sm font-bold sm:hidden">All listings <ArrowUpRight size={16} /></a>
  </section>
}
