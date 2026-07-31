import { useEffect, useState } from 'react'
import {
  completeGoogleRedirectSignIn,
  isCursorEmbeddedBrowser,
  isFirebaseConfigured,
  signInWithGoogle,
  subscribeToAuthChanges
} from '../config/firebase'
import LoadingSpinner from './LoadingSpinner'
import PizarraBackground from './PizarraBackground'

interface GoogleLoginGateProps {
  children: (user: { uid: string; displayName?: string; photoURL?: string; email?: string }) => React.ReactNode
}

export default function GoogleLoginGate({ children }: GoogleLoginGateProps) {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  // No cambia durante la vida del componente: no necesita ser estado.
  const isUnsupportedBrowser = isCursorEmbeddedBrowser()

  useEffect(() => {
    let mounted = true
    let unsubscribe = () => {}

    // El login con Google no puede funcionar en el navegador integrado de
    // Cursor (bloquea popups y descarta el estado del redirect), así que no
    // tiene sentido validar sesión ni intentar el flujo de OAuth ahí.
    if (!isFirebaseConfigured || isUnsupportedBrowser) {
      setIsLoading(false)
      return () => {}
    }

    // Completa el login si el usuario volvió de un signInWithRedirect
    // (flujo usado en navegadores embebidos, ej. webviews de Instagram/Facebook).
    completeGoogleRedirectSignIn()

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
   }, [isUnsupportedBrowser])
 
   const handleGoogleLogin = async () => {
     setIsSigningIn(true)
     try {
       await signInWithGoogle()
     } finally {
       setIsSigningIn(false)
     }
   }

   const handleCopyUrl = async () => {
     try {
       await navigator.clipboard.writeText(window.location.href)
       setIsCopied(true)
       setTimeout(() => setIsCopied(false), 2000)
     } catch (error) {
       console.error('No se pudo copiar la URL.', error)
     }
   }

   if (isUnsupportedBrowser) {
     return (
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <PizarraBackground />
        <div className="max-w-lg w-full card p-8 text-center">
          <h1 className="font-chalk text-2xl mb-3 text-paper">Abrí esta app en un navegador externo</h1>
          <p className="text-muted mb-6">
            El login con Google no funciona en el navegador integrado de Cursor: por seguridad, esa herramienta bloquea las ventanas emergentes y el flujo de autenticación de Google. No es un error de la app, es una limitación conocida de Cursor.
          </p>
          <p className="text-muted mb-6">
            Copiá esta URL y abrila en Chrome, Safari o Firefox para iniciar sesión sin problemas.
          </p>
          <button
            onClick={handleCopyUrl}
            className="btn-primary w-full px-4 py-3 flex items-center justify-center gap-2"
          >
            {isCopied ? 'URL copiada ✓' : 'Copiar URL'}
          </button>
        </div>
      </div>
     )
   }

   if (isLoading) {
     return (
       <div className="relative min-h-screen flex items-center justify-center">
        <PizarraBackground />
        <LoadingSpinner text="Validando sesión…" />
       </div>
     )
   }
 
   if (!isFirebaseConfigured) {
     return (
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <PizarraBackground />
        <div className="max-w-lg w-full card p-8 text-center">
          <h1 className="font-chalk text-2xl mb-3 text-paper">Configuración requerida</h1>
           <p className="text-muted">
             Este entorno requiere autenticación con Google. Configura las variables <strong className="text-paper">VITE_FIREBASE_*</strong> para habilitar el acceso.
           </p>
         </div>
       </div>
     )
   }
 
   if (!user) {
     return (
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <PizarraBackground />
        <div className="max-w-md w-full card p-8">
          <p className="text-celeste text-xs font-mono-data uppercase tracking-widest mb-3">Portfolio personal</p>
          <h1 className="font-chalk text-3xl mb-2 text-paper">El Juri-Portfolio</h1>
           <p className="text-muted mb-8">Iniciá sesión con Google para acceder a tu portfolio desde cualquier dispositivo.</p>
 
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
