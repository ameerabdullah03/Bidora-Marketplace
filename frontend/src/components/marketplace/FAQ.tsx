import { ChevronDown } from 'lucide-react'

const questions = [
  { question: 'How do I start browsing?', answer: 'Use the search field or choose a category to view listings. Open a listing to check its price, condition, seller details, and available actions.' },
  { question: 'How do auctions work?', answer: 'Open an active auction to review its current bid and end time. Sign in to place a bid. The auction page shows whether your bid was accepted.' },
  { question: 'Can I sell on Bidora?', answer: 'Yes. Create an account, choose the seller option, then submit a listing for review. A listing becomes visible to shoppers after it is approved.' },
  { question: 'How do I contact a seller?', answer: 'Open a listing and use its message action. You need to sign in to start or reply to a conversation.' },
  { question: 'How are orders paid?', answer: 'Eligible goods listings can use cash on delivery. Jobs, services, and property listings use seller contact. Bidora does not collect card details in this version.' },
  { question: 'How can I request account help or privacy information?', answer: 'Use the Help control to find common questions or open your messages. A dedicated support and privacy contact address must be added before launch.' },
]

export default function FAQ() {
  return <section id="help" className="bg-bidora-paper px-5 py-16 sm:px-8 sm:py-24">
    <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[.8fr_1.2fr] md:gap-16">
      <div><p className="eyebrow mb-3">Help center</p><h2 className="text-3xl font-extrabold tracking-[-.05em] sm:text-4xl">Common questions</h2><p className="mt-4 max-w-sm text-sm leading-6 text-bidora-muted">Clear answers about listings, buying, selling, and auctions.</p><a href="/privacy" className="mt-6 inline-block text-sm font-bold underline underline-offset-4">Privacy and terms</a></div>
      <div className="divide-y divide-bidora-ink/15 border-y border-bidora-ink/15">{questions.map(item => <details key={item.question} className="group py-5">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-left text-base font-bold marker:hidden"><span>{item.question}</span><ChevronDown size={18} className="shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" /></summary>
        <p className="max-w-2xl pt-3 pr-8 text-sm leading-6 text-bidora-muted">{item.answer}</p>
      </details>)}</div>
    </div>
  </section>
}
