import { ClipboardCheck, PackageSearch, ShieldCheck, Store, Truck, UserRound } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useAuth } from '../context/AuthContext'
import { Role } from '../types'
import { BuyerDashboardPage } from './BuyerDashboardPage'

const roleConfig: Record<
  Role,
  { icon: typeof UserRound; title: string; summary: string; nextLevel: string[] }
> = {
  BUYER: {
    icon: UserRound,
    title: 'Buyer session',
    summary:
      'Buyer dapat mengelola wallet, keranjang, checkout voucher/promo, dan spending report pada Level 4.',
    nextLevel: ['Wallet', 'Cart', 'Checkout', 'Spending report'],
  },
  SELLER: {
    icon: Store,
    title: 'Seller session',
    summary:
      'Seller dapat membuat store, mengelola produk, memproses order, dan melihat income report pada Level 4.',
    nextLevel: ['Store management', 'Product CRUD', 'Order processing', 'Income report'],
  },
  DRIVER: {
    icon: Truck,
    title: 'Driver session',
    summary:
      'Driver sudah tersedia sebagai konteks sesi agar role marketplace lengkap sejak awal.',
    nextLevel: ['Active role selected', 'Driver context visible', 'Private actions hidden'],
  },
  ADMIN: {
    icon: ShieldCheck,
    title: 'Admin session',
    summary:
      'Admin dapat generate voucher dan promo untuk checkout buyer pada Level 4.',
    nextLevel: ['Voucher management', 'Promo management', 'Discount validation'],
  },
}

export function DashboardPage() {
  const { user, token } = useAuth()

  if (!user?.activeRole) return null

  if (user.activeRole === 'BUYER' && token) {
    return <BuyerDashboardPage token={token} />
  }

  if (user.activeRole === 'SELLER' && token) {
    return <Navigate to="/seller" replace />
  }

  if (user.activeRole === 'ADMIN' && token) {
    return <Navigate to="/admin" replace />
  }

  const config = roleConfig[user.activeRole]
  const Icon = config.icon

  return (
    <section className="page-shell py-10">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="overflow-hidden bg-ink text-white shadow-soft">
          <div className="relative min-h-[360px] p-6">
            <img
              src="https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=1200&q=85"
              alt="Marketplace workspace"
              className="absolute inset-0 h-full w-full object-cover opacity-25"
            />
            <div className="relative flex h-full min-h-[320px] flex-col justify-between">
              <Badge className="w-fit border-white/20 bg-white/15 text-white">
                Level 4 active role
              </Badge>
              <div>
                <Icon size={34} />
                <h1 className="mt-4 text-3xl font-bold">{config.title}</h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-100">{config.summary}</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid content-start gap-5">
          <Card className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-harbor">
                  Signed in as
                </p>
                <h2 className="mt-2 text-2xl font-bold text-ink">{user.displayName}</h2>
                <p className="mt-1 text-sm text-slate-600">@{user.username}</p>
              </div>
              <Badge className="w-fit border-emerald-100 bg-emerald-50 text-harbor">
                {user.activeRole}
              </Badge>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/products">
                <Button>
                  <PackageSearch size={16} />
                  Browse catalog
                </Button>
              </Link>
              <Link to="/choose-role">
                <Button variant="secondary">Switch role</Button>
              </Link>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3">
              <ClipboardCheck className="text-harbor" size={22} />
              <h2 className="text-lg font-bold text-ink">Level 4 boundary</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Dashboard ini sengaja hanya menjadi entry point role. Area privat sudah
              dipisahkan dari katalog publik, tetapi workflow operasional belum dibuka.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {config.nextLevel.map((item) => (
                <div key={item} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-bold text-ink">{item}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
