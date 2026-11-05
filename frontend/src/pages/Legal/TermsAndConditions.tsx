import { ArrowLeft } from 'lucide-react'

const updated = 'November 6, 2026'

export default function TermsAndConditions() {
  return <article className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
    <a href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-bidora-muted hover:text-bidora-ink"><ArrowLeft size={16} /> Back to Bidora</a>
    <p className="eyebrow mb-3">Bidora policies</p><h1 className="text-4xl font-extrabold tracking-[-.05em] sm:text-5xl">Terms and conditions</h1><p className="mt-4 text-sm text-bidora-muted">Last updated: {updated}</p>
    <div className="legal-copy mt-10 space-y-8">
      <section><h2>Using Bidora</h2><p>Bidora provides website tools for people in Pakistan to browse electronics listings, contact sellers, place supported orders, and take part in auctions. By using the site, you agree to these terms. If you do not agree, do not use the service.</p></section>
      <section><h2>Accounts</h2><p>Keep your sign-in details private and provide accurate account information. You are responsible for activity performed through your account. Tell Bidora through its published support route if you believe someone else has accessed it.</p></section>
      <section><h2>Buyers and sellers</h2><p>Bidora hosts listings submitted by users. Sellers are responsible for having the right to list an item and for keeping its description, condition, images, location, and price accurate. Buyers should review those details and ask questions before placing an order or bid. A listing's presence on Bidora is not an independent guarantee of condition or seller claims.</p><p>Buyers and sellers must communicate respectfully, comply with applicable rules, and not use the service for fraud, harassment, stolen goods, prohibited items, or misleading listings.</p></section>
      <section><h2>Orders and payments</h2><p>The current checkout creates cash-on-delivery orders. Bidora does not process card payments in this version. Order status and delivery details are shared with the buyer and seller involved. Buyers and sellers should review the order details before confirming actions in the order flow.</p></section>
      <section><h2>Auctions</h2><p>Each auction page displays its current bid and end time. The site accepts or rejects bids according to the auction's current state. Review the item's details and current bid before bidding. Do not place bids unless you intend to follow through if you win.</p></section>
      <section><h2>Moderation and availability</h2><p>Listings can be reviewed, approved, rejected, or removed under Bidora's marketplace rules. Bidora may restrict access when needed to protect users, investigate abuse, or maintain the service. Features may change or become temporarily unavailable.</p></section>
      <section><h2>Content and intellectual property</h2><p>You keep rights you already hold in material you submit. You permit Bidora to display and process that material as needed to operate the marketplace, including showing listings and images to visitors and sharing relevant order or conversation details with participants.</p><p>Do not upload content you do not have permission to use. Report a listing or content concern through the site's reporting controls.</p></section>
      <section><h2>Limits and disputes</h2><p>Bidora is a marketplace platform and is not the seller of items listed by users. These terms do not remove rights that cannot be excluded under applicable law. If an issue arises, contact the other marketplace participant and use Bidora's published support route. A public support contact route must be added before launch.</p></section>
      <section><h2>Updates</h2><p>We may update these terms as Bidora changes. The date above shows when this page was last revised. Continued use after a change means you accept the updated terms.</p></section>
    </div>
  </article>
}
