import { useCallback, useMemo, useState } from 'react'
import { logout } from '../api/auth.js'
import { AuthContext } from './AuthContext.js'
import { clearSession, getSession, saveSession } from './session.js'

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getSession())

  const signIn = useCallback((nextUser) => {
    const session = {
      token: nextUser.token,
      nombre: nextUser.nombre ?? '',
      rol: nextUser.rol ?? '',
      loginAt: new Date().toISOString(),
    }

    saveSession(session)
    setUser(session)
    return session
  }, [])

  const signOut = useCallback(async () => {
    const session = getSession()

    try {
      if (session?.token) {
        await logout(session.token)
      }
    } catch {
      setUser(null)
    }

    clearSession()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, token: user?.token ?? null, signIn, signOut }),
    [user, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
