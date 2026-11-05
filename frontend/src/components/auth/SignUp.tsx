import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { getUtmAttribution } from '../../services/attribution'

interface SignUpProps { onSuccess?: () => void; onSwitchToLogin?: () => void }

export default function SignUp({ onSuccess, onSwitchToLogin }: SignUpProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [accountType, setAccountType] = useState<'buyer' | 'seller'>('buyer')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(''); setSuccess('')
    if (password.length < 8) { setError('Use a password with at least 8 characters.'); return }
    setLoading(true)
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: fullName.trim(), account_type: accountType, attribution: getUtmAttribution() } },
      })
      if (signUpError) throw signUpError
      setSuccess('Account created. Check your email to verify your address.')
      setEmail(''); setPassword(''); setFullName('')
      if (onSuccess) window.setTimeout(onSuccess, 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the account. Try again.')
    } finally { setLoading(false) }
  }

  return <section className="mx-auto flex min-h-[65vh] max-w-lg items-center px-5 py-12">
    <div className="w-full border border-bidora-ink/15 bg-white p-6 shadow-sm sm:p-8">
      <p className="eyebrow mb-2">Bidora account</p><h1 className="text-3xl font-extrabold tracking-tight">Create an account</h1><p className="mt-2 text-sm text-bidora-muted">Choose how you want to use the marketplace.</p>
      <form onSubmit={handleSignUp} className="mt-7 space-y-4">
        <label className="block text-sm font-semibold">Full name
          <span className="relative mt-2 block"><User size={17} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-bidora-muted" /><input type="text" value={fullName} onChange={event => setFullName(event.target.value)} maxLength={80} autoComplete="name" required className="w-full border border-bidora-ink/20 bg-transparent py-3 pl-10 pr-3" /></span>
        </label>
        <label className="block text-sm font-semibold">Email
          <span className="relative mt-2 block"><Mail size={17} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-bidora-muted" /><input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required className="w-full border border-bidora-ink/20 bg-transparent py-3 pl-10 pr-3" /></span>
        </label>
        <label className="block text-sm font-semibold">Password
          <span className="relative mt-2 block"><Lock size={17} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-bidora-muted" /><input type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} minLength={8} autoComplete="new-password" required className="w-full border border-bidora-ink/20 bg-transparent py-3 pl-10 pr-12" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-bidora-paper">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span>
        </label>
        <fieldset><legend className="mb-2 text-sm font-semibold">I want to</legend><div className="grid grid-cols-2 gap-3">{(['buyer', 'seller'] as const).map(type => <label key={type} className={`flex cursor-pointer items-center gap-2 border px-3 py-3 text-sm font-semibold transition-colors ${accountType === type ? 'border-bidora-ink bg-bidora-lime/20' : 'border-bidora-ink/20 hover:bg-bidora-paper'}`}><input type="radio" name="account-type" value={type} checked={accountType === type} onChange={() => setAccountType(type)} /><span>{type === 'buyer' ? 'Buy' : 'Sell'}</span></label>)}</div></fieldset>
        <p className="text-xs leading-5 text-bidora-muted">By creating an account, you agree to the <a className="font-semibold underline" href="/terms">terms and conditions</a> and acknowledge the <a className="font-semibold underline" href="/privacy">privacy policy</a>.</p>
        {error && <p role="alert" className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}{success && <p role="status" className="border border-green-200 bg-green-50 p-3 text-sm text-green-800">{success}</p>}
        <button type="submit" disabled={loading} className="w-full border border-bidora-ink bg-bidora-ink px-4 py-3 font-bold text-white hover:bg-bidora-deep disabled:opacity-60">{loading ? 'Creating account…' : 'Create account'}</button>
      </form>
      <div className="mt-6 border-t border-bidora-ink/10 pt-5 text-center text-sm"><span className="text-bidora-muted">Already registered? </span><button type="button" onClick={onSwitchToLogin} className="font-bold underline underline-offset-4">Sign in</button></div>
    </div>
  </section>
}
