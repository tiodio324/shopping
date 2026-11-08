import { AuthProvider } from './auth/AuthProvider.tsx'
import { AuthScreen } from './components/AuthScreen.tsx'
import { Cabinet } from './components/Cabinet.tsx'
import { useAuth } from './hooks/useAuth.ts'
import { ThemeProvider } from './theme/ThemeProvider.tsx'

function Gate() {
  const { ready, user } = useAuth()
  if (!ready) return <p className="boot">Загрузка…</p>
  if (!user) return <AuthScreen />
  return <Cabinet />
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </ThemeProvider>
  )
}
