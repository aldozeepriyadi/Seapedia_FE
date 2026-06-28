import { Link } from 'react-router-dom'
import { formatPrice } from '../lib/format'
import { Product } from '../types'
import { Badge } from './ui/Badge'
import { Card } from './ui/Card'

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="group overflow-hidden shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-soft">
      <Link to={`/products/${product.id}`} className="block">
        <div className="aspect-[4/3] overflow-hidden bg-slate-100">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
        <div className="grid gap-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-base font-bold leading-snug text-ink">
                {product.name}
              </h3>
              <p className="mt-1 truncate text-sm text-slate-500">{product.storeName}</p>
            </div>
            <Badge>{product.category}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <p className="font-bold text-harbor">{formatPrice(product.price)}</p>
            <p className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
              Stock {product.stock}
            </p>
          </div>
        </div>
      </Link>
    </Card>
  )
}
