import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app"
import { Auth, getAuth } from "firebase/auth"
import { Firestore, getFirestore } from "firebase/firestore"
import { FirebaseStorage, getStorage } from "firebase/storage"

// Get configuration from environment variables or use defaults
const firebaseConfig = {
  apiKey: "AIzaSyDOYDJRzpdbBkRSfbI55CBV7sMnNjV2_DQ",
  authDomain: "devspi-dev.firebaseapp.com",
  projectId: "devspi-dev",
  storageBucket: "devspi-dev.firebasestorage.app",
  messagingSenderId:"842738876511",
  appId: "1:842738876511:web:56c8f21660cf8ce65b9bea",
  measuermentId: "G-K8NNC00XS6",
}

// console.info("Configuring Firebase...")

// Initialize Firebase safely 
let app: FirebaseApp | null, auth: Auth, db: Firestore, storage: FirebaseStorage

try {
  // Initialize Firebase
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
  // console.info("Firebase configured!");
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
