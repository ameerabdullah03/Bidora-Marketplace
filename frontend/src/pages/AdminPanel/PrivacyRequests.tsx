import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../hooks/useAuth'

interface PrivacyRequest { id: string; user_id: string; request_type: 'deletion' | 'access' | 'correction'; status: 'received' | 'in_review' | 'completed'; created_at: string }

export default function PrivacyRequests() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [requests, setRequests] = useState<PrivacyRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    void (async () => {
      if (!user) { setLoading(false); return }
      const { data: admin, error: adminError } = await supabase.from('admins').select('user_id').eq('user_id', user.id).maybeSingle()
      if (!active) return
      if (adminError || !admin) { setLoading(false); return }
      setIsAdmin(true)
      const { data, error: requestError } = await supabase.from('privacy_requests').select('id, user_id, request_type, status, created_at').order('created_at', { ascending: true })
      if (!active) return
      if (requestError) setError('Privacy request migration is not applied or the request table is unavailable.')
      else setRequests(data || [])
      setLoading(false)
    })()
    return () => { active = false }
  }, [user?.id])

  const setStatus = async (request: PrivacyRequest, status: PrivacyRequest['status']) => {
    setError('')
    const { error: updateError } = await supabase.from('privacy_requests').update({ status, completed_at: status === 'completed' ? new Date().toISOString() : null }).eq('id', request.id)
    if (updateError) { setError('The request status could not be updated.'); return }
    setRequests(current => current.map(item => item.id === request.id ? { ...item, status } : item))
  }

  if (loading) return <div className="mx-auto max-w-4xl px-5 py-16 text-bidora-muted">Loading privacy requests</div>
  if (!isAdmin) return <section className="mx-auto max-w-xl px-5 py-16"><h1 className="text-3xl font-bold">Admin access required</h1><p className="mt-3 text-bidora-muted">Sign in with an administrator account to view privacy requests.</p></section>

  return <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
    <a href="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-bidora-muted underline"><ArrowLeft size={16} /> Back to listing moderation</a>
    <h1 className="mt-6 text-3xl font-extrabold">Privacy requests</h1>
    <p className="mt-3 max-w-3xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">Requests are not automatically fulfilled. Verify the requester and handle account deletion using an approved trusted process. Never put Supabase service-role credentials in this app. Mark a request completed only after the action is actually done.</p>
    {error && <p role="alert" className="mt-4 border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {requests.length === 0 ? <p className="mt-8 border border-bidora-ink/15 p-6 text-bidora-muted">There are no privacy requests.</p> : <ul className="mt-8 divide-y divide-bidora-ink/15 border-y border-bidora-ink/15">{requests.map(request => <li key={request.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold capitalize">{request.request_type} request · {request.status.replace('_', ' ')}</h2><p className="mt-1 text-xs text-bidora-muted">Account ID: {request.user_id}</p><p className="mt-1 text-xs text-bidora-muted">Received {new Date(request.created_at).toLocaleString()}</p></div><div className="flex flex-wrap gap-2">{request.status === 'received' && <button onClick={() => void setStatus(request, 'in_review')} className="border border-bidora-ink/20 px-3 py-2 text-sm font-semibold hover:bg-bidora-paper">Mark in review</button>}{request.status === 'in_review' && <button onClick={() => void setStatus(request, 'completed')} className="border border-bidora-ink bg-bidora-ink px-3 py-2 text-sm font-semibold text-white hover:bg-bidora-deep">Mark completed</button>}</div></li>)}</ul>}
  </section>
}
