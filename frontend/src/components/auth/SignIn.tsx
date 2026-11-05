import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../services/supabase'

interface SignInProps {
  onSuccess?: () => void
  onSwitchToSignUp?: () => void
}

export default function SignIn({ onSuccess, onSwitchToSignUp }: SignInProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [forgotPassword, setForgotPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      setSuccess('Signed in successfully!')
      setEmail('')
      setPassword('')

      if (onSuccess) {
        setTimeout(onSuccess, 1500)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=recover`,
      })
      if (resetError) throw resetError
      setSuccess('If an account exists for this email, a password reset link is on its way.')
    } catch (err: any) {
      setError(err.message || 'Could not send a password reset email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-teal-600 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-lg shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Bidora</h1>
            <p className="text-teal-600 text-sm font-semibold mt-1">Sign In to Your Account</p>
          </div>

          {/* Form */}
          <form onSubmit={forgotPassword ? handlePasswordReset : handleSignIn} className="space-y-4">
            {forgotPassword && <p className="text-sm text-gray-600">Enter your account email and we’ll send a secure password reset link.</p>}
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  required
                />
              </div>
            </div>

            {/* Password */}
            {!forgotPassword && <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>}

            {/* Remember & Forgot */}
            {!forgotPassword && <div className="flex justify-end items-center text-sm">
              <button type="button" onClick={() => { setForgotPassword(true); setError(''); setSuccess('') }} className="text-teal-600 hover:text-teal-700 font-medium">
                Forgot password?
              </button>
            </div>}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (forgotPassword ? 'Sending…' : 'Signing In...') : (forgotPassword ? 'Send Reset Link' : 'Sign In')}
            </button>
          </form>

          {forgotPassword && <button type="button" onClick={() => { setForgotPassword(false); setError(''); setSuccess('') }} className="mt-3 w-full text-sm text-teal-700 hover:underline">Back to sign in</button>}

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-xs text-gray-500">New to Bidora?</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Sign Up Link */}
          <button
            onClick={onSwitchToSignUp}
            className="w-full btn-secondary py-2 font-semibold"
          >
            Create Account
          </button>

          {/* Footer */}
          <p className="text-xs text-gray-500 text-center mt-6">
            Your account is secured with Supabase Auth.
          </p>
        </div>
      </div>
    </div>
  )
}

