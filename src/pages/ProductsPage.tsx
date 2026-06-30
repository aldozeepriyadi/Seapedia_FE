import { ArrowUpDown, Filter, Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { ProductCard } from '../components/ProductCard'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { apiFetch } from '../lib/api'
import { Product } from '../types'

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-desc'
type StockFilter = 'all' | 'available' | 'empty'

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [storeFilter, setStoreFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState<StockFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('name-asc')
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch<{ products: Product[] }>('/products')
      .then((response) => setProducts(response.products))
      .catch((err) => setError(err instanceof Error ? err.message : 'Gagal memuat produk.'))
  }, [])

  const categories = useMemo(
    () => uniqueValues(products.map((product) => product.category || 'General')),
    [products],
  )

  const stores = useMemo(
    () => uniqueValues(products.map((product) => product.storeName)),
    [products],
  )

  const visibleProducts = useMemo(() => {
    const keyword = query.toLowerCase().trim()

    return products
      .filter((product) => {
        const matchesKeyword =
          !keyword ||
          [product.name, product.storeName, product.category]
            .join(' ')
            .toLowerCase()
            .includes(keyword)
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter
        const matchesStore = storeFilter === 'all' || product.storeName === storeFilter
        const matchesStock =
          stockFilter === 'all' ||
          (stockFilter === 'available' && product.stock > 0) ||
          (stockFilter === 'empty' && product.stock === 0)

        return matchesKeyword && matchesCategory && matchesStore && matchesStock
      })
      .slice()
      .sort((firstProduct, secondProduct) => sortProducts(firstProduct, secondProduct, sortBy))
  }, [categoryFilter, products, query, sortBy, stockFilter, storeFilter])

  const isFiltered =
    query.trim() !== '' ||
    categoryFilter !== 'all' ||
    storeFilter !== 'all' ||
    stockFilter !== 'all' ||
    sortBy !== 'name-asc'

  function resetControls() {
    setQuery('')
    setCategoryFilter('all')
    setStoreFilter('all')
    setStockFilter('all')
    setSortBy('name-asc')
  }

  return (
    <section className="page-shell py-10">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-harbor">
            Guest-accessible catalog
          </p>
          <h1 className="mt-2 text-3xl font-bold text-ink">Products</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Guest bisa melihat listing dan detail produk secara read-only. Filter dan sort
            membantu katalog terasa seperti marketplace modern pada Level 5.
          </p>
        </div>
      </div>

      <Card className="mt-6 p-4 shadow-soft">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_0.9fr_1fr_auto]">
          <label className="grid gap-1 text-xs font-bold uppercase text-slate-500">
            Search
            <span className="flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3">
              <Search size={17} className="text-slate-400" />
              <Input
                className="h-8 border-0 px-0 focus:ring-0"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Produk, toko, kategori"
              />
            </span>
          </label>

          <label className="grid gap-1 text-xs font-bold uppercase text-slate-500">
            Category
            <select
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-ink outline-none transition focus:border-harbor focus:ring-2 focus:ring-emerald-100"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="all">Semua kategori</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-xs font-bold uppercase text-slate-500">
            Store
            <select
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-ink outline-none transition focus:border-harbor focus:ring-2 focus:ring-emerald-100"
              value={storeFilter}
              onChange={(event) => setStoreFilter(event.target.value)}
            >
              <option value="all">Semua toko</option>
              {stores.map((store) => (
                <option key={store} value={store}>
                  {store}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-xs font-bold uppercase text-slate-500">
            Stock
            <select
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-ink outline-none transition focus:border-harbor focus:ring-2 focus:ring-emerald-100"
              value={stockFilter}
              onChange={(event) => setStockFilter(event.target.value as StockFilter)}
            >
              <option value="all">Semua stock</option>
              <option value="available">Tersedia</option>
              <option value="empty">Stock kosong</option>
            </select>
          </label>

          <label className="grid gap-1 text-xs font-bold uppercase text-slate-500">
            Sort
            <span className="flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3">
              <ArrowUpDown size={17} className="shrink-0 text-slate-400" />
              <select
                className="h-8 min-w-0 flex-1 bg-transparent text-sm font-semibold text-ink outline-none"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortOption)}
              >
                <option value="name-asc">Nama A-Z</option>
                <option value="name-desc">Nama Z-A</option>
                <option value="price-asc">Harga termurah</option>
                <option value="price-desc">Harga termahal</option>
                <option value="stock-desc">Stock terbanyak</option>
              </select>
            </span>
          </label>

          <div className="flex items-end">
            <Button
              className="w-full"
              variant="secondary"
              type="button"
              disabled={!isFiltered}
              onClick={resetControls}
            >
              <X size={16} />
              Reset
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <Filter size={16} className="text-harbor" />
          <span>
            Menampilkan <strong className="text-ink">{visibleProducts.length}</strong> dari{' '}
            <strong className="text-ink">{products.length}</strong> produk.
          </span>
        </div>
      </Card>

      {error && <p className="mt-6 text-sm font-semibold text-red-600">{error}</p>}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {!error && visibleProducts.length === 0 && (
        <Card className="mt-8 p-6 text-center text-sm font-semibold text-slate-600">
          Tidak ada produk yang cocok dengan filter saat ini.
        </Card>
      )}
    </section>
  )
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((first, second) =>
    first.localeCompare(second),
  )
}

function sortProducts(firstProduct: Product, secondProduct: Product, sortBy: SortOption) {
  switch (sortBy) {
    case 'name-desc':
      return secondProduct.name.localeCompare(firstProduct.name)
    case 'price-asc':
      return firstProduct.price - secondProduct.price
    case 'price-desc':
      return secondProduct.price - firstProduct.price
    case 'stock-desc':
      return secondProduct.stock - firstProduct.stock
    case 'name-asc':
    default:
      return firstProduct.name.localeCompare(secondProduct.name)
  }
}
