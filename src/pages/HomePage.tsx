import { ArrowRight, Search, ShieldCheck, Store, Truck, UserRound, X } from 'lucide-react'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { ReviewForm } from '../components/ReviewForm'
import { ReviewList } from '../components/ReviewList'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
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
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [reviews, setReviews] = useState<AppReview[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    apiFetch<{ products: Product[] }>('/products')
      .then((response) => setProducts(response.products.slice(0, 4)))
      .catch(() => setProducts([]))

    apiFetch<{ reviews: AppReview[] }>('/reviews')
      .then((response) => setReviews(response.reviews))
      .catch(() => setReviews([]))
  }, [])

  const popularSearches = useMemo(() => {
    const values = products.flatMap((product) => [product.name, product.category]).filter(Boolean)

    return Array.from(new Set(values)).slice(0, 5)
  }, [products])

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const keyword = searchQuery.trim()
    const params = new URLSearchParams()

    if (keyword) {
      params.set('q', keyword)
    }

    navigate(`/products${params.toString() ? `?${params.toString()}` : ''}`)
  }

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
            <form
              className="mt-8 max-w-2xl rounded-md bg-white p-2 shadow-soft"
              onSubmit={handleSearchSubmit}
            >
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="relative flex-1">
                  <span className="sr-only">Cari produk, toko, atau kategori</span>
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <Input
                    className="h-11 border-0 pl-10 pr-10 text-sm font-semibold shadow-none focus:ring-0"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Cari produk, toko, atau kategori"
                  />
                  {searchQuery && (
                    <button
                      aria-label="Kosongkan pencarian"
                      className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-ink"
                      type="button"
                      onClick={() => setSearchQuery('')}
                    >
                      <X size={15} />
                    </button>
                  )}
                </label>
                <Button className="h-11 px-5" type="submit">
                  Cari
                  <ArrowRight size={16} />
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 px-1 pb-1">
                {popularSearches.map((item) => (
                  <Link
                    key={item}
                    to={`/products?q=${encodeURIComponent(item)}`}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 transition hover:bg-emerald-50 hover:text-harbor"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </form>
            <div className="mt-5 flex flex-wrap gap-2">
              {categoryChips.map((item) => (
                <Link
                  key={item}
                  to={`/products?category=${encodeURIComponent(item)}`}
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
