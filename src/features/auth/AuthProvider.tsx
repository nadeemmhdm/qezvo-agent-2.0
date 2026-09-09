import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  type User as FirebaseUser,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile,
  reload,
  sendEmailVerification,
  type AuthError,
} from 'firebase/auth'
import { auth, googleProvider, githubProvider } from '@/lib/firebase'
import { apiPost } from '@/lib/api'
import { sendWelcomeEmail } from '@/features/email/smtpService'

// ---- Auth Context ----
interface AuthContextValue {
  user: FirebaseUser | null
  loading: boolean
  isAuthenticated: boolean
  isVerified: boolean
  // Actions
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGitHub: () => Promise<void>
  signOut: () => Promise<void>
  sendVerificationEmail: () => Promise<void>
  refreshVerificationStatus: () => Promise<void>
  sendPasswordReset: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ---- Helper to map Firebase auth errors ----
function mapAuthError(error: AuthError): string {
  const codes: Record<string, string> = {
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password is too weak. Please choose a stronger password.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/too-many-requests': 'Too many failed attempts. Please wait a few minutes and try again.',
    'auth/network-request-failed': 'Network error. Please check your connection and try again.',
    'auth/popup-blocked': 'Popup was blocked by your browser. Please allow popups for this site.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    'auth/cancelled-popup-request': 'Only one sign-in popup can be open at a time.',
    'auth/account-exists-with-different-credential':
      'An account already exists with this email using a different sign-in method.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',
    'auth/requires-recent-login': 'Please sign out and sign in again to complete this action.',
    'auth/expired-action-code': 'This link has expired. Please request a new one.',
    'auth/invalid-action-code': 'This link is invalid or has already been used.',
  }
  return codes[error.code] ?? `Authentication error: ${error.message}`
}

// ---- Provider ----
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  // Sync user with backend on first login
  useEffect(() => {
    if (user && user.emailVerified) {
      user.getIdToken().then(() => {
        apiPost('/users/sync', {}).catch(() => {
          // Non-fatal — user record will be synced on next request
        })
      })
    }
  }, [user?.uid, user?.emailVerified])

  const signInWithEmail = async (email: string, password: string): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      throw new Error(mapAuthError(error as AuthError))
    }
  }

  const signUpWithEmail = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<void> => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, { displayName: fullName })
      
      // 1. Send official Firebase Email Verification
      try {
        await sendEmailVerification(cred.user)
        console.log('[Firebase Auth] Verification email sent to:', email)
      } catch (verErr) {
        console.warn('[Firebase Auth] Verification email dispatch notice:', verErr)
      }

      // 2. Send first-time welcome email using Hostinger SMTP (team@qezvo.in) in background
      sendWelcomeEmail({ to: email, name: fullName }).catch((err) => {
        console.warn('Hostinger SMTP welcome mail notice:', err)
      })
    } catch (error) {
      throw new Error(mapAuthError(error as AuthError))
    }
  }

  const signInWithGoogle = async (): Promise<void> => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      throw new Error(mapAuthError(error as AuthError))
    }
  }

  const signInWithGitHub = async (): Promise<void> => {
    try {
      await signInWithPopup(auth, githubProvider)
    } catch (error) {
      throw new Error(mapAuthError(error as AuthError))
    }
  }

  const handleSignOut = async (): Promise<void> => {
    await signOut(auth)
  }

  const sendVerificationEmail = async (): Promise<void> => {
    const currentUser = auth.currentUser || user
    if (!currentUser) throw new Error('No user signed in')
    try {
      await sendEmailVerification(currentUser)
      console.log('[Firebase Auth] Verification email resent to:', currentUser.email)
    } catch (error) {
      throw new Error(mapAuthError(error as AuthError))
    }
  }

  const refreshVerificationStatus = async (): Promise<void> => {
    const currentUser = auth.currentUser || user
    if (!currentUser) return
    await reload(currentUser)
    setUser(auth.currentUser ? ({ ...auth.currentUser } as unknown as FirebaseUser) : null)
  }

  const handleSendPasswordReset = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${import.meta.env['VITE_APP_URL']}/login`,
      })
    } catch (error) {
      throw new Error(mapAuthError(error as AuthError))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isVerified: !!user?.emailVerified,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithGitHub,
        signOut: handleSignOut,
        sendVerificationEmail,
        refreshVerificationStatus,
        sendPasswordReset: handleSendPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ---- Hook ----
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
