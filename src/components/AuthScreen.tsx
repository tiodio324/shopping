import { useState, type FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth.ts'
import { authErrorMessage } from '../utils/errors.ts'
import { CategoryMark } from './CategoryMark.tsx'
import { ThemeToggle } from './ThemeToggle.tsx'

type AuthMode = 'login' | 'register'

export function AuthScreen() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  function switchMode(next: AuthMode) {
    setMode(next)
    setError(null)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextEmail = email.trim()
    const nextPassword = password
    void (async () => {
      setPending(true)
      setError(null)
      try {
        if (mode === 'login') await signIn(nextEmail, nextPassword)
        else await signUp(nextEmail, nextPassword)
      } catch (caught) {
        setError(authErrorMessage(caught))
      } finally {
        setPending(false)
      }
    })()
  }

  const submitLabel = pending
    ? (mode === 'login' ? 'Входим…' : 'Создаём…')
    : (mode === 'login' ? 'Войти' : 'Создать аккаунт')

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-head">
          <div className="brand">
            <CategoryMark name="Шоппинг" />
            <h1>Шоппинг</h1>
          </div>
          <ThemeToggle />
        </div>
        <div className="mode-switch" role="tablist" aria-label="Способ входа">
          <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'is-active' : undefined} onClick={() => switchMode('login')}>
            Вход
          </button>
          <button type="button" role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'is-active' : undefined} onClick={() => switchMode('register')}>
            Регистрация
          </button>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Почта</span>
            <input
              name="email"
              type="text"
              inputMode="email"
              autoComplete="email"
              spellCheck={false}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={pending}
            />
          </label>
          <label className="field">
            <span>Пароль</span>
            <input
              name="password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={pending}
            />
          </label>
          {error && <p className="banner" role="alert">{error}</p>}
          <button type="submit" className="button button-primary" disabled={pending}>
            {submitLabel}
          </button>
        </form>
      </section>
    </main>
  )
}
