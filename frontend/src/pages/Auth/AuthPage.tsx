import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import SignUp from '../../components/auth/SignUp'
import SignIn from '../../components/auth/SignIn'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../services/supabase'

function PasswordRecovery() {
  const { user, signOut } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  const updatePassword = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (password.length < 8) { setError('Use a password with at least 8 characters.'); return }
    if (password !== confirmPassword) { setError('The passwords do not match.'); return }
    setSaving(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) { setError(updateError.message); setSaving(false); return }
    setSuccess('Password updated. Signing you out…')
    await signOut()
    window.location.href = '/auth'
  }

  return <main className="mx-auto flex min-h-[65vh] max-w-lg items-center px-5 py-12">
    <section className="w-full border border-bidora-ink/15 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-3xl font-bold">Reset your password</h1>
      {user ? <form onSubmit={updatePassword} className="mt-6 space-y-4">
        <label className="block text-sm font-semibold">New password
          <span className="relative mt-2 block"><input type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} minLength={8} autoComplete="new-password" required className="w-full border border-gray-300 px-4 py-3 pr-12" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1"><Eye size={18} className={showPassword ? 'hidden' : ''} /><EyeOff size={18} className={showPassword ? '' : 'hidden'} /></button></span>
        </label>
        <label className="block text-sm font-semibold">Confirm new password
          <span className="relative mt-2 block"><input type={showConfirmation ? 'text' : 'password'} value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} minLength={8} autoComplete="new-password" required className="w-full border border-gray-300 px-4 py-3 pr-12" /><button type="button" aria-label={showConfirmation ? 'Hide confirmation password' : 'Show confirmation password'} aria-pressed={showConfirmation} onClick={() => setShowConfirmation(!showConfirmation)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1"><Eye size={18} className={showConfirmation ? 'hidden' : ''} /><EyeOff size={18} className={showConfirmation ? '' : 'hidden'} /></button></span>
        </label>
        {error && <p role="alert" className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}{success && <p role="status" className="border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</p>}
        <button type="submit" disabled={saving} className="w-full border border-bidora-ink bg-bidora-ink px-4 py-3 font-semibold text-white hover:bg-bidora-deep disabled:opacity-60">{saving ? 'Saving…' : 'Update password'}</button>
      </form> : <div className="mt-4 text-sm text-bidora-muted"><p>This reset link is invalid or has expired. Request a new link to continue.</p><a href="/auth" className="mt-4 inline-block font-semibold underline">Return to sign in</a></div>}
    </section>
  </main>
}

export default function AuthPage() {
  const [mode, setMode] = useState<'signup' | 'signin'>('signin')
  if (new URLSearchParams(window.location.search).get('mode') === 'recover') return <PasswordRecovery />
  return mode === 'signup'
    ? <SignUp onSuccess={() => setMode('signin')} onSwitchToLogin={() => setMode('signin')} />
    : <SignIn onSuccess={() => { window.location.href = '/' }} onSwitchToSignUp={() => setMode('signup')} />
}
