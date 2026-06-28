import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="page-shell py-16 text-sm text-slate-600">Memuat sesi...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!user.activeRole && location.pathname !== '/choose-role') {
    return <Navigate to="/choose-role" replace />
  }

  return <Outlet />
}

export function RedirectIfAuthed() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="page-shell py-16 text-sm text-slate-600">Memuat sesi...</div>
  }

  if (!user) return <Outlet />

  if (!user.activeRole) return <Navigate to="/choose-role" replace />

  return <Navigate to="/dashboard" replace />
}
