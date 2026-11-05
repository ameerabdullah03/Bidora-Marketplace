import { useState } from 'react'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../services/supabase'

interface SignUpProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

export default function SignUp({ onSuccess, onSwitchToLogin }: SignUpProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [accountType, setAccountType] = useState<'buyer' | 'seller'>('buyer')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      setError('Use a password with at least 8 characters.')
      return
    }
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Sign up with Supabase Auth
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            account_type: accountType,
          },
        },
      })

      if (signUpError) throw signUpError

      setSuccess('Account created! Check your email to verify your account.')
      setEmail('')
      setPassword('')
      setFullName('')

      if (onSuccess) {
        setTimeout(onSuccess, 2000)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 to-primary-600 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-lg shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-dark-900">Bidora</h1>
            <p className="text-primary-500 text-sm font-semibold mt-1">Create Your Account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-dark-900 mb-2">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-3 text-dark-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-dark-900 mb-2">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-3 text-dark-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-dark-900 mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3 text-dark-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-dark-400 hover:text-dark-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Account Type */}
            <div>
              <label className="block text-sm font-semibold text-dark-900 mb-2">I want to</label>
              <div className="flex gap-3">
                <label className="flex-1 flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors" style={{ borderColor: accountType === 'buyer' ? '#16A6A0' : undefined }}>
                  <input
                    type="radio"
                    value="buyer"
                    checked={accountType === 'buyer'}
                    onChange={(e) => setAccountType(e.target.value as 'buyer' | 'seller')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-dark-700">Buy</span>
                </label>
                <label className="flex-1 flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors" style={{ borderColor: accountType === 'seller' ? '#16A6A0' : undefined }}>
                  <input
                    type="radio"
                    value="seller"
                    checked={accountType === 'seller'}
                    onChange={(e) => setAccountType(e.target.value as 'buyer' | 'seller')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-dark-700">Sell</span>
                </label>
              </div>
            </div>

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
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-xs text-dark-500">Already have an account?</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Login Link */}
          <button
            onClick={onSwitchToLogin}
            className="w-full btn-secondary py-2 font-semibold"
          >
            Sign In
          </button>

          {/* Footer */}
          <p className="text-xs text-dark-500 text-center mt-6">
            Your account is secured with Supabase Auth.
          </p>
        </div>
      </div>
    </div>
  )
}
