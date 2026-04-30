import { useEffect, useState } from 'react'
import { isFirebaseConfigured, signInWithGoogle, subscribeToAuthChanges } from '../config/firebase'
import LoadingSpinner from './LoadingSpinner'

export default function GoogleLoginGate({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningIn, setIsSigningIn] = useState(false)

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
     try {
       await signInWithGoogle()
     } finally {
       setIsSigningIn(false)
     }
   }
 
   if (isLoading) {
     return (
       <div className="bg-slate-50 min-h-screen text-slate-800 flex items-center justify-center">
         <LoadingSpinner text="Validando sesión..." />
       </div>
     )
   }
 
   if (!isFirebaseConfigured) {
     return (
       <div className="bg-slate-50 min-h-screen text-slate-800 flex items-center justify-center px-4">
         <div className="max-w-lg w-full bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
           <h1 className="text-2xl font-bold mb-3 text-slate-800">Configuración Firebase requerida</h1>
           <p className="text-slate-500">
             Este entorno requiere autenticación con Google. Configura las variables <strong>VITE_FIREBASE_*</strong> para habilitar el acceso.
           </p>
         </div>
       </div>
     )
   }
 
   if (!user) {
     return (
       <div className="bg-slate-50 min-h-screen text-slate-800 flex items-center justify-center px-4">
         <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
           <h1 className="text-3xl font-bold mb-2 text-indigo-500">El Juri-Portfolio</h1>
           <p className="text-slate-500 mb-6">Inicia sesión con Google para acceder a tu portfolio desde cualquier dispositivo.</p>
 
           <button
             onClick={handleGoogleLogin}
             disabled={isSigningIn}
             className="w-full px-4 py-3 bg-indigo-500 text-white hover:bg-indigo-600 rounded-lg font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
           >
             <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
               <path fill="currentColor" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 4 1.5l2.7-2.6C17 3.3 14.8 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.5H12z" />
             </svg>
             {isSigningIn ? 'Iniciando sesión...' : 'Continuar con Google'}
           </button>
 
           <p className="text-xs text-slate-400 mt-4">
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
