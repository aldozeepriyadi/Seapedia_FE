import { FormEvent, ReactNode, useEffect, useState } from 'react'
import {
  BadgePercent,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Eye,
  LayoutDashboard,
  Package,
  Pencil,
  Plus,
  ReceiptText,
  RefreshCw,
  Store as StoreIcon,
  Trash2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { WorkspacePanel } from '../components/WorkspacePanel'
import { apiFetch } from '../lib/api'
import { showConfirm, showError, showSuccess, showToast, Swal } from '../lib/alerts'
import { formatPrice } from '../lib/format'
import { OrderSummary, Product, SellerReport, Store } from '../types'

type ProductPayload = {
  name: string
  description: string
  price: number
  stock: number
  category: string
  image: string
}

type SellerView = 'overview' | 'store' | 'products' | 'orders'

export function SellerDashboardPage({
  token,
  view = 'overview',
}: {
  token: string
  view?: SellerView
}) {
  const [store, setStore] = useState<Store | null>(null)
  const [storeName, setStoreName] = useState('')
  const [storeDescription, setStoreDescription] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [report, setReport] = useState<SellerReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingStore, setSavingStore] = useState(false)
  const [error, setError] = useState('')

  async function loadSellerData() {
    setLoading(true)
    setError('')

    try {
      const [response, orderResponse, reportResponse] = await Promise.all([
        apiFetch<{ store: Store | null; products: Product[] }>('/seller/products', { token }),
        apiFetch<{ orders: OrderSummary[] }>('/seller/orders', { token }),
        apiFetch<{ report: SellerReport }>('/seller/reports/summary', { token }),
      ])
      setStore(response.store)
      setProducts(response.products)
      setOrders(orderResponse.orders)
      setReport(reportResponse.report)
      setStoreName(response.store?.storeName ?? '')
      setStoreDescription(response.store?.description ?? '')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal memuat data seller.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSellerData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function handleStoreSubmit(event: FormEvent) {
    event.preventDefault()
    setSavingStore(true)
    setError('')

    try {
      const response = await apiFetch<{ store: Store }>('/seller/store', {
        method: store ? 'PUT' : 'POST',
        token,
        body: JSON.stringify({ storeName, description: storeDescription }),
      })
      setStore(response.store)
      await loadSellerData()
      await showSuccess(
        store ? 'Store diperbarui' : 'Store dibuat',
        'Data store sudah tersimpan dan siap dipakai untuk katalog publik.',
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Store gagal disimpan.'
      setError(message)
      await showError('Store gagal', message)
    } finally {
      setSavingStore(false)
    }
  }

  async function submitProduct(product?: Product) {
    if (!store) {
      await showError('Store belum ada', 'Buat store terlebih dahulu sebelum menambah produk.')
      return
    }

    const payload = await openProductModal(product)
    if (!payload) return

    setError('')

    try {
      await apiFetch(product ? `/seller/products/${product.id}` : '/seller/products', {
        method: product ? 'PUT' : 'POST',
        token,
        body: JSON.stringify(payload),
      })
      await loadSellerData()
      await showSuccess(
        product ? 'Produk diperbarui' : 'Produk dibuat',
        'Produk sudah tersimpan di database dan tampil di katalog publik.',
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Produk gagal disimpan.'
      setError(message)
      await showError('Produk gagal', message)
    }
  }

  async function deleteProduct(product: Product) {
    const confirmed = await showConfirm(
      'Hapus produk?',
      `${product.name} akan dihapus dari database dan katalog publik.`,
      'Ya, hapus',
    )

    if (!confirmed) return

    setError('')

    try {
      await apiFetch(`/seller/products/${product.id}`, { method: 'DELETE', token })
      await loadSellerData()
      await showToast('success', 'Produk berhasil dihapus.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Produk gagal dihapus.'
      setError(message)
      await showError('Produk gagal dihapus', message)
    }
  }

  async function processOrder(order: OrderSummary) {
    const confirmed = await showConfirm(
      'Proses pesanan?',
      `Order dari ${order.buyerName} akan dipindahkan dari Sedang Dikemas ke Menunggu Pengirim.`,
      'Ya, proses',
    )

    if (!confirmed) return

    setError('')

    try {
      await apiFetch(`/seller/orders/${order.id}/process`, { method: 'POST', token })
      await loadSellerData()
      await showSuccess(
        'Pesanan diproses',
        'Status order sudah masuk Menunggu Pengirim dan history tersimpan di database.',
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Pesanan gagal diproses.'
      setError(message)
      await showError('Proses pesanan gagal', message)
    }
  }

  const sellerNavItems = [
    {
      to: '/seller',
      label: 'Overview',
      icon: <LayoutDashboard size={16} />,
      meta: String(report?.orderCount ?? 0),
    },
    {
      to: '/seller/store',
      label: 'Store',
      icon: <StoreIcon size={16} />,
    },
    {
      to: '/seller/products',
      label: 'Products',
      icon: <Package size={16} />,
      meta: String(products.length),
    },
    {
      to: '/seller/orders',
      label: 'Orders',
      icon: <ReceiptText size={16} />,
      meta: String(report?.pendingOrders ?? 0),
    },
  ]

  return (
    <WorkspacePanel
      badge="SELLER"
      title={getSellerTitle(view)}
      subtitle={getSellerSubtitle(view)}
      navItems={sellerNavItems}
      actions={
        <>
          <Button variant="secondary" onClick={loadSellerData}>
            <RefreshCw size={16} />
            Refresh
          </Button>
          {view === 'products' && (
            <Button variant="success" disabled={!store} onClick={() => submitProduct()}>
              <Plus size={16} />
              Product
            </Button>
          )}
        </>
      }
    >

      {error && <p className="mt-6 text-sm font-semibold text-red-600">{error}</p>}

      {view === 'overview' && (
        <>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <ReportMetric
          icon={<ReceiptText size={20} />}
          label="Incoming orders"
          value={String(report?.orderCount ?? 0)}
        />
        <ReportMetric
          icon={<CircleDollarSign size={20} />}
          label="Seller income"
          value={formatPrice(report?.totalIncome ?? 0)}
        />
        <ReportMetric
          icon={<BadgePercent size={20} />}
          label="Total discount"
          value={formatPrice(report?.totalDiscount ?? 0)}
        />
        <ReportMetric
          icon={<Clock3 size={20} />}
          label="Need process"
          value={String(report?.pendingOrders ?? 0)}
        />
      </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <SummaryPanel
              title="Store setup"
              description="Atur identitas toko dan deskripsi publik."
              count={store ? 1 : 0}
              actionLabel="Open store"
              to="/seller/store"
            />
            <SummaryPanel
              title="Product management"
              description="Kelola produk, gambar, harga, kategori, dan stock."
              count={products.length}
              actionLabel="Open products"
              to="/seller/products"
            />
            <SummaryPanel
              title="Order processing"
              description="Proses pesanan buyer dari packing ke menunggu pengirim."
              count={orders.length}
              actionLabel="Open orders"
              to="/seller/orders"
            />
          </div>
        </>
      )}

      {view === 'store' && (
        <>
        <Card className="p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-emerald-50 text-harbor">
              <StoreIcon size={20} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-ink">Store identity</h2>
              <p className="text-sm text-slate-600">Nama toko harus unik.</p>
            </div>
          </div>

          <form className="mt-5 grid gap-4" onSubmit={handleStoreSubmit}>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Nama toko
              <Input
                value={storeName}
                onChange={(event) => setStoreName(event.target.value)}
                placeholder="Contoh: Harbor Outfit"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Deskripsi toko
              <textarea
                value={storeDescription}
                onChange={(event) => setStoreDescription(event.target.value)}
                placeholder="Ceritakan kategori produk dan identitas toko"
                className="min-h-28 resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-harbor focus:ring-2 focus:ring-emerald-100"
              />
            </label>
            <Button variant={store ? 'warning' : 'success'} disabled={savingStore}>
              {savingStore ? 'Menyimpan...' : store ? 'Update store' : 'Create store'}
            </Button>
          </form>

          {store && (
            <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Current store
              </p>
              <p className="mt-1 font-bold text-ink">{store.storeName}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{store.description}</p>
            </div>
          )}
        </Card>

          <Card className="mt-6 p-5 shadow-soft">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <Package className="mt-0.5 text-harbor" size={21} />
                <div>
                  <h2 className="font-bold text-ink">Public catalog integration</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Produk seller memakai endpoint publik yang sama dengan guest catalog.
                  </p>
                </div>
              </div>
              <Link to="/products">
                <Button variant="info">Open public catalog</Button>
              </Link>
            </div>
          </Card>
        </>
      )}

      {view === 'products' && (
        <Card className="overflow-hidden shadow-soft">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink">Owned products</h2>
              <p className="text-sm text-slate-600">
                Seller hanya bisa update atau delete produk milik store sendiri.
              </p>
            </div>
            <Badge>{products.length} products</Badge>
          </div>

          {loading ? (
            <div className="p-5 text-sm text-slate-600">Memuat produk seller...</div>
          ) : !store ? (
            <div className="grid gap-3 p-5 text-sm text-slate-600">
              <p>Buat store terlebih dahulu untuk membuka product management.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Product</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Price</th>
                    <th className="px-5 py-3">Stock</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((product) => (
                    <tr key={product.id} className="bg-white">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-12 w-12 rounded-md object-cover"
                          />
                          <div>
                            <p className="font-bold text-ink">{product.name}</p>
                            <p className="text-xs text-slate-500">{product.storeName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-700">{product.category}</td>
                      <td className="px-5 py-3 font-semibold text-harbor">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-5 py-3 text-slate-700">{product.stock}</td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          <Link to={`/products/${product.id}`}>
                            <Button variant="info">
                              <Eye size={15} />
                              View
                            </Button>
                          </Link>
                          <Button variant="warning" onClick={() => submitProduct(product)}>
                            <Pencil size={15} />
                            Edit
                          </Button>
                          <Button variant="danger" onClick={() => deleteProduct(product)}>
                            <Trash2 size={15} />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td className="px-5 py-8 text-center text-slate-600" colSpan={5}>
                        Belum ada produk. Klik tombol Product untuk menambah item pertama.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {view === 'orders' && (
      <Card className="overflow-hidden shadow-soft">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <ReceiptText className="mt-0.5 text-harbor" size={21} />
            <div>
              <h2 className="font-bold text-ink">Incoming orders</h2>
              <p className="mt-1 text-sm text-slate-600">
                Seller memproses order dari Sedang Dikemas menjadi Menunggu Pengirim.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>{orders.length} orders</Badge>
            <Badge>{report?.processedOrders ?? 0} processed</Badge>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Buyer</th>
                <th className="px-5 py-3">Delivery</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Discount</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id} className="bg-white">
                  <td className="px-5 py-3 font-bold text-ink">{order.buyerName}</td>
                  <td className="px-5 py-3 text-slate-700">{order.deliveryMethod}</td>
                  <td className="px-5 py-3">
                    <Badge>{order.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-slate-700">
                    {order.discountAmount > 0 ? (
                      <span className="font-semibold text-coral">
                        -{formatPrice(order.discountAmount)}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-5 py-3 font-bold text-harbor">
                    {formatPrice(order.finalTotal)}
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {new Date(order.createdAt).toLocaleString('id-ID')}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end">
                      <Button
                        variant={order.status === 'Sedang Dikemas' ? 'success' : 'ghost'}
                        disabled={order.status !== 'Sedang Dikemas'}
                        onClick={() => processOrder(order)}
                      >
                        <CheckCircle2 size={15} />
                        Process
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-600" colSpan={7}>
                    Belum ada pesanan masuk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      )}
    </WorkspacePanel>
  )
}

function ReportMetric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
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

function SummaryPanel({
  title,
  description,
  count,
  actionLabel,
  to,
}: {
  title: string
  description: string
  count: number
  actionLabel: string
  to: string
}) {
  return (
    <Card className="p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {count} records
          </p>
          <h2 className="mt-2 text-lg font-bold text-ink">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-emerald-50 text-harbor">
          <LayoutDashboard size={20} />
        </span>
      </div>
      <Link to={to} className="mt-5 block">
        <Button className="w-full">{actionLabel}</Button>
      </Link>
    </Card>
  )
}

function getSellerTitle(view: SellerView) {
  if (view === 'store') return 'Store management'
  if (view === 'products') return 'Product management'
  if (view === 'orders') return 'Order processing'
  return 'Seller overview'
}

function getSellerSubtitle(view: SellerView) {
  if (view === 'store') {
    return 'Halaman khusus identitas toko, nama toko, dan deskripsi publik.'
  }
  if (view === 'products') {
    return 'Halaman khusus CRUD produk seller dengan action modal dan gambar produk.'
  }
  if (view === 'orders') {
    return 'Halaman khusus incoming order dan proses status pesanan seller.'
  }
  return 'Ringkasan performa seller, income, diskon, dan shortcut ke modul operasional.'
}

async function openProductModal(product?: Product) {
  const result = await Swal.fire<ProductPayload>({
    title: product ? 'Edit product' : 'Create product',
    html: `
      <div class="grid gap-3 text-left">
        <label class="grid gap-1 text-sm font-semibold text-slate-700">
          Nama produk
          <input id="product-name" class="swal2-input !mx-0 !mt-1 !w-full" value="${escapeHtml(product?.name ?? '')}" placeholder="Nama produk" />
        </label>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="grid gap-1 text-sm font-semibold text-slate-700">
            Harga
            <input id="product-price" type="number" min="0" class="swal2-input !mx-0 !mt-1 !w-full" value="${product?.price ?? ''}" placeholder="Harga" />
          </label>
          <label class="grid gap-1 text-sm font-semibold text-slate-700">
            Stock
            <input id="product-stock" type="number" min="0" class="swal2-input !mx-0 !mt-1 !w-full" value="${product?.stock ?? ''}" placeholder="Stock" />
          </label>
        </div>
        <label class="grid gap-1 text-sm font-semibold text-slate-700">
          Kategori opsional
          <input id="product-category" class="swal2-input !mx-0 !mt-1 !w-full" value="${escapeHtml(product?.category ?? 'General')}" placeholder="General" />
        </label>
        <label class="grid gap-1 text-sm font-semibold text-slate-700">
          Gambar produk opsional
          ${
            product?.image
              ? `<img src="${escapeHtml(product.image)}" alt="Current product image" class="mb-2 h-32 w-full rounded-md object-cover" />`
              : ''
          }
          <input id="product-image-file" type="file" accept="image/png,image/jpeg,image/webp,image/gif" class="swal2-file !mx-0 !mt-1 !w-full" />
          <span class="text-xs font-medium text-slate-500">Upload PNG, JPG, WEBP, atau GIF maksimal 2 MB.</span>
        </label>
        <label class="grid gap-1 text-sm font-semibold text-slate-700">
          Deskripsi
          <textarea id="product-description" class="swal2-textarea !mx-0 !mt-1 !w-full" placeholder="Deskripsi produk">${escapeHtml(product?.description ?? '')}</textarea>
        </label>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonColor: '#0f766e',
    cancelButtonColor: '#78716c',
    confirmButtonText: product ? 'Update product' : 'Create product',
    cancelButtonText: 'Batal',
    preConfirm: async () => {
      const name = readModalValue('product-name').trim()
      const price = Number(readModalValue('product-price'))
      const stock = Number(readModalValue('product-stock'))
      const category = readModalValue('product-category').trim() || 'General'
      const imageFile = (document.getElementById('product-image-file') as HTMLInputElement | null)
        ?.files?.[0]
      const description = readModalValue('product-description').trim()

      if (name.length < 3) {
        Swal.showValidationMessage('Nama produk minimal 3 karakter.')
        return false
      }
      if (!Number.isInteger(price) || price < 0) {
        Swal.showValidationMessage('Harga harus angka bulat minimal 0.')
        return false
      }
      if (!Number.isInteger(stock) || stock < 0) {
        Swal.showValidationMessage('Stock harus angka bulat minimal 0.')
        return false
      }
      if (category.length < 2) {
        Swal.showValidationMessage('Kategori minimal 2 karakter.')
        return false
      }
      if (description.length < 8) {
        Swal.showValidationMessage('Deskripsi minimal 8 karakter.')
        return false
      }
      if (imageFile && !imageFile.type.startsWith('image/')) {
        Swal.showValidationMessage('File harus berupa gambar.')
        return false
      }
      if (imageFile && imageFile.size > 2 * 1024 * 1024) {
        Swal.showValidationMessage('Ukuran gambar maksimal 2 MB.')
        return false
      }

      const image = imageFile ? await fileToDataUrl(imageFile) : product?.image ?? ''

      return {
        name,
        description,
        price,
        stock,
        category,
        image,
      }
    },
  })

  return result.value
}

function readModalValue(id: string) {
  return (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null)?.value ?? ''
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Gambar gagal dibaca.'))
    reader.readAsDataURL(file)
  })
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
