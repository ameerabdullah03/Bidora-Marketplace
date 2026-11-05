import { useState } from 'react'
import SignUp from '../../components/auth/SignUp'
import SignIn from '../../components/auth/SignIn'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../services/supabase'

function PasswordRecovery() {
  const { user, signOut } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const updatePassword = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Use a password with at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.')
      return
    }

    setSaving(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }
    await signOut()
    window.location.href = '/auth'
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-teal-600 flex items-center justify-center px-4">
      <section className="w-full max-w-md rounded-lg bg-white p-8 shadow-2xl">
        <h1 className="text-center text-3xl font-bold text-gray-900">Reset your password</h1>
        {user ? (
          <form onSubmit={updatePassword} className="mt-6 space-y-4">
            <label className="block text-sm font-semibold text-gray-900">New password
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} autoComplete="new-password" required className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-600" />
            </label>
            <label className="block text-sm font-semibold text-gray-900">Confirm new password
              <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} autoComplete="new-password" required className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-600" />
            </label>
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={saving} className="w-full rounded-lg bg-teal-600 py-3 font-semibold text-white hover:bg-teal-700 disabled:opacity-60">{saving ? 'Saving…' : 'Update password'}</button>
          </form>
        ) : (
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>This reset link is invalid or has expired. Request a new link to continue.</p>
            <a href="/auth" className="mt-4 inline-block font-semibold text-teal-700 underline">Return to sign in</a>
          </div>
        )}
      </section>
    </main>
  )
}

export default function AuthPage() {
  const [mode, setMode] = useState<'signup' | 'signin'>('signin')

  if (new URLSearchParams(window.location.search).get('mode') === 'recover') {
    return <PasswordRecovery />
  }

  return (
    <>
      {mode === 'signup' ? (
        <SignUp
          onSuccess={() => setMode('signin')}
          onSwitchToLogin={() => setMode('signin')}
        />
      ) : (
        <SignIn
          onSuccess={() => {
            // Redirect to dashboard or homepage
            window.location.href = '/'
          }}
          onSwitchToSignUp={() => setMode('signup')}
        />
      )}
    </>
  )
}
