import { LayoutDashboard, Menu, PackageSearch, Store, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { showConfirm, showSuccess } from '../lib/alerts'
import { cn } from '../lib/cn'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    const confirmed = await showConfirm(
      'Yakin ingin logout?',
      'Sesi kamu akan ditutup dan kamu akan kembali ke halaman utama.',
      'Ya, logout',
    )

    if (!confirmed) return

    await logout()
    await showSuccess('Logout berhasil', 'Sesi kamu sudah ditutup.')
    setOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="page-shell flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-ink">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-ink text-white">
            <Store size={19} />
          </span>
          <span>SEAPEDIA</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-ink',
                  isActive && 'bg-slate-100 text-ink',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
          <a
            href="/#reviews"
            className="rounded-md px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-ink"
          >
            Reviews
          </a>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Badge className="gap-1 border-emerald-100 bg-emerald-50 text-harbor">
                <UserRound size={13} />
                {user.activeRole ?? 'Pilih role'}
              </Badge>
              <Button
                variant="secondary"
                onClick={() => navigate(user.activeRole ? '/dashboard' : '/choose-role')}
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Button>
              <Button variant="ghost" onClick={() => navigate('/profile')}>
                Profile
              </Button>
              <Button variant="danger" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button onClick={() => navigate('/register')}>Register</Button>
            </>
          )}
        </div>

        <button
          aria-label="Toggle navigation"
          className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white md:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="page-shell grid gap-2 py-4">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <a
              href="/#reviews"
              className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              onClick={() => setOpen(false)}
            >
              Reviews
            </a>
            {user ? (
              <>
                <Link
                  to={user.activeRole ? '/dashboard' : '/choose-role'}
                  className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  onClick={() => setOpen(false)}
                >
                  Profile
                </Link>
                <Button variant="danger" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button onClick={() => navigate('/register')}>Register</Button>
              </div>
            )}
            <div className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
              <PackageSearch size={14} />
              Level 2 marketplace foundation
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
