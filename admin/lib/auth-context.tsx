'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { auth } from './firebase-client'

interface AuthContextValue {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  async function signInWithGoogle() {
    const result = await signInWithPopup(auth, new GoogleAuthProvider())
    const u = result.user

    const db = getFirestore()
    const snap = await getDoc(doc(db, 'users', u.uid))
    if (!snap.exists() || snap.data()?.role !== 'admin') {
      await signOut(auth)
      throw new Error('Yetkisiz erişim: Bu hesabın admin rolü yok.')
    }

    const idToken = await u.getIdToken()
    const res = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    })
    if (!res.ok) {
      await signOut(auth)
      throw new Error('Sunucu oturumu oluşturulamadı.')
    }
  }

  async function logout() {
    await signOut(auth)
    await fetch('/api/auth/session', { method: 'DELETE' })
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
