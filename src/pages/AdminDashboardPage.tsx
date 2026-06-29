import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownUp,
  BadgePercent,
  ChevronLeft,
  ChevronRight,
  Eye,
  LayoutDashboard,
  RefreshCw,
  Search,
  ShieldCheck,
  TicketPercent,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { WorkspacePanel } from '../components/WorkspacePanel'
import { apiFetch } from '../lib/api'
import { showError, showSuccess, Swal } from '../lib/alerts'
import { formatPrice } from '../lib/format'
import { DiscountResource } from '../types'

type DiscountPayload = {
  code: string
  discountAmount: number
  expiryDate: string
  remainingUsage?: number
}

type AdminView = 'overview' | 'vouchers' | 'promos'

export function AdminDashboardPage({ token, view = 'overview' }: { token: string; view?: AdminView }) {
  const [vouchers, setVouchers] = useState<DiscountResource[]>([])
  const [promos, setPromos] = useState<DiscountResource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadDiscounts() {
    setLoading(true)
    setError('')

    try {
      const [voucherResponse, promoResponse] = await Promise.all([
        apiFetch<{ vouchers: DiscountResource[] }>('/admin/vouchers', { token }),
        apiFetch<{ promos: DiscountResource[] }>('/admin/promos', { token }),
      ])
      setVouchers(voucherResponse.vouchers)
      setPromos(promoResponse.promos)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data admin.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDiscounts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function createDiscount(type: 'voucher' | 'promo') {
    const payload = await openDiscountModal(type)
    if (!payload) return

    setError('')

    try {
      const path = type === 'voucher' ? '/admin/vouchers' : '/admin/promos'
      await apiFetch(path, {
        method: 'POST',
        token,
        body: JSON.stringify(payload),
      })
      await loadDiscounts()
      await showSuccess(
        type === 'voucher' ? 'Voucher dibuat' : 'Promo dibuat',
        'Kode diskon sudah tersimpan di database dan bisa dipakai saat checkout.',
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kode diskon gagal dibuat.'
      setError(message)
      await showError('Diskon gagal dibuat', message)
    }
  }

  const adminNavItems = [
    {
      to: '/admin',
      label: 'Overview',
      icon: <LayoutDashboard size={16} />,
      meta: String(vouchers.length + promos.length),
    },
    {
      to: '/admin/vouchers',
      label: 'Vouchers',
      icon: <TicketPercent size={16} />,
      meta: String(vouchers.length),
    },
    {
      to: '/admin/promos',
      label: 'Promos',
      icon: <BadgePercent size={16} />,
      meta: String(promos.length),
    },
  ]

  return (
    <WorkspacePanel
      badge="ADMIN"
      title={getAdminTitle(view)}
      subtitle={getAdminSubtitle(view)}
      navItems={adminNavItems}
      actions={
        <>
          {view !== 'promos' && (
            <Button variant="success" onClick={() => createDiscount('voucher')}>
              <TicketPercent size={16} />
              Voucher
            </Button>
          )}
          {view !== 'vouchers' && (
            <Button variant="success" onClick={() => createDiscount('promo')}>
              <BadgePercent size={16} />
              Promo
            </Button>
          )}
          <Button variant="secondary" onClick={loadDiscounts}>
            <RefreshCw size={16} />
            Refresh
          </Button>
        </>
      }
    >

      {error && <p className="mt-6 text-sm font-semibold text-red-600">{error}</p>}

      {view === 'overview' && (
        <>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<TicketPercent size={20} />} label="Voucher" value={String(vouchers.length)} />
        <Metric icon={<BadgePercent size={20} />} label="Promo" value={String(promos.length)} />
        <Metric
          icon={<ShieldCheck size={20} />}
          label="Voucher usage"
          value={String(vouchers.reduce((total, item) => total + (item.remainingUsage ?? 0), 0))}
        />
        <Metric
          icon={<RefreshCw size={20} />}
          label="Active records"
          value={String(vouchers.length + promos.length)}
        />
      </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <SummaryPanel
              title="Voucher management"
              description="Kelola voucher dengan expiry date dan sisa penggunaan."
              count={vouchers.length}
              actionLabel="Open vouchers"
              to="/admin/vouchers"
            />
            <SummaryPanel
              title="Promo management"
              description="Kelola promo checkout tanpa kuota penggunaan."
              count={promos.length}
              actionLabel="Open promos"
              to="/admin/promos"
            />
          </div>
        </>
      )}

      {view === 'vouchers' && (
        <DiscountDataTable
          title="Voucher datatable"
          description="Cari, sort, paginate, dan inspect voucher yang tersimpan di database."
          items={vouchers}
          loading={loading}
          kind="voucher"
          actionLabel="Create voucher"
          onCreate={() => createDiscount('voucher')}
        />
      )}

      {view === 'promos' && (
        <DiscountDataTable
          title="Promo datatable"
          description="Cari, sort, paginate, dan inspect promo yang tersimpan di database."
          items={promos}
          loading={loading}
          kind="promo"
          actionLabel="Create promo"
          onCreate={() => createDiscount('promo')}
        />
      )}
    </WorkspacePanel>
  )
}

function SummaryPanel({
  title,
  description,
  actionLabel,
  count,
  to,
}: {
  title: string
  description: string
  actionLabel: string
  count: number
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

type SortKey = 'code' | 'discountAmount' | 'expiryDate' | 'remainingUsage' | 'createdAt'
type SortDirection = 'asc' | 'desc'

function DiscountDataTable({
  title,
  description,
  items,
  loading,
  kind,
  actionLabel,
  onCreate,
}: {
  title: string
  description: string
  items: DiscountResource[]
  loading: boolean
  kind: 'voucher' | 'promo'
  actionLabel: string
  onCreate: () => void
}) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [pageSize, setPageSize] = useState(5)
  const [page, setPage] = useState(1)

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()

    return items
      .filter((item) => {
        if (!query) return true

        return [
          item.code,
          String(item.discountAmount),
          formatDate(item.expiryDate),
          item.remainingUsage === undefined ? 'unlimited' : String(item.remainingUsage),
        ]
          .join(' ')
          .toLowerCase()
          .includes(query)
      })
      .sort((first, second) => {
        const firstValue = getSortValue(first, sortKey)
        const secondValue = getSortValue(second, sortKey)
        const direction = sortDirection === 'asc' ? 1 : -1

        if (firstValue > secondValue) return direction
        if (firstValue < secondValue) return -direction
        return 0
      })
  }, [items, search, sortDirection, sortKey])

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const startIndex = (safePage - 1) * pageSize
  const visibleItems = filteredItems.slice(startIndex, startIndex + pageSize)

  function toggleSort(nextSortKey: SortKey) {
    if (nextSortKey === sortKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortKey(nextSortKey)
    setSortDirection('asc')
  }

  return (
    <Card className="overflow-hidden shadow-soft">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          <p className="text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <Button variant="success" onClick={onCreate}>
          <TicketPercent size={16} />
          {actionLabel}
        </Button>
      </div>

      {loading ? (
        <div className="p-5 text-sm text-slate-600">Memuat data diskon...</div>
      ) : (
        <>
          <div className="grid gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 lg:grid-cols-[1fr_auto_auto] lg:items-center">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input
                className="pl-9"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                placeholder={`Search ${kind === 'voucher' ? 'voucher' : 'promo'} code, discount, expiry...`}
              />
            </label>
            <select
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-ink outline-none focus:border-harbor focus:ring-2 focus:ring-emerald-100"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value))
                setPage(1)
              }}
            >
              {[5, 10, 25].map((size) => (
                <option key={size} value={size}>
                  {size} rows
                </option>
              ))}
            </select>
            <Badge className="w-fit border-emerald-100 bg-emerald-50 text-harbor">
              {filteredItems.length} filtered
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-white text-xs uppercase text-slate-500">
                <tr>
                  <SortableTh label="Code" active={sortKey === 'code'} onClick={() => toggleSort('code')} />
                  <SortableTh
                    label="Discount"
                    active={sortKey === 'discountAmount'}
                    onClick={() => toggleSort('discountAmount')}
                  />
                  <SortableTh
                    label="Expiry"
                    active={sortKey === 'expiryDate'}
                    onClick={() => toggleSort('expiryDate')}
                  />
                  <SortableTh
                    label="Usage"
                    active={sortKey === 'remainingUsage'}
                    onClick={() => toggleSort('remainingUsage')}
                  />
                  <SortableTh
                    label="Created"
                    active={sortKey === 'createdAt'}
                    onClick={() => toggleSort('createdAt')}
                  />
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleItems.map((item) => {
                  const expired = new Date(item.expiryDate).getTime() <= Date.now()

                  return (
                    <tr key={item.id} className="bg-white">
                      <td className="px-5 py-3 font-bold text-ink">{item.code}</td>
                      <td className="px-5 py-3 font-semibold text-harbor">
                        {formatPrice(item.discountAmount)}
                      </td>
                      <td className="px-5 py-3 text-slate-600">{formatDate(item.expiryDate)}</td>
                      <td className="px-5 py-3 text-slate-700">
                        {item.remainingUsage ?? 'Unlimited'}
                      </td>
                      <td className="px-5 py-3 text-slate-600">{formatDate(item.createdAt)}</td>
                      <td className="px-5 py-3">
                        <Badge
                          className={
                            expired
                              ? 'border-red-100 bg-red-50 text-red-700'
                              : 'border-emerald-100 bg-emerald-50 text-harbor'
                          }
                        >
                          {expired ? 'Expired' : 'Active'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end">
                          <Button variant="info" onClick={() => showDiscountDetail(item, kind)}>
                            <Eye size={15} />
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {visibleItems.length === 0 && (
                  <tr>
                    <td className="px-5 py-8 text-center text-slate-600" colSpan={7}>
                      Data tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing {filteredItems.length === 0 ? 0 : startIndex + 1}-
              {Math.min(startIndex + pageSize, filteredItems.length)} of {filteredItems.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                disabled={safePage <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ChevronLeft size={15} />
                Prev
              </Button>
              <span className="grid h-10 min-w-14 place-items-center rounded-md border border-slate-200 bg-white px-3 font-bold text-ink">
                {safePage}/{totalPages}
              </span>
              <Button
                variant="secondary"
                disabled={safePage >= totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              >
                Next
                <ChevronRight size={15} />
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  )
}

function SortableTh({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <th className="px-5 py-3">
      <button
        type="button"
        className="inline-flex items-center gap-1 font-bold uppercase text-slate-500"
        onClick={onClick}
      >
        {label}
        <ArrowDownUp size={13} className={active ? 'text-harbor' : 'text-slate-300'} />
      </button>
    </th>
  )
}

function Metric({ icon, label, value }: { icon: JSX.Element; label: string; value: string }) {
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

function getAdminTitle(view: AdminView) {
  if (view === 'vouchers') return 'Voucher management'
  if (view === 'promos') return 'Promo management'
  return 'Admin overview'
}

function getAdminSubtitle(view: AdminView) {
  if (view === 'vouchers') {
    return 'Halaman khusus voucher dengan datatable, search, sort, pagination, dan detail data.'
  }
  if (view === 'promos') {
    return 'Halaman khusus promo dengan datatable, search, sort, pagination, dan detail data.'
  }
  return 'Ringkasan operasional admin discount console untuk voucher dan promo checkout.'
}

function getSortValue(item: DiscountResource, sortKey: SortKey) {
  if (sortKey === 'discountAmount') return item.discountAmount
  if (sortKey === 'remainingUsage') return item.remainingUsage ?? Number.MAX_SAFE_INTEGER
  if (sortKey === 'expiryDate') return new Date(item.expiryDate).getTime()
  if (sortKey === 'createdAt') return new Date(item.createdAt).getTime()
  return item.code
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('id-ID')
}

function showDiscountDetail(item: DiscountResource, kind: 'voucher' | 'promo') {
  return Swal.fire({
    icon: 'info',
    title: item.code,
    confirmButtonColor: '#0f766e',
    html: `
      <div class="grid gap-2 text-left text-sm">
        <div><strong>Type:</strong> ${kind === 'voucher' ? 'Voucher' : 'Promo'}</div>
        <div><strong>Discount:</strong> ${formatPrice(item.discountAmount)}</div>
        <div><strong>Expiry:</strong> ${formatDate(item.expiryDate)}</div>
        <div><strong>Usage:</strong> ${item.remainingUsage ?? 'Unlimited'}</div>
        <div><strong>Created:</strong> ${formatDate(item.createdAt)}</div>
      </div>
    `,
  })
}

async function openDiscountModal(type: 'voucher' | 'promo') {
  const defaultExpiry = new Date()
  defaultExpiry.setDate(defaultExpiry.getDate() + 30)

  const result = await Swal.fire<DiscountPayload>({
    title: type === 'voucher' ? 'Create voucher' : 'Create promo',
    html: `
      <div class="grid gap-3 text-left">
        <label class="grid gap-1 text-sm font-semibold text-slate-700">
          Kode
          <input id="discount-code" class="swal2-input !mx-0 !mt-1 !w-full" placeholder="Contoh: HEMAT50" />
        </label>
        <label class="grid gap-1 text-sm font-semibold text-slate-700">
          Nominal diskon
          <input id="discount-amount" type="number" min="1000" class="swal2-input !mx-0 !mt-1 !w-full" placeholder="50000" />
        </label>
        <label class="grid gap-1 text-sm font-semibold text-slate-700">
          Expiry date
          <input id="discount-expiry" type="datetime-local" class="swal2-input !mx-0 !mt-1 !w-full" value="${toDatetimeLocal(defaultExpiry)}" />
        </label>
        ${
          type === 'voucher'
            ? `<label class="grid gap-1 text-sm font-semibold text-slate-700">
                Remaining usage
                <input id="discount-usage" type="number" min="1" class="swal2-input !mx-0 !mt-1 !w-full" placeholder="25" />
              </label>`
            : ''
        }
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonColor: '#0f766e',
    cancelButtonColor: '#78716c',
    confirmButtonText: type === 'voucher' ? 'Create voucher' : 'Create promo',
    cancelButtonText: 'Batal',
    preConfirm: () => {
      const code = readModalValue('discount-code').trim().toUpperCase()
      const discountAmount = Number(readModalValue('discount-amount'))
      const expiryValue = readModalValue('discount-expiry')
      const expiryDate = new Date(expiryValue)
      const remainingUsage = Number(readModalValue('discount-usage'))

      if (code.length < 3) {
        Swal.showValidationMessage('Kode minimal 3 karakter.')
        return false
      }
      if (!Number.isInteger(discountAmount) || discountAmount < 1000) {
        Swal.showValidationMessage('Nominal diskon minimal Rp 1.000.')
        return false
      }
      if (Number.isNaN(expiryDate.getTime()) || expiryDate.getTime() <= Date.now()) {
        Swal.showValidationMessage('Expiry date harus tanggal masa depan.')
        return false
      }
      if (type === 'voucher' && (!Number.isInteger(remainingUsage) || remainingUsage < 1)) {
        Swal.showValidationMessage('Remaining usage minimal 1.')
        return false
      }

      return {
        code,
        discountAmount,
        expiryDate: expiryDate.toISOString(),
        ...(type === 'voucher' ? { remainingUsage } : {}),
      }
    },
  })

  return result.value
}

function readModalValue(id: string) {
  return (document.getElementById(id) as HTMLInputElement | null)?.value ?? ''
}

function toDatetimeLocal(date: Date) {
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}
