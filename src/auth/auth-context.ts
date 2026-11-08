import { createContext } from 'react'
import type { User } from 'firebase/auth'

export interface AuthContextValue {
  ready: boolean
  user: User | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  logOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
