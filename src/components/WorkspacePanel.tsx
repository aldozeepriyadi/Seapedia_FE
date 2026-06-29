import { ReactNode } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut, Repeat2, Store, UserRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { showConfirm, showSuccess } from '../lib/alerts'
import { cn } from '../lib/cn'
import { Badge } from './ui/Badge'

type PanelNavItem = {
  to: string
  label: string
  icon: ReactNode
  meta?: string
}

type WorkspacePanelProps = {
  badge: string
  title: string
  subtitle: string
  navItems: PanelNavItem[]
  actions?: ReactNode
  children: ReactNode
}

export function WorkspacePanel({
  badge,
  title,
  subtitle,
  navItems,
  actions,
  children,
}: WorkspacePanelProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  async function handleLogout() {
    const confirmed = await showConfirm(
      'Yakin ingin logout?',
      'Sesi console akan ditutup dan kamu kembali ke halaman utama.',
      'Ya, logout',
    )

    if (!confirmed) return

    await logout()
    await showSuccess('Logout berhasil', 'Sesi kamu sudah ditutup.')
    navigate('/')
  }

  return (
    <section className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="bg-ink text-white shadow-soft lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
          <div className="border-b border-white/10 p-5">
            <Link to="/" className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-white text-ink">
                <Store size={20} />
              </span>
              <div>
                <p className="text-sm font-extrabold leading-none">SEAPEDIA</p>
                <p className="mt-1 text-xs font-semibold text-slate-300">{badge} Console</p>
              </div>
            </Link>
          </div>

          <nav className="grid gap-1 p-3">
            {navItems.map((item, index) =>
              item.to.startsWith('#') ? (
                <a
                  key={item.to}
                  href={item.to}
                  className={cn(
                    'flex items-center justify-between gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white',
                    index === 0 && 'bg-white text-ink hover:bg-white hover:text-ink',
                  )}
                >
                  <PanelNavContent item={item} />
                </a>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={() =>
                    cn(
                      'flex items-center justify-between gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white',
                      location.pathname === item.to &&
                        'bg-white text-ink hover:bg-white hover:text-ink',
                    )
                  }
                >
                  <PanelNavContent item={item} />
                </NavLink>
              ),
            )}
          </nav>

          <div className="mt-4 grid gap-3 border-t border-white/10 p-4">
            <div className="rounded-md bg-white/10 p-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-300">
                <LayoutDashboard size={14} />
                Admin panel UI
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-300">
                Sidebar, metrics, management table, dan action modal dalam satu workspace.
              </p>
            </div>
            <div className="rounded-md bg-white/10 p-3">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-md bg-white text-ink">
                  <UserRound size={15} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{user?.displayName ?? 'User'}</p>
                  <p className="truncate text-xs text-slate-300">@{user?.username ?? 'session'}</p>
                </div>
              </div>
              <div className="mt-3 grid gap-2">
                <Link
                  to="/choose-role"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-white/10 px-3 text-xs font-bold text-white transition hover:bg-white/20"
                >
                  <Repeat2 size={14} />
                  Switch role
                </Link>
                <Link
                  to="/profile"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-white/10 px-3 text-xs font-bold text-white transition hover:bg-white/20"
                >
                  <UserRound size={14} />
                  Profile
                </Link>
                <button
                  type="button"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-coral px-3 text-xs font-bold text-white transition hover:bg-red-600"
                  onClick={handleLogout}
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <Badge className="border-emerald-100 bg-emerald-50 text-harbor">
                  {badge}
                </Badge>
                <h1 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{subtitle}</p>
              </div>
              {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
            </div>
          </div>

          <div className="mt-6">{children}</div>
        </div>
      </div>
    </section>
  )
}

function PanelNavContent({ item }: { item: PanelNavItem }) {
  return (
    <>
      <span className="flex min-w-0 items-center gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-white/10 text-current">
          {item.icon}
        </span>
        <span className="truncate">{item.label}</span>
      </span>
      {item.meta && <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs">{item.meta}</span>}
    </>
  )
}
