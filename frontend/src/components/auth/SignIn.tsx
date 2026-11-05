import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { supabase } from '../../services/supabase'

interface SignInProps { onSuccess?: () => void; onSwitchToSignUp?: () => void }

export default function SignIn({ onSuccess, onSwitchToSignUp }: SignInProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [forgotPassword, setForgotPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    try {
      if (forgotPassword) {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth?mode=recover` })
        if (resetError) throw resetError
        setSuccess('If an account exists for this email, a password reset link is on its way.')
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
        setSuccess('Signed in successfully.')
        setPassword('')
        onSuccess?.()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The request could not be completed. Try again.')
    } finally { setLoading(false) }
  }

  return <section className="mx-auto flex min-h-[65vh] max-w-lg items-center px-5 py-12">
    <div className="w-full border border-bidora-ink/15 bg-white p-6 shadow-sm sm:p-8">
      <p className="eyebrow mb-2">Bidora account</p><h1 className="text-3xl font-extrabold tracking-tight">{forgotPassword ? 'Reset your password' : 'Sign in'}</h1>
      <p className="mt-2 text-sm text-bidora-muted">{forgotPassword ? 'We will send a reset link if this email has an account.' : 'Sign in to save listings, message sellers, and manage orders.'}</p>
      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <label className="block text-sm font-semibold">Email
          <span className="relative mt-2 block"><Mail size={17} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-bidora-muted" /><input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required className="w-full border border-bidora-ink/20 bg-transparent py-3 pl-10 pr-3" /></span>
        </label>
        {!forgotPassword && <label className="block text-sm font-semibold">Password
          <span className="relative mt-2 block"><Lock size={17} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-bidora-muted" /><input type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" required className="w-full border border-bidora-ink/20 bg-transparent py-3 pl-10 pr-12" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-bidora-paper">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span>
        </label>}
        {!forgotPassword && <div className="flex justify-end"><button type="button" onClick={() => { setForgotPassword(true); setError(''); setSuccess('') }} className="text-sm font-semibold underline underline-offset-4">Forgot password?</button></div>}
        {error && <p role="alert" className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}{success && <p role="status" className="border border-green-200 bg-green-50 p-3 text-sm text-green-800">{success}</p>}
        <button type="submit" disabled={loading} className="w-full border border-bidora-ink bg-bidora-ink px-4 py-3 font-bold text-white hover:bg-bidora-deep disabled:opacity-60">{loading ? (forgotPassword ? 'Sending reset link…' : 'Signing in…') : (forgotPassword ? 'Send reset link' : 'Sign in')}</button>
      </form>
      {forgotPassword && <button type="button" onClick={() => { setForgotPassword(false); setError(''); setSuccess('') }} className="mt-3 w-full border border-bidora-ink/20 px-4 py-3 text-sm font-semibold hover:bg-bidora-paper">Back to sign in</button>}
      <div className="mt-6 border-t border-bidora-ink/10 pt-5 text-center text-sm"><span className="text-bidora-muted">New to Bidora? </span><button type="button" onClick={onSwitchToSignUp} className="font-bold underline underline-offset-4">Create an account</button></div>
      <p className="mt-5 text-center text-xs text-bidora-muted">Authentication is handled by Supabase.</p>
    </div>
  </section>
}
