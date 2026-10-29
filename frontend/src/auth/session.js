const SESSION_KEY = 'vj-session'

export function getSession() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (!raw) {
      return null
    }

    const session = JSON.parse(raw)
    if (!session || typeof session.token !== 'string' || !session.token) {
      return null
    }

    return session
  } catch {
    return null
  }
}

export function saveSession(session) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY)
}
