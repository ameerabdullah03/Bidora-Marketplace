import { ArrowLeft } from 'lucide-react'

const updated = 'November 6, 2026'

export default function PrivacyPolicy() {
  return <article className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
    <a href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-bidora-muted hover:text-bidora-ink"><ArrowLeft size={16} /> Back to Bidora</a>
    <p className="eyebrow mb-3">Bidora policies</p><h1 className="text-4xl font-extrabold tracking-[-.05em] sm:text-5xl">Privacy policy</h1><p className="mt-4 text-sm text-bidora-muted">Last updated: {updated}</p>
    <div className="legal-copy mt-10 space-y-8">
      <section><h2>What this policy covers</h2><p>This policy describes the Bidora marketplace website in its current form. It explains what information the site handles, why it is used, and which service providers operate parts of the site. It should be reviewed again before public launch.</p></section>
      <section><h2>Information Bidora handles</h2><ul><li>Account information, including email address, name, and buyer or seller account type.</li><li>Listings and seller profile information, including product descriptions, condition, price, category, location, and uploaded images.</li><li>Favorites, bids, reviews, reports, conversations, and messages created through marketplace features.</li><li>Order information such as delivery address, order status, payment method, and tracking details. The current checkout records cash-on-delivery orders. Bidora does not collect payment-card numbers in this version.</li><li>Campaign tags in a page link, such as UTM source or campaign, may be retained in the browser session and attached to account metadata when a visitor signs up.</li><li>Technical request information handled by the website host and database provider to deliver and protect the service.</li></ul></section>
      <section><h2>How information is used</h2><p>Bidora uses this information to authenticate accounts, display listings, support search and auctions, process marketplace orders, let buyers and sellers communicate, moderate listings, respond to reports, and protect the service from abuse.</p></section>
      <section><h2>Who can see information</h2><p>Public listing and seller-profile details can be viewed by visitors. Conversation content is intended for its participants. Order details are shown to the buyer and seller involved. Bidora uses Supabase for authentication and database services and Cloudflare Pages for website hosting. Those providers process information needed to operate their services. Signup and recovery email delivery may use Gmail SMTP after it is configured.</p></section>
      <section><h2>Browser storage</h2><p>The site uses Supabase authentication storage to keep a signed-in session, local browser storage for the selected light or dark display mode and this notice's dismissed state, and session storage for optional campaign tags. The current site does not include an advertising or analytics-cookie provider.</p></section>
      <section><h2>Retention and requests</h2><p>Information is kept while needed to operate accounts, marketplace activity, security, and dispute records. The current release does not provide an automated account-deletion control. Before launch, Bidora will publish a working contact route for access, correction, or deletion requests and explain any records that must be retained.</p></section>
      <section><h2>Security</h2><p>Bidora uses Supabase Auth and database access policies for account and data access. No website can promise that transmission or storage is risk-free. Use a unique password and contact Bidora through the published support route if you believe an account has been compromised.</p></section>
      <section><h2>Children and changes</h2><p>Bidora is not designed for children under 18. This policy may be updated as the site and its providers change. The date above indicates when this page was last revised.</p></section>
      <section><h2>Privacy contact</h2><p>A public support and privacy contact address has not yet been configured. Bidora will publish a working contact route before launch.</p></section>
    </div>
  </article>
}
