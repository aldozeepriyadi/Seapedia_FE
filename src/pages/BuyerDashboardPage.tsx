import { FormEvent, ReactNode, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgePercent, CreditCard, PackageCheck, ReceiptText, RefreshCw, ShoppingCart } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { apiFetch } from '../lib/api'
import { showError, showSuccess } from '../lib/alerts'
import { formatPrice } from '../lib/format'
import { BuyerReport, CartSummary, OrderSummary, WalletSummary } from '../types'

export function BuyerDashboardPage({ token }: { token: string }) {
  const [wallet, setWallet] = useState<WalletSummary | null>(null)
  const [cart, setCart] = useState<CartSummary | null>(null)
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [report, setReport] = useState<BuyerReport | null>(null)
  const [topUpAmount, setTopUpAmount] = useState(250000)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function loadBuyerData() {
    setLoading(true)
    setError('')

    try {
      const [walletResponse, cartResponse, orderResponse, reportResponse] = await Promise.all([
        apiFetch<{ wallet: WalletSummary }>('/buyer/wallet', { token }),
        apiFetch<{ cart: CartSummary }>('/buyer/cart', { token }),
        apiFetch<{ orders: OrderSummary[] }>('/buyer/orders', { token }),
        apiFetch<{ report: BuyerReport }>('/buyer/reports/summary', { token }),
      ])

      setWallet(walletResponse.wallet)
      setCart(cartResponse.cart)
      setOrders(orderResponse.orders)
      setReport(reportResponse.report)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat dashboard buyer.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBuyerData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function handleTopUp(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const response = await apiFetch<{ wallet: WalletSummary }>('/buyer/wallet/top-up', {
        method: 'POST',
        token,
        body: JSON.stringify({ amount: topUpAmount }),
      })
      setWallet(response.wallet)
      await showSuccess('Top-up berhasil', 'Saldo wallet sudah masuk ke database.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Top-up gagal.'
      setError(message)
      await showError('Top-up gagal', message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="page-shell py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge className="border-emerald-100 bg-emerald-50 text-harbor">
            Level 4 Buyer Report
          </Badge>
          <h1 className="mt-3 text-3xl font-bold text-ink">Buyer dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Wallet, keranjang, order history, dan ringkasan spending buyer dari checkout.
          </p>
        </div>
        <Button variant="secondary" onClick={loadBuyerData}>
          <RefreshCw size={16} />
          Refresh
        </Button>
      </div>

      {error && <p className="mt-6 text-sm font-semibold text-red-600">{error}</p>}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        <Metric icon={<CreditCard size={20} />} label="Wallet" value={formatPrice(wallet?.balance ?? 0)} />
        <Metric icon={<ShoppingCart size={20} />} label="Cart subtotal" value={formatPrice(cart?.subtotal ?? 0)} />
        <Metric icon={<ReceiptText size={20} />} label="Orders" value={String(report?.orderCount ?? 0)} />
        <Metric icon={<PackageCheck size={20} />} label="Total spending" value={formatPrice(report?.totalSpending ?? 0)} />
        <Metric icon={<BadgePercent size={20} />} label="Discount saved" value={formatPrice(report?.totalDiscount ?? 0)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="p-5 shadow-soft">
          <h2 className="text-lg font-bold text-ink">Wallet top-up</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Saldo wallet dipakai untuk membayar checkout.
          </p>
          <form className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={handleTopUp}>
            <Input
              type="number"
              min={1000}
              value={topUpAmount}
              onChange={(event) => setTopUpAmount(Number(event.target.value))}
            />
            <Button disabled={submitting}>{submitting ? 'Memproses...' : 'Top-up'}</Button>
          </form>

          <div className="mt-5 grid gap-3">
            {(wallet?.transactions ?? []).slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-ink">{item.type}</p>
                  <p className={item.amount < 0 ? 'text-sm font-bold text-coral' : 'text-sm font-bold text-harbor'}>
                    {formatPrice(item.amount)}
                  </p>
                </div>
                <p className="mt-1 text-xs text-slate-500">{item.description}</p>
              </div>
            ))}
            {!wallet?.transactions.length && (
              <p className="text-sm text-slate-600">Belum ada transaksi wallet.</p>
            )}
          </div>
        </Card>

        <Card className="overflow-hidden shadow-soft">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink">Order history</h2>
              <p className="text-sm text-slate-600">Order dibuat dari checkout single-store.</p>
            </div>
            <Link to="/keranjang">
              <Button variant="secondary">
                <ShoppingCart size={16} />
                Open cart
              </Button>
            </Link>
          </div>
          {loading ? (
            <div className="p-5 text-sm text-slate-600">Memuat data buyer...</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {orders.map((order) => (
                <div key={order.id} className="grid gap-3 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-ink">{order.storeName}</p>
                      <Badge>{order.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {new Date(order.createdAt).toLocaleString('id-ID')} - {order.deliveryMethod}
                    </p>
                    {(order.discountAmount ?? 0) > 0 && (
                      <p className="mt-1 text-xs font-semibold text-harbor">
                        Diskon {order.discountCode}: -{formatPrice(order.discountAmount)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 sm:justify-end">
                    <p className="font-bold text-harbor">{formatPrice(order.finalTotal)}</p>
                    <Link to={`/orders/${order.id}`}>
                      <Button variant="secondary">Detail</Button>
                    </Link>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="p-5 text-sm text-slate-600">
                  Belum ada order. Tambahkan produk ke keranjang lalu checkout.
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </section>
  )
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <Card className="p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-emerald-50 text-harbor">
          {icon}
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1 text-lg font-bold text-ink">{value}</p>
        </div>
      </div>
    </Card>
  )
}
