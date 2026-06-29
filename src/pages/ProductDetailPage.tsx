import { ArrowLeft, Eye, Package, ShieldCheck, ShoppingCart, Store } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { apiFetch } from '../lib/api'
import { showError, Swal } from '../lib/alerts'
import { formatPrice } from '../lib/format'
import { Product } from '../types'
import { useAuth } from '../context/AuthContext'

export function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [detailError, setDetailError] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (!id) return

    apiFetch<{ product: Product }>(`/products/${id}`)
      .then((response) => setProduct(response.product))
      .catch((err) => setDetailError(err instanceof Error ? err.message : 'Produk tidak ditemukan.'))
  }, [id])

  if (detailError) {
    return (
      <section className="page-shell py-12">
        <p className="text-sm font-semibold text-red-600">{detailError}</p>
        <Link to="/products" className="mt-4 inline-block">
          <Button variant="secondary">
            <ArrowLeft size={16} />
            Back to products
          </Button>
        </Link>
      </section>
    )
  }

  if (!product) {
    return <section className="page-shell py-12 text-sm text-slate-600">Memuat produk...</section>
  }

  async function addToCart() {
    if (!product || !token) return
    setAdding(true)

    try {
      await apiFetch('/buyer/cart/items', {
        method: 'POST',
        token,
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      })
      const result = await Swal.fire({
        icon: 'success',
        title: 'Masuk keranjang',
        text: 'Produk berhasil ditambahkan ke keranjang.',
        showCancelButton: true,
        confirmButtonText: 'Lihat keranjang',
        cancelButtonText: 'Lanjut belanja',
        confirmButtonColor: '#0f766e',
        cancelButtonColor: '#78716c',
      })
      if (result.isConfirmed) navigate('/keranjang')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Produk gagal ditambahkan.'
      await showError('Add to cart gagal', message)
    } finally {
      setAdding(false)
    }
  }

  return (
    <section className="page-shell py-10">
      <Link to="/products" className="inline-block">
        <Button variant="ghost">
          <ArrowLeft size={16} />
          Back
        </Button>
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
          <img
            src={product.image}
            alt={product.name}
            className="aspect-[4/3] h-full w-full object-cover"
          />
        </div>

        <div className="grid content-start gap-5">
          <div>
            <Badge>{product.category}</Badge>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-ink">{product.name}</h1>
            <p className="mt-3 text-2xl font-bold text-harbor">{formatPrice(product.price)}</p>
          </div>

          <Card className="grid gap-4 p-5 shadow-soft">
            <div className="flex gap-3">
              <Store className="mt-0.5 text-harbor" size={20} />
              <div>
                <p className="font-bold text-ink">{product.storeName}</p>
                <p className="text-sm text-slate-600">
                  {product.storeDescription ||
                    'Store information ditampilkan agar katalog terasa seperti marketplace multi-seller.'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Package className="mt-0.5 text-coral" size={20} />
              <div>
                <p className="font-bold text-ink">Stock {product.stock}</p>
                <p className="text-sm text-slate-600">
                  Stock ditampilkan agar informasi produk terasa lengkap sejak katalog awal.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 shadow-soft">
            <h2 className="font-bold text-ink">Description</h2>
            <p className="mt-2 leading-7 text-slate-700">{product.description}</p>
          </Card>

          <Card className="p-5 shadow-soft">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 text-harbor" size={20} />
              <div>
                <h2 className="font-bold text-ink">Public catalog</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Guest boleh melihat produk. Buyer dapat menambahkan produk ke keranjang
                  dengan rule single-store.
                </p>
              </div>
            </div>
          </Card>

          {user?.activeRole === 'BUYER' ? (
            <Button
              className="w-full justify-center"
              disabled={adding || product.stock <= 0}
              onClick={addToCart}
            >
              <ShoppingCart size={16} />
              {adding ? 'Adding...' : 'Add to cart'}
            </Button>
          ) : (
            <Link to="/products">
              <Button className="w-full justify-center">
                <Eye size={16} />
                Continue browsing
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
