function readCode(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string') {
    return error.code
  }
  return ''
}

function readMessage(error: unknown): string {
  return error instanceof Error ? error.message : ''
}

export function authErrorMessage(error: unknown): string {
  switch (readCode(error)) {
    case 'auth/invalid-email':
    case 'auth/missing-email':
      return 'Некорректная почта.'
    case 'auth/weak-password':
    case 'auth/missing-password':
      return 'Пароль короче 6 символов.'
    case 'auth/email-already-in-use':
      return 'Этот email уже занят.'
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Неверная почта или пароль.'
    case 'auth/too-many-requests':
      return 'Слишком много попыток.'
    case 'auth/network-request-failed':
      return 'Нет сети.'
    default:
      return 'Ошибка входа.'
  }
}

export function catalogErrorMessage(error: unknown): string {
  const code = readCode(error)
  const message = readMessage(error)
  if (code === 'PERMISSION_DENIED' || code === 'permission-denied' || message.includes('PERMISSION_DENIED')) {
    return 'Нет доступа к базе.'
  }
  if (code === 'NETWORK_ERROR' || code === 'unavailable' || message.includes('network')) {
    return 'Нет сети.'
  }
  if (error instanceof Error && error.message && !code) return error.message
  return 'Не удалось сохранить.'
}
