import { ArrowLeft } from 'lucide-react'

const updated = 'November 8, 2026'

export default function CookiePolicy() {
  return <article className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
    <a href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-bidora-muted hover:text-bidora-ink"><ArrowLeft size={16} /> Back to Bidora</a>
    <p className="eyebrow mb-3">Bidora policies</p><h1 className="text-4xl font-extrabold tracking-[-.05em] sm:text-5xl">Cookie and browser storage policy</h1><p className="mt-4 text-sm text-bidora-muted">Last updated: {updated}</p>
    <p role="note" className="mt-4 border border-amber-300 bg-amber-50 p-3 text-sm leading-6 text-amber-950">Draft for product review. This describes the current browser app; review provider behavior on the final domain before launch.</p>
    <div className="legal-copy mt-10 space-y-8">
      <section><h2>What the app stores</h2><p>Bidora uses browser storage for essential sign-in state, the selected light or dark theme, and your storage choice. Optional campaign source, medium, and campaign tags use session storage only after you choose to allow them. The app does not enable an advertising or analytics SDK.</p></section>
      <section><h2>Choices</h2><p>Choose “Essential only” to decline campaign storage or choose “Allow campaign tags” to enable it for the current browser session. Campaign tags are attached to signup metadata only if you also select the optional attribution checkbox during signup. There are no advertising or analytics cookies enabled in the current app. Sign-in storage is needed to use account features. Clearing browser storage can sign you out and reset saved preferences.</p></section>
      <section><h2>Providers</h2><p>Supabase provides authentication and database services. Cloudflare Pages hosts the website. Their production behavior and any provider-set storage should be checked on Bidora’s final custom domain before launch. No third-party advertising or analytics provider is configured in the frontend source.</p></section>
      <section><h2>Contact</h2><p>A public support contact has not yet been configured. Bidora must publish a working contact route before launch. See the <a className="underline" href="/privacy">privacy policy</a> for data requests.</p></section>
    </div>
  </article>
}
