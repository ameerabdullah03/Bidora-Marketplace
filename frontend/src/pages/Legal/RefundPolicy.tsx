import { ArrowLeft } from 'lucide-react'

const updated = 'November 8, 2026'

export default function RefundPolicy() {
  return <article className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
    <a href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-bidora-muted hover:text-bidora-ink"><ArrowLeft size={16} /> Back to Bidora</a>
    <p className="eyebrow mb-3">Bidora policies</p><h1 className="text-4xl font-extrabold tracking-[-.05em] sm:text-5xl">Refunds and cancellations</h1><p className="mt-4 text-sm text-bidora-muted">Last updated: {updated}</p>
    <p role="note" className="mt-4 border border-amber-300 bg-amber-50 p-3 text-sm leading-6 text-amber-950">Draft for product review. Business details, a support route, and final legal review are still needed before launch.</p>
    <div className="legal-copy mt-10 space-y-8">
      <section><h2>Current payment flow</h2><p>Bidora’s current checkout records cash-on-delivery orders. Bidora does not collect advance payments, card details, delivery charges, or a marketplace service fee through this version of the site. The checkout total is the listed item price only. Confirm any delivery charge and the final amount with the seller before ordering.</p></section>
      <section><h2>Cancellation</h2><p>A buyer can request cancellation while an order is pending using the order page. Later order statuses may require the buyer and seller to coordinate directly. The status control records an order state; it does not itself arrange pickup, delivery, or a money transfer.</p></section>
      <section><h2>Refunds and returns</h2><p>Because Bidora does not currently take advance payment, the app has no in-app refund or payment-reversal flow. If a buyer has paid a seller or courier directly, the buyer and seller should contact each other to resolve the payment or return. This page does not remove rights that cannot be excluded under applicable law. A final policy and support process must be reviewed before launch or before adding online payments.</p></section>
      <section><h2>Support</h2><p>A public support contact has not yet been configured. Bidora must publish a working support route and dispute process before launch.</p></section>
    </div>
  </article>
}
