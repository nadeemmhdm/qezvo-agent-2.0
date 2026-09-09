import { initializeApp, getApps } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  connectAuthEmulator,
} from 'firebase/auth'

function cleanConfig(val: string | undefined, fallback: string): string {
  if (!val || val.includes('[sensitive]') || val.includes('[SENSITIVE]') || val.trim() === '') {
    return fallback
  }
  return val.trim()
}

const firebaseConfig = {
  apiKey: cleanConfig(import.meta.env['VITE_FIREBASE_API_KEY'], ''),
  authDomain: cleanConfig(import.meta.env['VITE_FIREBASE_AUTH_DOMAIN'], ''),
  projectId: cleanConfig(import.meta.env['VITE_FIREBASE_PROJECT_ID'], ''),
  storageBucket: cleanConfig(import.meta.env['VITE_FIREBASE_STORAGE_BUCKET'], ''),
  messagingSenderId: cleanConfig(import.meta.env['VITE_FIREBASE_MESSAGING_SENDER_ID'], ''),
  appId: cleanConfig(import.meta.env['VITE_FIREBASE_APP_ID'], ''),
}

// Validate required config — provides a clear error instead of a silent failure
const missingKeys = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => k)

export const firebaseConfigError: string | null =
  missingKeys.length > 0
    ? `Firebase configuration is incomplete. Missing: ${missingKeys.join(', ')}.\nCopy .env.example to .env and fill in your Firebase credentials.`
    : null

// Prevent duplicate initialization (HMR safe)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]!

export const auth = getAuth(app)

// Use emulator in development if configured
if (import.meta.env['VITE_USE_FIREBASE_EMULATOR'] === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
}

// OAuth providers
export const googleProvider = new GoogleAuthProvider()
googleProvider.addScope('email')
googleProvider.addScope('profile')
googleProvider.setCustomParameters({ prompt: 'select_account' })

export const githubProvider = new GithubAuthProvider()
githubProvider.addScope('user:email')

export default app
