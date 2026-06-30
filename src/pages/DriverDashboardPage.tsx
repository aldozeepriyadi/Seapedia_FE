import { ReactNode, useEffect, useState } from 'react'
import {
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Eye,
  History,
  LayoutDashboard,
  MapPin,
  PackageCheck,
  RefreshCw,
  Truck,
} from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { cn } from '../lib/cn'
import { apiFetch } from '../lib/api'
import { showConfirm, showError, showSuccess, Swal } from '../lib/alerts'
import { formatPrice } from '../lib/format'
import { DeliveryJob, DriverReport } from '../types'

type DriverView = 'overview' | 'available' | 'active' | 'history'

export function DriverDashboardPage({
  token,
  view = 'overview',
}: {
  token: string
  view?: DriverView
}) {
  const [availableJobs, setAvailableJobs] = useState<DeliveryJob[]>([])
  const [activeJob, setActiveJob] = useState<DeliveryJob | null>(null)
  const [history, setHistory] = useState<DeliveryJob[]>([])
  const [report, setReport] = useState<DriverReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadDriverData() {
    setLoading(true)
    setError('')

    try {
      const [availableResponse, activeResponse, historyResponse, reportResponse] =
        await Promise.all([
          apiFetch<{ jobs: DeliveryJob[] }>('/driver/jobs/available', { token }),
          apiFetch<{ job: DeliveryJob | null }>('/driver/jobs/active', { token }),
          apiFetch<{ jobs: DeliveryJob[] }>('/driver/jobs/history', { token }),
          apiFetch<{ report: DriverReport }>('/driver/reports/summary', { token }),
        ])

      setAvailableJobs(availableResponse.jobs)
      setActiveJob(activeResponse.job)
      setHistory(historyResponse.jobs)
      setReport(reportResponse.report)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat dashboard driver.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDriverData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function takeJob(job: DeliveryJob) {
    const confirmed = await showConfirm(
      'Ambil delivery job?',
      `Order dari ${job.storeName} akan masuk ke active delivery kamu.`,
      'Ya, ambil job',
    )

    if (!confirmed) return

    try {
      await apiFetch(`/driver/jobs/${job.id}/take`, { method: 'POST', token })
      await loadDriverData()
      await showSuccess(
        'Job diambil',
        'Order berubah menjadi Sedang Dikirim dan history status tersimpan.',
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal mengambil job.'
      setError(message)
      await showError('Take job gagal', message)
    }
  }

  async function completeJob(job: DeliveryJob) {
    const confirmed = await showConfirm(
      'Selesaikan delivery?',
      `Konfirmasi order ${shortId(job.orderId)} sudah sampai ke buyer.`,
      'Ya, selesai',
    )

    if (!confirmed) return

    try {
      await apiFetch(`/driver/jobs/${job.id}/complete`, { method: 'POST', token })
      await loadDriverData()
      await showSuccess(
        'Delivery selesai',
        `Pesanan selesai. Earning kamu: ${formatPrice(job.earningAmount)}.`,
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menyelesaikan delivery.'
      setError(message)
      await showError('Complete job gagal', message)
    }
  }

  return (
    <section className="page-shell py-10">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge className="border-emerald-100 bg-emerald-50 text-harbor">
            DRIVER
          </Badge>
          <h1 className="mt-3 text-3xl font-bold text-ink">{getDriverTitle(view)}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            {getDriverSubtitle(view)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/choose-role">
            <Button variant="secondary">Switch role</Button>
          </Link>
          <Button variant="secondary" onClick={loadDriverData}>
            <RefreshCw size={16} />
            Refresh
          </Button>
        </div>
      </div>

      <DriverTabs
        availableCount={availableJobs.length}
        activeCount={activeJob ? 1 : 0}
        historyCount={history.length}
      />

      {error && <p className="mb-5 text-sm font-semibold text-red-600">{error}</p>}

      {view === 'overview' && (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              icon={<Truck size={20} />}
              label="Available jobs"
              value={String(report?.availableJobs ?? 0)}
            />
            <Metric
              icon={<Clock3 size={20} />}
              label="Active jobs"
              value={String(report?.activeJobs ?? 0)}
            />
            <Metric
              icon={<PackageCheck size={20} />}
              label="Completed"
              value={String(report?.completedJobs ?? 0)}
            />
            <Metric
              icon={<CircleDollarSign size={20} />}
              label="Earnings"
              value={formatPrice(report?.totalEarnings ?? 0)}
            />
          </div>

          <Card className="mt-6 p-5 shadow-soft">
            <h2 className="font-bold text-ink">Earning rule</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {report?.earningRule ?? 'Driver earning = delivery fee dari order yang selesai.'}
            </p>
          </Card>
        </>
      )}

      {view === 'available' && (
        <JobList
          title="Available delivery jobs"
          emptyText="Belum ada job siap diambil. Job baru muncul setelah seller memproses order."
          jobs={availableJobs}
          loading={loading}
          action={(job) => (
            <Button variant="success" onClick={() => takeJob(job)}>
              <Truck size={15} />
              Take job
            </Button>
          )}
        />
      )}

      {view === 'active' && (
        <JobList
          title="Active delivery"
          emptyText="Belum ada active delivery. Ambil job dari Available Jobs."
          jobs={activeJob ? [activeJob] : []}
          loading={loading}
          action={(job) => (
            <Button variant="success" onClick={() => completeJob(job)}>
              <CheckCircle2 size={15} />
              Complete
            </Button>
          )}
        />
      )}

      {view === 'history' && (
        <JobList
          title="Driver job history"
          emptyText="Belum ada job history."
          jobs={history}
          loading={loading}
        />
      )}
    </section>
  )
}

function DriverTabs({
  availableCount,
  activeCount,
  historyCount,
}: {
  availableCount: number
  activeCount: number
  historyCount: number
}) {
  const items = [
    { to: '/driver', label: 'Overview', icon: <LayoutDashboard size={16} /> },
    { to: '/driver/available', label: 'Available Jobs', icon: <Truck size={16} />, meta: availableCount },
    { to: '/driver/active', label: 'Active Delivery', icon: <PackageCheck size={16} />, meta: activeCount },
    { to: '/driver/history', label: 'History', icon: <History size={16} />, meta: historyCount },
  ]

  return (
    <div className="my-6 overflow-x-auto">
      <div className="inline-flex min-w-full gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm lg:min-w-0">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/driver'}
            className={({ isActive }) =>
              cn(
                'inline-flex h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-ink',
                isActive && 'bg-emerald-50 text-harbor',
              )
            }
          >
            {item.icon}
            {item.label}
            {typeof item.meta === 'number' && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                {item.meta}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  )
}

function JobList({
  title,
  emptyText,
  jobs,
  loading,
  action,
}: {
  title: string
  emptyText: string
  jobs: DeliveryJob[]
  loading: boolean
  action?: (job: DeliveryJob) => ReactNode
}) {
  return (
    <Card className="overflow-hidden shadow-soft">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-bold text-ink">{title}</h2>
      </div>

      {loading ? (
        <div className="p-5 text-sm text-slate-600">Memuat delivery jobs...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[940px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Store</th>
                <th className="px-5 py-3">Destination</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Delivery fee</th>
                <th className="px-5 py-3">Earning</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <tr key={job.id} className="bg-white">
                  <td className="px-5 py-3 font-bold text-ink">{shortId(job.orderId)}</td>
                  <td className="px-5 py-3 text-slate-700">{job.storeName}</td>
                  <td className="px-5 py-3 text-slate-700">
                    <div className="flex gap-2">
                      <MapPin className="mt-0.5 text-harbor" size={15} />
                      <div>
                        <p className="font-semibold text-ink">{job.recipientName}</p>
                        <p className="text-xs text-slate-500">
                          {job.city}, {job.postalCode}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge>{job.orderStatus}</Badge>
                  </td>
                  <td className="px-5 py-3 font-semibold text-harbor">
                    {formatPrice(job.deliveryFee)}
                  </td>
                  <td className="px-5 py-3 font-bold text-ink">
                    {formatPrice(job.earningAmount)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="info" onClick={() => showJobDetail(job)}>
                        <Eye size={15} />
                        Detail
                      </Button>
                      {action?.(job)}
                    </div>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-600" colSpan={7}>
                    {emptyText}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
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

function showJobDetail(job: DeliveryJob) {
  return Swal.fire({
    icon: 'info',
    title: `Order ${shortId(job.orderId)}`,
    confirmButtonColor: '#0f766e',
    html: `
      <div class="grid gap-2 text-left text-sm">
        <div><strong>Store:</strong> ${escapeHtml(job.storeName)}</div>
        <div><strong>Buyer:</strong> ${escapeHtml(job.buyerName)}</div>
        <div><strong>Status:</strong> ${escapeHtml(job.orderStatus)}</div>
        <div><strong>Recipient:</strong> ${escapeHtml(job.recipientName)}</div>
        <div><strong>Phone:</strong> ${escapeHtml(job.phone)}</div>
        <div><strong>Address:</strong> ${escapeHtml(job.addressLine)}, ${escapeHtml(job.city)} ${escapeHtml(job.postalCode)}</div>
        <div><strong>Earning:</strong> ${formatPrice(job.earningAmount)}</div>
      </div>
    `,
  })
}

function getDriverTitle(view: DriverView) {
  if (view === 'available') return 'Available jobs'
  if (view === 'active') return 'Active delivery'
  if (view === 'history') return 'Job history and earnings'
  return 'Driver overview'
}

function getDriverSubtitle(view: DriverView) {
  if (view === 'available') {
    return 'Ambil order yang sudah diproses seller dan siap dikirim.'
  }
  if (view === 'active') {
    return 'Pantau delivery yang sedang kamu bawa dan konfirmasi saat selesai.'
  }
  if (view === 'history') {
    return 'Lihat riwayat job driver dan earning dari delivery fee.'
  }
  return 'Ringkasan job tersedia, active delivery, completed job, dan earning driver.'
}

function shortId(value: string) {
  return value.length > 12 ? `${value.slice(0, 12)}...` : value
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
