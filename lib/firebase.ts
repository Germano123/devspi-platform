import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app"
import { Auth, confirmPasswordReset, getAuth } from "firebase/auth"
import { Firestore, getFirestore } from "firebase/firestore"
import { FirebaseStorage, getStorage } from "firebase/storage"

// Get configuration from environment variables or use defaults
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Log configuration status (without exposing sensitive values)
console.info("Firebase config status:", {
  apiKeyProvided: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomainProvided: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectIdProvided: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  usingDefaults: !process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
})

// Initialize Firebase safely 
let app: FirebaseApp | null, auth: Auth, db: Firestore, storage: FirebaseStorage

try {
  // Initialize Firebase
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
  // console.info("Firebase configured");
} catch (error) {
  console.error("Firebase initialization error:", error)

  // Create mock implementations for development/testing
  app = null
  auth = {
    onAuthStateChanged: (callback: any) => {
      callback(null)
      return () => {}
    },
    signInWithEmailAndPassword: () => Promise.resolve({}),
    createUserWithEmailAndPassword: () => Promise.resolve({}),
    signOut: () => Promise.resolve(),
  } as any
  db = {
    collection: () => ({
      doc: () => ({
        set: () => Promise.resolve(),
        get: () => Promise.resolve({ exists: () => false, data: () => ({}) }),
        delete: () => Promise.resolve(),
      }),
    }),
    doc: () => ({
      set: () => Promise.resolve(),
      get: () => Promise.resolve({ exists: () => false, data: () => ({}) }),
      delete: () => Promise.resolve(),
    }),
  } as any
  storage = {} as any
}

export { app, auth, db, storage }
