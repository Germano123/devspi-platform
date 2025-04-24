import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Default configuration for development/testing
const defaultConfig = {
  apiKey: "AIzaSyDummyKeyForDevEnvironment123456789",
  authDomain: "dev-environment.firebaseapp.com",
  projectId: "dev-environment",
  storageBucket: "dev-environment.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
}

// Get configuration from environment variables or use defaults
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || defaultConfig.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || defaultConfig.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || defaultConfig.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || defaultConfig.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || defaultConfig.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || defaultConfig.appId,
}

// Log configuration status (without exposing sensitive values)
console.log("Firebase config status:", {
  apiKeyProvided: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomainProvided: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectIdProvided: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  usingDefaults: !process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
})

// Initialize Firebase safely
let app, auth, db, storage

try {
  // Initialize Firebase
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
} catch (error) {
  console.error("Firebase initialization error:", error)

  // Create mock implementations for development/testing
  app = null
  auth = {
    onAuthStateChanged: (callback) => {
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
