import { ArrowRight, Search, ShieldCheck, Store, Truck, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { ReviewForm } from '../components/ReviewForm'
import { ReviewList } from '../components/ReviewList'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { apiFetch } from '../lib/api'
import { AppReview, Product } from '../types'

const roleHighlights = [
  {
    icon: UserRound,
    label: 'Buyer',
    text: 'Browse catalog and keep a dedicated buyer session.',
  },
  {
    icon: Store,
    label: 'Seller',
    text: 'Create a store and manage products from the seller workspace.',
  },
  {
    icon: Truck,
    label: 'Driver',
    text: 'Driver session is recognized as a separate marketplace role.',
  },
  {
    icon: ShieldCheck,
    label: 'Admin',
    text: 'Admin account is separated from public marketplace users.',
  },
]

const categoryChips = ['Fashion', 'Bags', 'Electronics', 'Home Office']

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [reviews, setReviews] = useState<AppReview[]>([])

  useEffect(() => {
    apiFetch<{ products: Product[] }>('/products')
      .then((response) => setProducts(response.products.slice(0, 4)))
      .catch(() => setProducts([]))

    apiFetch<{ reviews: AppReview[] }>('/reviews')
      .then((response) => setReviews(response.reviews))
      .catch(() => setReviews([]))
  }, [])

  return (
    <div>
      <section className="relative min-h-[560px] overflow-hidden bg-ink text-white">
        <img
          src="https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=1800&q=85"
          alt="Modern marketplace packaging and online shopping"
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/20" />
        <div className="page-shell relative flex min-h-[560px] items-center py-14">
          <div className="max-w-2xl">
            <Badge className="border-white/20 bg-white/15 text-white backdrop-blur">
              Public marketplace
            </Badge>
            <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              SEAPEDIA
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-100 sm:text-lg">
              Etalase produk multi-seller dengan akun, active role, dan review aplikasi publik.
            </p>
            <div className="mt-8 flex max-w-xl flex-col gap-3 rounded-md bg-white p-2 shadow-soft sm:flex-row">
              <div className="flex h-11 flex-1 items-center gap-2 px-3 text-slate-500">
                <Search size={18} />
                <span className="text-sm font-semibold">Cari produk, toko, atau kategori</span>
              </div>
              <Link to="/products">
                <Button className="w-full sm:w-auto">
                  Browse products
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {categoryChips.map((item) => (
                <Link
                  key={item}
                  to="/products"
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-white backdrop-blur transition hover:bg-white/20"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell -mt-8 relative z-10">
        <div className="grid gap-4 md:grid-cols-4">
          {roleHighlights.map((item) => {
            const Icon = item.icon
            return (
              <Card key={item.label} className="p-5 shadow-soft">
                <Icon className="text-harbor" size={22} />
                <h2 className="mt-4 text-base font-bold text-ink">{item.label}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="page-shell py-14">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-harbor">
              Curated catalog
            </p>
            <h2 className="mt-2 text-2xl font-bold text-ink">Featured products</h2>
          </div>
          <Link to="/products" className="text-sm font-bold text-harbor hover:text-teal-800">
            View all products
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section id="reviews" className="bg-white py-14">
        <div className="page-shell grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <ReviewForm onCreated={(review) => setReviews((items) => [review, ...items])} />
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-harbor">
              Public reviews
            </p>
            <h2 className="mt-2 text-2xl font-bold text-ink">Application feedback</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Feedback ini terbuka untuk guest dan user login.
            </p>
            <div className="mt-6">
              <ReviewList reviews={reviews} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
