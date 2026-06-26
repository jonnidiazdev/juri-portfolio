import { useEffect, useState, type ReactNode } from 'react'
import { isFirebaseConfigured, signInWithGoogle, subscribeToAuthChanges } from '../config/firebase'
import LoadingSpinner from './LoadingSpinner'

interface GoogleLoginGateProps {
  children: (user: { uid: string; displayName?: string; photoURL?: string; email?: string }) => ReactNode
}

export default function GoogleLoginGate({ children }: GoogleLoginGateProps) {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [signInError, setSignInError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    let unsubscribe = () => {}

    if (!isFirebaseConfigured) {
      setIsLoading(false)
      return () => {}
    }

    subscribeToAuthChanges((nextUser) => {
      if (!mounted) return
      setUser(nextUser)
      setIsLoading(false)
    }).then((unsub) => {
      unsubscribe = typeof unsub === 'function' ? unsub : () => {}
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  const handleGoogleLogin = async () => {
    setIsSigningIn(true)
    setSignInError(null)
    try {
      await signInWithGoogle()
    } catch (error) {
      setSignInError('No se pudo iniciar sesión. Intentá de nuevo o verificá que los popups no estén bloqueados.')
      console.error('Google sign-in error:', error)
    } finally {
      setIsSigningIn(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-ink min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Validando sesión…" />
      </div>
    )
  }

  if (!isFirebaseConfigured) {
    return (
      <div className="bg-ink min-h-screen flex items-center justify-center px-4">
        <div className="max-w-lg w-full card p-8 text-center" role="alert">
          <h1 className="font-display text-2xl font-semibold mb-3 text-paper">Configuración requerida</h1>
          <p className="text-muted">
            Este entorno requiere autenticación con Google. Configurá las variables <strong className="text-paper">VITE_FIREBASE_*</strong> para habilitar el acceso.
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="bg-ink min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full card p-8">
          <p className="text-celeste text-xs font-mono-data uppercase tracking-widest mb-3">Portfolio personal</p>
          <h1 className="font-display text-3xl font-semibold mb-2 text-paper">El Juri-Portfolio</h1>
          <p className="text-muted mb-8">Iniciá sesión con Google para acceder a tu portfolio desde cualquier dispositivo.</p>

          {signInError && (
            <div role="alert" className="status-banner bg-loss/10 border border-loss/25 text-loss text-sm mb-4">
              {signInError}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={isSigningIn}
            className="btn-primary w-full px-4 py-3 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 4 1.5l2.7-2.6C17 3.3 14.8 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.5H12z" />
            </svg>
            {isSigningIn ? 'Iniciando sesión…' : 'Continuar con Google'}
          </button>

          <p className="text-xs text-subtle mt-5">
            La autenticación de IOL se mantiene local y separada de esta sesión.
          </p>
        </div>
      </div>
    )
  }

  if (typeof children === 'function') {
    return children(user)
  }

  return children
}
