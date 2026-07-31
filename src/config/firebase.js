const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean)

let app = null
let db = null
let auth = null
let firestoreApi = null
let authApi = null
let initPromise = null

async function initializeFirebase() {
  if (!isFirebaseConfigured) return null
  if (db && auth && firestoreApi && authApi) {
    return { db, auth, ...firestoreApi, ...authApi }
  }

  if (initPromise) return initPromise

  initPromise = Promise.all([
    import('firebase/app'),
    import('firebase/firestore'),
    import('firebase/auth')
  ])
    .then(([appModule, firestoreModule, authModule]) => {
      app = app || appModule.initializeApp(firebaseConfig)
      db = db || firestoreModule.getFirestore(app)
      auth = auth || authModule.getAuth(app)

      firestoreApi = {
        doc: firestoreModule.doc,
        collection: firestoreModule.collection,
        getDoc: firestoreModule.getDoc,
        getDocFromServer: firestoreModule.getDocFromServer,
        getDocs: firestoreModule.getDocs,
        addDoc: firestoreModule.addDoc,
        deleteDoc: firestoreModule.deleteDoc,
        query: firestoreModule.query,
        orderBy: firestoreModule.orderBy,
        limit: firestoreModule.limit,
        onSnapshot: firestoreModule.onSnapshot,
        serverTimestamp: firestoreModule.serverTimestamp,
        setDoc: firestoreModule.setDoc
      }

      authApi = {
        GoogleAuthProvider: authModule.GoogleAuthProvider,
        onAuthStateChanged: authModule.onAuthStateChanged,
        signInWithPopup: authModule.signInWithPopup,
        signInWithRedirect: authModule.signInWithRedirect,
        getRedirectResult: authModule.getRedirectResult,
        signOut: authModule.signOut
      }

      return { db, auth, ...firestoreApi, ...authApi }
    })
    .catch((error) => {
      initPromise = null
      console.error('No se pudo inicializar Firebase. Se usara persistencia local.', error)
      return null
    })

  return initPromise
}

export async function getFirestoreClient() {
  const firebase = await initializeFirebase()
  if (!firebase) return null

  return {
    db: firebase.db,
    doc: firebase.doc,
    collection: firebase.collection,
    getDoc: firebase.getDoc,
    getDocFromServer: firebase.getDocFromServer,
    getDocs: firebase.getDocs,
    addDoc: firebase.addDoc,
    deleteDoc: firebase.deleteDoc,
    query: firebase.query,
    orderBy: firebase.orderBy,
    limit: firebase.limit,
    onSnapshot: firebase.onSnapshot,
    serverTimestamp: firebase.serverTimestamp,
    setDoc: firebase.setDoc
  }
}

export async function subscribeToAuthChanges(callback) {
  const firebase = await initializeFirebase()
  if (!firebase?.auth || !firebase.onAuthStateChanged) return () => {}

  return firebase.onAuthStateChanged(firebase.auth, callback)
}

// El navegador embebido de Cursor es un webview de Electron sandboxeado que
// bloquea window.open() y además descarta el almacenamiento necesario para
// completar signInWithRedirect al volver de Google. No hay forma de resolver
// esto sin debilitar protecciones de seguridad del sandbox o de Google OAuth,
// así que en este entorno no se intenta el login: se le pide al usuario que
// abra la app en un navegador externo.
export function isCursorEmbeddedBrowser() {
  const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent || ''
  return /\bCursor\/\d/i.test(ua)
}

// Otros webviews embebidos (apps de Instagram/Facebook, Line, etc.) también
// rechazan signInWithPopup ("disallowed_useragent") pero sí completan
// correctamente el flujo de signInWithRedirect.
function isOtherEmbeddedBrowser() {
  const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent || ''
  return /wv|FBAN|FBAV|Instagram|Line\//i.test(ua)
}

const POPUP_FALLBACK_ERROR_CODES = new Set([
  'auth/popup-blocked',
  'auth/operation-not-supported-in-this-environment',
  'auth/cancelled-popup-request',
  'auth/popup-closed-by-user'
])

export async function signInWithGoogle() {
  if (isCursorEmbeddedBrowser()) {
    const error = new Error('El login con Google no está disponible en el navegador integrado de Cursor.')
    error.code = 'AUTH_UNSUPPORTED_BROWSER'
    throw error
  }

  const firebase = await initializeFirebase()
  if (!firebase?.auth || !firebase.GoogleAuthProvider || !firebase.signInWithPopup) return null

  const provider = new firebase.GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })

  if (isOtherEmbeddedBrowser() && firebase.signInWithRedirect) {
    await firebase.signInWithRedirect(firebase.auth, provider)
    return null
  }

  try {
    const result = await firebase.signInWithPopup(firebase.auth, provider)
    return result.user || null
  } catch (error) {
    const shouldFallbackToRedirect =
      firebase.signInWithRedirect && POPUP_FALLBACK_ERROR_CODES.has(error?.code)

    if (shouldFallbackToRedirect) {
      try {
        await firebase.signInWithRedirect(firebase.auth, provider)
        return null
      } catch (redirectError) {
        console.error('No se pudo iniciar sesion con Google (redirect).', redirectError)
        return null
      }
    }

    console.error('No se pudo iniciar sesion con Google.', error)
    return null
  }
}

// Debe llamarse al iniciar la app para completar el login cuando el usuario
// vuelve de un signInWithRedirect (flujo usado en navegadores embebidos).
export async function completeGoogleRedirectSignIn() {
  const firebase = await initializeFirebase()
  if (!firebase?.auth || !firebase.getRedirectResult) return null

  try {
    const result = await firebase.getRedirectResult(firebase.auth)
    return result?.user || null
  } catch (error) {
    console.error('No se pudo completar el inicio de sesion con Google (redirect).', error)
    return null
  }
}

export async function signOutGoogle() {
  const firebase = await initializeFirebase()
  if (!firebase?.auth || !firebase.signOut) return

  try {
    await firebase.signOut(firebase.auth)
  } catch (error) {
    console.error('No se pudo cerrar sesion de Google.', error)
  }
}
