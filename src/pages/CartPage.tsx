import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Minus, Plus, ShoppingBag, Store, Trash2 } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../lib/api'
import { showConfirm, showError, showToast } from '../lib/alerts'
import { saveCheckoutSelection } from '../lib/checkoutSelection'
import { formatPrice } from '../lib/format'
import { CartItem, CartSummary } from '../types'

type CartStoreGroup = {
  storeId: string
  storeName: string
  items: CartItem[]
}

export function CartPage() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [cart, setCart] = useState<CartSummary | null>(null)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const groups = useMemo(() => groupCartItems(cart?.items ?? []), [cart?.items])
  const selectedItems = useMemo(
    () => (cart?.items ?? []).filter((item) => selectedProductIds.includes(item.productId)),
    [cart?.items, selectedProductIds],
  )
  const selectedSubtotal = selectedItems.reduce((total, item) => total + item.subtotal, 0)
  const selectedStoreCount = new Set(selectedItems.map((item) => item.storeId)).size
  const allItemIds = cart?.items.map((item) => item.productId) ?? []
  const allSelected = allItemIds.length > 0 && selectedProductIds.length === allItemIds.length

  async function loadCart() {
    if (!token) return
    setLoading(true)
    setError('')

    try {
      const response = await apiFetch<{ cart: CartSummary }>('/buyer/cart', { token })
      setCart(response.cart)
      setSelectedProductIds(response.cart.items.map((item) => item.productId))
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
      const remainingIds = response.cart.items.map((item) => item.productId)
      setCart(response.cart)
      setSelectedProductIds((items) => items.filter((item) => remainingIds.includes(item)))
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
      setSelectedProductIds([])
      await showToast('success', 'Keranjang dikosongkan.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Keranjang gagal dikosongkan.'
      await showError('Keranjang gagal', message)
    }
  }

  function toggleItem(productId: string) {
    setSelectedProductIds((items) =>
      items.includes(productId) ? items.filter((item) => item !== productId) : [...items, productId],
    )
  }

  function toggleStore(group: CartStoreGroup) {
    const storeItemIds = group.items.map((item) => item.productId)
    const storeSelected = storeItemIds.every((item) => selectedProductIds.includes(item))

    setSelectedProductIds((items) =>
      storeSelected
        ? items.filter((item) => !storeItemIds.includes(item))
        : Array.from(new Set([...items, ...storeItemIds])),
    )
  }

  function toggleAll() {
    setSelectedProductIds(allSelected ? [] : allItemIds)
  }

  async function checkoutSelected() {
    if (!selectedProductIds.length) {
      await showError('Pilih produk dulu', 'Centang minimal satu produk untuk checkout.')
      return
    }

    saveCheckoutSelection(user?.id, selectedProductIds)
    navigate('/pembayaran')
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
            Multi-store cart
          </Badge>
          <h1 className="mt-3 text-3xl font-bold text-ink">Keranjang</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Produk dikelompokkan berdasarkan toko. Centang item atau toko yang ingin dibayar,
            lalu checkout hanya untuk pilihan tersebut.
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
        <div className="grid gap-4">
          <Card className="flex flex-col gap-3 p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
            <button
              className="inline-flex w-fit items-center gap-3 text-left text-sm font-bold text-ink"
              type="button"
              onClick={toggleAll}
            >
              <SelectionBox checked={allSelected} />
              Pilih semua produk
            </button>
            <div className="flex items-center gap-3">
              <Badge>{cart?.items.length ?? 0} item</Badge>
              <Button variant="ghost" disabled={!cart?.items.length} onClick={clearCart}>
                <Trash2 size={16} />
                Clear
              </Button>
            </div>
          </Card>

          {loading ? (
            <Card className="p-5 text-sm text-slate-600 shadow-soft">Memuat keranjang...</Card>
          ) : (
            <>
              {groups.map((group) => {
                const storeItemIds = group.items.map((item) => item.productId)
                const selectedInStore = storeItemIds.filter((item) => selectedProductIds.includes(item))
                const storeSelected = selectedInStore.length === storeItemIds.length
                const storeIndeterminate = selectedInStore.length > 0 && !storeSelected

                return (
                  <Card key={group.storeId} className="overflow-hidden shadow-soft">
                    <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        className="inline-flex items-center gap-3 text-left"
                        type="button"
                        onClick={() => toggleStore(group)}
                      >
                        <SelectionBox checked={storeSelected} indeterminate={storeIndeterminate} />
                        <span className="grid h-10 w-10 place-items-center rounded-md bg-emerald-50 text-harbor">
                          <Store size={18} />
                        </span>
                        <span>
                          <span className="block font-bold text-ink">{group.storeName}</span>
                          <span className="block text-sm text-slate-500">
                            {selectedInStore.length} dari {group.items.length} item dipilih
                          </span>
                        </span>
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {group.items.map((item) => {
                        const selected = selectedProductIds.includes(item.productId)

                        return (
                          <div
                            key={item.id}
                            className="grid gap-4 p-5 md:grid-cols-[auto_5rem_1fr_auto] md:items-center"
                          >
                            <button
                              className="w-fit"
                              type="button"
                              onClick={() => toggleItem(item.productId)}
                            >
                              <SelectionBox checked={selected} />
                            </button>
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-20 w-20 rounded-md object-cover"
                            />
                            <div>
                              <p className="font-bold text-ink">{item.name}</p>
                              <p className="mt-1 text-sm text-slate-600">Stock {item.stock}</p>
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
                        )
                      })}
                    </div>
                  </Card>
                )
              })}

              {!cart?.items.length && (
                <Card className="grid place-items-center gap-3 p-8 text-center text-sm text-slate-600 shadow-soft">
                  <ShoppingBag className="text-slate-400" />
                  <p>Keranjang masih kosong.</p>
                </Card>
              )}
            </>
          )}
        </div>

        <Card className="h-fit p-5 shadow-soft">
          <h2 className="text-lg font-bold text-ink">Checkout pilihan</h2>
          <div className="mt-5 grid gap-3">
            <SummaryRow label="Dipilih" value={`${selectedItems.length} item`} />
            <SummaryRow label="Toko" value={`${selectedStoreCount} toko`} />
            <SummaryRow label="Subtotal pilihan" value={formatPrice(selectedSubtotal)} strong />
            <p className="rounded-md bg-slate-50 p-3 text-xs font-semibold leading-5 text-slate-500">
              Kalau memilih beberapa toko, sistem akan membuat order terpisah per toko seperti
              marketplace modern.
            </p>
          </div>
          <Button
            className="mt-5 w-full"
            disabled={!selectedProductIds.length || !cart?.items.length}
            onClick={checkoutSelected}
          >
            Checkout selected
          </Button>
        </Card>
      </div>
    </section>
  )
}

function groupCartItems(items: CartItem[]) {
  const groups = new Map<string, CartStoreGroup>()

  for (const item of items) {
    const existing = groups.get(item.storeId)

    if (existing) {
      existing.items.push(item)
      continue
    }

    groups.set(item.storeId, {
      storeId: item.storeId,
      storeName: item.storeName,
      items: [item],
    })
  }

  return Array.from(groups.values())
}

function SelectionBox({
  checked,
  indeterminate,
}: {
  checked: boolean
  indeterminate?: boolean
}) {
  return (
    <span
      className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border transition ${
        checked || indeterminate
          ? 'border-harbor bg-harbor text-white'
          : 'border-slate-300 bg-white text-transparent'
      }`}
    >
      {indeterminate ? <span className="h-0.5 w-3 rounded-full bg-white" /> : <Check size={15} />}
    </span>
  )
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-slate-600">{label}</span>
      <span className={strong ? 'font-bold text-harbor' : 'font-bold text-ink'}>{value}</span>
    </div>
  )
}
