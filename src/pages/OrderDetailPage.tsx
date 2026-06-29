import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Clock3, ReceiptText } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../lib/api'
import { formatPrice } from '../lib/format'
import { OrderDetail } from '../types'

export function OrderDetailPage() {
  const { id } = useParams()
  const { token } = useAuth()
  const [detail, setDetail] = useState<OrderDetail | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token || !id) return

    apiFetch<OrderDetail>(`/buyer/orders/${id}`, { token })
      .then(setDetail)
      .catch((err) => setError(err instanceof Error ? err.message : 'Order tidak ditemukan.'))
  }, [id, token])

  if (error) {
    return (
      <section className="page-shell py-10">
        <p className="text-sm font-semibold text-red-600">{error}</p>
        <Link to="/dashboard" className="mt-4 inline-block">
          <Button variant="secondary">
            <ArrowLeft size={16} />
            Back to dashboard
          </Button>
        </Link>
      </section>
    )
  }

  if (!detail) {
    return <section className="page-shell py-10 text-sm text-slate-600">Memuat order...</section>
  }

  return (
    <section className="page-shell py-10">
      <Link to="/dashboard">
        <Button variant="ghost">
          <ArrowLeft size={16} />
          Back
        </Button>
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Card className="overflow-hidden shadow-soft">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{detail.order.status}</Badge>
              <Badge>{detail.order.deliveryMethod}</Badge>
            </div>
            <h1 className="mt-3 text-2xl font-bold text-ink">Order {shortId(detail.order.id)}</h1>
            <p className="mt-1 text-sm text-slate-600">
              {new Date(detail.order.createdAt).toLocaleString('id-ID')} - {detail.order.storeName}
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {detail.items.map((item) => (
              <div key={item.id} className="grid gap-3 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="font-bold text-ink">{item.productName}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {item.quantity} x {formatPrice(item.unitPrice)}
                  </p>
                </div>
                <p className="font-bold text-harbor">{formatPrice(item.subtotal)}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid h-fit gap-6">
          <Card className="p-5 shadow-soft">
            <div className="flex gap-3">
              <ReceiptText className="mt-0.5 text-harbor" size={20} />
              <div className="w-full">
                <h2 className="font-bold text-ink">Payment summary</h2>
                <div className="mt-4 grid gap-3 text-sm">
                  <SummaryRow label="Subtotal" value={formatPrice(detail.order.subtotal)} />
                  {(detail.order.discountAmount ?? 0) > 0 && (
                    <>
                      <SummaryRow
                        label={`Discount ${detail.order.discountCode ?? ''}`}
                        value={`-${formatPrice(detail.order.discountAmount)}`}
                      />
                      <SummaryRow label="Taxable subtotal" value={formatPrice(detail.order.taxableAmount)} />
                    </>
                  )}
                  <SummaryRow label="Delivery" value={formatPrice(detail.order.deliveryFee)} />
                  <SummaryRow label="PPN 12%" value={formatPrice(detail.order.ppn)} />
                  <div className="border-t border-slate-200 pt-3">
                    <SummaryRow label="Total" value={formatPrice(detail.order.finalTotal)} strong />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 shadow-soft">
            <div className="flex gap-3">
              <Clock3 className="mt-0.5 text-coral" size={20} />
              <div>
                <h2 className="font-bold text-ink">Status history</h2>
                <div className="mt-4 grid gap-3">
                  {detail.history.map((item) => (
                    <div key={item.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                      <p className="font-bold text-ink">{item.status}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.note}</p>
                      <p className="mt-2 text-xs font-semibold text-slate-500">
                        {new Date(item.createdAt).toLocaleString('id-ID')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-600">{label}</span>
      <span className={strong ? 'font-bold text-harbor' : 'font-bold text-ink'}>{value}</span>
    </div>
  )
}

function shortId(value: string) {
  return value.length > 12 ? `${value.slice(0, 12)}...` : value
}
