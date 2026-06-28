/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { apiFetch } from '../lib/api'
import { AuthResponse, Role, User } from '../types'

type RegisterPayload = {
  username: string
  displayName: string
  password: string
  roles: Role[]
}

type AuthContextValue = {
  user: User | null
  token: string | null
  loading: boolean
  login: (username: string, password: string) => Promise<AuthResponse>
  register: (payload: RegisterPayload) => Promise<AuthResponse>
  selectRole: (role: Role) => Promise<User>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)
const storageKey = 'seapedia_token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(storageKey))
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(Boolean(token))

  const saveSession = useCallback((nextToken: string, nextUser: User) => {
    localStorage.setItem(storageKey, nextToken)
    setToken(nextToken)
    setUser(nextUser)
  }, [])

  const clearSession = useCallback(() => {
    localStorage.removeItem(storageKey)
    setToken(null)
    setUser(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const response = await apiFetch<{ user: User }>('/auth/me', { token })
      setUser(response.user)
    } catch {
      clearSession()
    } finally {
      setLoading(false)
    }
  }, [clearSession, token])

  useEffect(() => {
    refreshProfile()
  }, [refreshProfile])

  const login = useCallback(
    async (username: string, password: string) => {
      const response = await apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
      saveSession(response.token, response.user)
      return response
    },
    [saveSession],
  )

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const response = await apiFetch<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      saveSession(response.token, response.user)
      return response
    },
    [saveSession],
  )

  const selectRole = useCallback(
    async (role: Role) => {
      const response = await apiFetch<{ token: string; user: User }>('/auth/select-role', {
        method: 'POST',
        token,
        body: JSON.stringify({ role }),
      })
      saveSession(response.token, response.user)
      return response.user
    },
    [saveSession, token],
  )

  const logout = useCallback(async () => {
    if (token) {
      await apiFetch('/auth/logout', { method: 'POST', token }).catch(() => null)
    }
    clearSession()
  }, [clearSession, token])

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      selectRole,
      logout,
      refreshProfile,
    }),
    [loading, login, logout, refreshProfile, register, selectRole, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
