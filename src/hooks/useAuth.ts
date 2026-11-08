import { useContext } from 'react'
import { AuthContext, type AuthContextValue } from '../auth/auth-context.ts'

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('Авторизация доступна только внутри AuthProvider')
  return value
}
