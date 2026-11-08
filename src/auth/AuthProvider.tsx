import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth'
import { AuthContext } from './auth-context.ts'
import { auth, authReady } from '../utils/firebase.ts'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => onAuthStateChanged(auth, (next) => {
    setUser(next)
    setReady(true)
  }), [])

  const signIn = useCallback(async (email: string, password: string) => {
    await authReady
    await signInWithEmailAndPassword(auth, email, password)
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    await authReady
    await createUserWithEmailAndPassword(auth, email, password)
  }, [])

  const logOut = useCallback(async () => {
    await authReady
    await signOut(auth)
  }, [])

  const value = useMemo(() => ({
    ready,
    user,
    signIn,
    signUp,
    logOut,
  }), [ready, user, signIn, signUp, logOut])

  return <AuthContext value={value}>{children}</AuthContext>
}
