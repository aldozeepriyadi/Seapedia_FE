import { FormEvent, useEffect, useState } from 'react'
import {
  Eye,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Store as StoreIcon,
  Trash2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { apiFetch } from '../lib/api'
import { showConfirm, showError, showSuccess, showToast, Swal } from '../lib/alerts'
import { formatPrice } from '../lib/format'
import { Product, Store } from '../types'

type ProductPayload = {
  name: string
  description: string
  price: number
  stock: number
  category: string
  image: string
}

export function SellerDashboardPage({ token }: { token: string }) {
  const [store, setStore] = useState<Store | null>(null)
  const [storeName, setStoreName] = useState('')
  const [storeDescription, setStoreDescription] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [savingStore, setSavingStore] = useState(false)
  const [error, setError] = useState('')

  async function loadSellerData() {
    setLoading(true)
    setError('')

    try {
      const response = await apiFetch<{ store: Store | null; products: Product[] }>(
        '/seller/products',
        { token },
      )
      setStore(response.store)
      setProducts(response.products)
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

  return (
    <section className="page-shell py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge className="border-emerald-100 bg-emerald-50 text-harbor">
            Level 2 Seller Experience
          </Badge>
          <h1 className="mt-3 text-3xl font-bold text-ink">Seller workspace</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Kelola identitas store dan produk milik seller aktif. Produk yang dibuat di sini
            langsung muncul di katalog publik.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={loadSellerData}>
            <RefreshCw size={16} />
            Refresh
          </Button>
          <Button disabled={!store} onClick={() => submitProduct()}>
            <Plus size={16} />
            Product
          </Button>
        </div>
      </div>

      {error && <p className="mt-6 text-sm font-semibold text-red-600">{error}</p>}

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
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
            <Button disabled={savingStore}>
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
                            <Button variant="ghost">
                              <Eye size={15} />
                              View
                            </Button>
                          </Link>
                          <Button variant="secondary" onClick={() => submitProduct(product)}>
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
      </div>

      <Card className="mt-6 p-5 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <Package className="mt-0.5 text-harbor" size={21} />
            <div>
              <h2 className="font-bold text-ink">Public catalog integration</h2>
              <p className="mt-1 text-sm text-slate-600">
                Semua produk seller yang tersimpan lewat dashboard ini memakai endpoint publik
                yang sama dengan guest catalog.
              </p>
            </div>
          </div>
          <Link to="/products">
            <Button variant="secondary">Open public catalog</Button>
          </Link>
        </div>
      </Card>
    </section>
  )
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
