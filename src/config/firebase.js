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

export async function signInWithGoogle() {
  const firebase = await initializeFirebase()
  if (!firebase?.auth || !firebase.GoogleAuthProvider || !firebase.signInWithPopup) return null

  const provider = new firebase.GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })

  try {
    const result = await firebase.signInWithPopup(firebase.auth, provider)
    return result.user || null
  } catch (error) {
    console.error('No se pudo iniciar sesion con Google.', error)
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
