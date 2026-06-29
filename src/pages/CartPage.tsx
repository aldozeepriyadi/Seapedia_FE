import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../lib/api'
import { showConfirm, showError, showToast } from '../lib/alerts'
import { formatPrice } from '../lib/format'
import { CartSummary } from '../types'

export function CartPage() {
  const { user, token } = useAuth()
  const [cart, setCart] = useState<CartSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadCart() {
    if (!token) return
    setLoading(true)
    setError('')

    try {
      const response = await apiFetch<{ cart: CartSummary }>('/buyer/cart', { token })
      setCart(response.cart)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat keranjang.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function updateQuantity(productId: string, quantity: number) {
    if (!token || quantity < 1) return

    try {
      const response = await apiFetch<{ cart: CartSummary }>(`/buyer/cart/items/${productId}`, {
        method: 'PUT',
        token,
        body: JSON.stringify({ quantity }),
      })
      setCart(response.cart)
      await showToast('success', 'Keranjang diperbarui.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Keranjang gagal diperbarui.'
      await showError('Keranjang gagal', message)
    }
  }

  async function removeItem(productId: string) {
    if (!token) return
    const confirmed = await showConfirm(
      'Hapus produk?',
      'Produk akan dihapus dari keranjang.',
      'Ya, hapus',
    )

    if (!confirmed) return

    try {
      const response = await apiFetch<{ cart: CartSummary }>(`/buyer/cart/items/${productId}`, {
        method: 'DELETE',
        token,
      })
      setCart(response.cart)
      await showToast('success', 'Produk dihapus dari keranjang.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Produk gagal dihapus.'
      await showError('Hapus produk gagal', message)
    }
  }

  async function clearCart() {
    if (!token) return
    const confirmed = await showConfirm(
      'Kosongkan keranjang?',
      'Semua item akan dihapus dari keranjang.',
      'Ya, kosongkan',
    )

    if (!confirmed) return

    try {
      const response = await apiFetch<{ cart: CartSummary }>('/buyer/cart', {
        method: 'DELETE',
        token,
      })
      setCart(response.cart)
      await showToast('success', 'Keranjang dikosongkan.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Keranjang gagal dikosongkan.'
      await showError('Keranjang gagal', message)
    }
  }

  if (user?.activeRole !== 'BUYER') {
    return (
      <section className="page-shell py-10">
        <Card className="p-5 text-sm text-slate-600">
          Keranjang hanya tersedia untuk active role BUYER.
        </Card>
      </section>
    )
  }

  return (
    <section className="page-shell py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge className="border-emerald-100 bg-emerald-50 text-harbor">
            Single-store cart
          </Badge>
          <h1 className="mt-3 text-3xl font-bold text-ink">Keranjang</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Satu keranjang hanya boleh berisi produk dari satu toko. Backend akan menolak
            produk dari toko berbeda sampai keranjang dikosongkan.
          </p>
        </div>
        <Link to="/products">
          <Button variant="secondary">
            <ArrowLeft size={16} />
            Continue browsing
          </Button>
        </Link>
      </div>

      {error && <p className="mt-6 text-sm font-semibold text-red-600">{error}</p>}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Card className="overflow-hidden shadow-soft">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-bold text-ink">{cart?.storeName ?? 'Cart items'}</h2>
              <p className="text-sm text-slate-600">{cart?.items.length ?? 0} item</p>
            </div>
            <Button variant="ghost" disabled={!cart?.items.length} onClick={clearCart}>
              <Trash2 size={16} />
              Clear
            </Button>
          </div>

          {loading ? (
            <div className="p-5 text-sm text-slate-600">Memuat keranjang...</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {cart?.items.map((item) => (
                <div key={item.id} className="grid gap-4 p-5 md:grid-cols-[5rem_1fr_auto] md:items-center">
                  <img src={item.image} alt={item.name} className="h-20 w-20 rounded-md object-cover" />
                  <div>
                    <p className="font-bold text-ink">{item.name}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.storeName}</p>
                    <p className="mt-2 font-bold text-harbor">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    <Button
                      variant="secondary"
                      disabled={item.quantity <= 1}
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    >
                      <Minus size={15} />
                    </Button>
                    <span className="grid h-10 min-w-12 place-items-center rounded-md border border-slate-200 px-3 text-sm font-bold">
                      {item.quantity}
                    </span>
                    <Button
                      variant="secondary"
                      disabled={item.quantity >= item.stock}
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus size={15} />
                    </Button>
                    <Button variant="danger" onClick={() => removeItem(item.productId)}>
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </div>
              ))}
              {!cart?.items.length && (
                <div className="grid place-items-center gap-3 p-8 text-center text-sm text-slate-600">
                  <ShoppingBag className="text-slate-400" />
                  <p>Keranjang masih kosong.</p>
                </div>
              )}
            </div>
          )}
        </Card>

        <Card className="h-fit p-5 shadow-soft">
          <h2 className="text-lg font-bold text-ink">Cart summary</h2>
          <div className="mt-5 grid gap-3">
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-slate-600">Store</span>
              <span className="font-bold text-ink">{cart?.storeName ?? '-'}</span>
            </div>
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-bold text-harbor">{formatPrice(cart?.subtotal ?? 0)}</span>
            </div>
          </div>
          {cart?.items.length ? (
            <Link to="/pembayaran" className="mt-5 block">
              <Button className="w-full">Checkout</Button>
            </Link>
          ) : (
            <Button className="mt-5 w-full" disabled>
              Checkout
            </Button>
          )}
        </Card>
      </div>
    </section>
  )
}
