import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../services/supabase'

const updated = 'November 8, 2026'
type RequestType = 'deletion' | 'access' | 'correction'
interface PrivacyRequest { id: string; request_type: RequestType; status: string; created_at: string }

export default function PrivacyPolicy() {
  const { user } = useAuth()
  const [requestType, setRequestType] = useState<RequestType>('deletion')
  const [requests, setRequests] = useState<PrivacyRequest[]>([])
  const [requestMessage, setRequestMessage] = useState('')
  const [requestError, setRequestError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadRequests = async () => {
    if (!user) return
    const { data, error } = await supabase.from('privacy_requests').select('id, request_type, status, created_at').eq('user_id', user.id).order('created_at', { ascending: false })
    if (error) {
      setRequestError('Your privacy request history could not be loaded. Please try again later.')
      return
    }
    setRequests(data || [])
    setRequestError('')
  }

  useEffect(() => { void loadRequests() }, [user?.id])

  const submitRequest = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!user) return
    setSubmitting(true); setRequestError(''); setRequestMessage('')
    const { error } = await supabase.from('privacy_requests').insert({ user_id: user.id, request_type: requestType })
    if (error) {
      setRequestError(error.code === '23505' ? 'You already have an open privacy request.' : 'Your request could not be submitted. Please try again later.')
    } else {
      setRequestMessage('Your request was recorded. Bidora will review it through the privacy request queue.')
      await loadRequests()
    }
    setSubmitting(false)
  }

  return <article className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
    <a href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-bidora-muted hover:text-bidora-ink"><ArrowLeft size={16} /> Back to Bidora</a>
    <p className="eyebrow mb-3">Bidora policies</p><h1 className="text-4xl font-extrabold tracking-[-.05em] sm:text-5xl">Privacy policy</h1><p className="mt-4 text-sm text-bidora-muted">Last updated: {updated}</p><p role="note" className="mt-4 border border-amber-300 bg-amber-50 p-3 text-sm leading-6 text-amber-950">Draft for product review. A legal business name, support contact, and final privacy review are still needed before launch.</p>
    <div className="legal-copy mt-10 space-y-8">
      <section><h2>What this policy covers</h2><p>This policy describes the Bidora marketplace website in its current form. It explains what information the site handles, why it is used, and which service providers operate parts of the site. It should be reviewed again before public launch.</p></section>
      <section><h2>Information Bidora handles</h2><ul><li>Account information needed to provide access, including email address, name, and buyer or seller account type.</li><li>Listings and seller profile information, including product descriptions, condition, price, category, location, and uploaded images.</li><li>Favorites, bids, reviews, reports, conversations, and messages created through marketplace features.</li><li>Order information such as delivery address, order status, payment method, and tracking details. The current checkout records cash-on-delivery orders. Bidora does not collect payment-card numbers in this version.</li><li>Optional campaign source, medium, and campaign tags from a page link are stored in the browser session only after you allow them in the storage banner. They are attached to account metadata only if you also select the optional signup checkbox. Search terms and content tags are not retained.</li><li>Technical request information handled by the website host and database provider to deliver and protect the service.</li><li>If you submit an access, correction, or deletion request, the request type, your account ID, and the request date and status are stored so Bidora can review and respond. Requests are not automatically fulfilled or deleted.</li></ul></section>
      <section><h2>How information is used</h2><p>Bidora uses this information to authenticate accounts, display listings, support search and auctions, process marketplace orders, let buyers and sellers communicate, moderate listings, respond to reports, and protect the service from abuse.</p></section>
      <section><h2>Who can see information</h2><p>Public listing and seller-profile details can be viewed by visitors. Conversation content is intended for its participants. Order details are shown to the buyer and seller involved. Bidora uses Supabase for authentication and database services and Cloudflare Pages for website hosting. Those providers process information needed to operate their services. Signup and recovery email delivery may use Gmail SMTP after it is configured.</p></section>
      <section><h2>Browser storage</h2><p>The site uses Supabase authentication storage to keep a signed-in session and local browser storage for the selected light or dark display mode, this notice's choice, and whether optional campaign storage is allowed. Campaign tags use session storage only after you choose that option. They are attached to account metadata only if you also check the optional attribution box at signup. The current site does not include an advertising or analytics-cookie provider.</p></section>
      <section><h2>Retention and requests</h2><p>Information is kept while needed to operate accounts, marketplace activity, security, and dispute records. Signed-in users can submit access, correction, and deletion requests through the form below. A person must review and fulfill verified requests through a trusted process; account deletion is not automatic. Some records may need to be retained for security or dispute handling.</p></section>
      <section><h2>Security</h2><p>Bidora uses Supabase Auth and database access policies for account and data access. No website can promise that transmission or storage is risk-free. Use a unique password. A public support contact must be configured before launch so users can report account security concerns.</p></section>
      <section><h2>Children and changes</h2><p>Bidora is not designed for people under 18. Signup requires an age confirmation, but this is self-attestation and does not independently verify age. Bidora does not intentionally solicit information from children. If you believe a child has created an account, sign in and submit a request below; a public support contact still needs to be configured before launch.</p><p>This policy may be updated as the site and its providers change. The date above indicates when this page was last revised.</p></section>
      <section><h2>Privacy contact</h2><p>A public support and privacy contact address has not yet been configured. Bidora will publish a working contact route before launch. Signed-in users can currently submit an access, correction, or deletion request through the portal below. Submitting a request does not automatically delete an account or its records.</p></section>
    </div>
    <section className="mt-12 border-t border-bidora-ink/15 pt-8" aria-labelledby="privacy-request-title">
      <h2 id="privacy-request-title" className="text-2xl font-bold">Privacy and data requests</h2>
      <p className="mt-2 text-sm leading-6 text-bidora-muted">Sign in to submit an access, correction, or deletion request. This form stores only your account ID, request type, and status. A person must review and fulfill the request.</p>
      {!user ? <a href="/auth" className="mt-4 inline-flex border border-bidora-ink bg-bidora-ink px-4 py-3 text-sm font-bold text-white">Sign in to submit a request</a> : <form onSubmit={submitRequest} className="mt-5 max-w-xl space-y-4">
        <label className="block text-sm font-semibold" htmlFor="privacy-request-type">Request type<select id="privacy-request-type" value={requestType} onChange={event => setRequestType(event.target.value as RequestType)} className="mt-2 w-full border border-bidora-ink/20 bg-transparent px-3 py-3"><option value="deletion">Delete my account and associated data</option><option value="access">Access my data</option><option value="correction">Correct my data</option></select></label>
        {requestError && <p role="alert" className="border border-red-300 bg-red-50 p-3 text-sm text-red-800">{requestError}</p>}{requestMessage && <p role="status" className="border border-green-300 bg-green-50 p-3 text-sm text-green-900">{requestMessage}</p>}
        <button disabled={submitting} className="border border-bidora-ink bg-bidora-ink px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{submitting ? 'Submitting…' : 'Submit privacy request'}</button>
        {requests.length > 0 && <div className="space-y-2"><h3 className="font-bold">Your requests</h3>{requests.map(request => <p key={request.id} className="border border-bidora-ink/15 p-3 text-sm">{request.request_type} request · {request.status} · {new Date(request.created_at).toLocaleDateString()}</p>)}</div>}
      </form>}
    </section>
  </article>
}
