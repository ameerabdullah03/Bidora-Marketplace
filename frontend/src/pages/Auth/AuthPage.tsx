import { useState } from 'react'
import SignUp from '../../components/auth/SignUp'
import SignIn from '../../components/auth/SignIn'

export default function AuthPage() {
  const [mode, setMode] = useState<'signup' | 'signin'>('signin')

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
