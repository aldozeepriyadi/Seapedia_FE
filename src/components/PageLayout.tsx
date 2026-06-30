import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Navbar } from './Navbar'

export function PageLayout() {
  const { user } = useAuth()
  const location = useLocation()
  const isWorkspaceDashboard =
    (location.pathname === '/dashboard' &&
      (user?.activeRole === 'ADMIN' || user?.activeRole === 'SELLER')) ||
    (location.pathname.startsWith('/admin') && user?.activeRole === 'ADMIN') ||
    (location.pathname.startsWith('/seller') && user?.activeRole === 'SELLER')

  if (isWorkspaceDashboard) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main>
          <Outlet />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="page-shell flex flex-col gap-2 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>SEAPEDIA Level 5 marketplace revision</p>
          <p>Voucher, promo, PPN 12%, delivery jobs, driver earnings, and tracking</p>
        </div>
      </footer>
    </div>
  )
}
