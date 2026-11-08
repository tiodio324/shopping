import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.ts'
import { authErrorMessage } from '../utils/errors.ts'
import { CategoryMark } from './CategoryMark.tsx'
import { ThemeToggle } from './ThemeToggle.tsx'

export function Header() {
  const { user, logOut } = useAuth()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleLogout() {
    if (!window.confirm('Выйти из аккаунта?')) return
    void (async () => {
      setPending(true)
      setError(null)
      try {
        await logOut()
      } catch (caught) {
        setError(authErrorMessage(caught))
      } finally {
        setPending(false)
      }
    })()
  }

  return (
    <header className="topbar">
      <div className="brand">
        <CategoryMark name="Шоппинг" />
        <h1>Шоппинг</h1>
      </div>
      <div className="topbar-actions">
        {user?.email && <span className="email" title={user.email}>{user.email}</span>}
        <ThemeToggle />
        <button type="button" className="button button-ghost" onClick={handleLogout} disabled={pending}>
          {pending ? 'Выходим…' : 'Выйти'}
        </button>
      </div>
      {error && <p className="banner topbar-error" role="alert">{error}</p>}
    </header>
  )
}
