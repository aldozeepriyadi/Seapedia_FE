import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Home, MapPin, PackageCheck, TicketPercent } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../lib/api'
import { showConfirm, showError, showSuccess } from '../lib/alerts'
import { formatPrice } from '../lib/format'
import { BuyerAddress, CartSummary, CheckoutSummary, DeliveryMethod, WalletSummary } from '../types'

const deliveryOptions: { value: DeliveryMethod; label: string; description: string }[] = [
  { value: 'Regular', label: 'Regular', description: 'Ongkir hemat untuk pengiriman standar.' },
  { value: 'Next Day', label: 'Next Day', description: 'Estimasi sampai hari berikutnya.' },
  { value: 'Instant', label: 'Instant', description: 'Pengiriman tercepat untuk area tersedia.' },
]

export function CheckoutPage() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [cart, setCart] = useState<CartSummary | null>(null)
  const [wallet, setWallet] = useState<WalletSummary | null>(null)
  const [addresses, setAddresses] = useState<BuyerAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('Regular')
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscountCode, setAppliedDiscountCode] = useState('')
  const [checkout, setCheckout] = useState<CheckoutSummary | null>(null)
  const [addressForm, setAddressForm] = useState({
    recipientName: '',
    phone: '',
    addressLine: '',
    city: '',
    postalCode: '',
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === selectedAddressId),
    [addresses, selectedAddressId],
  )

  async function previewCheckout(nextDiscountCode = appliedDiscountCode) {
    if (!token) return

    const response = await apiFetch<{ checkout: CheckoutSummary }>('/buyer/checkout/preview', {
      method: 'POST',
      token,
      body: JSON.stringify({
        addressId: selectedAddressId || 'preview',
        deliveryMethod,
        discountCode: nextDiscountCode.trim() || undefined,
      }),
    })
    setCheckout(response.checkout)
    setError('')
    return response.checkout
  }

  async function loadCheckoutData() {
    if (!token) return
    setLoading(true)
    setError('')

    try {
      const [cartResponse, walletResponse, addressResponse] = await Promise.all([
        apiFetch<{ cart: CartSummary }>('/buyer/cart', { token }),
        apiFetch<{ wallet: WalletSummary }>('/buyer/wallet', { token }),
        apiFetch<{ addresses: BuyerAddress[] }>('/buyer/addresses', { token }),
      ])
      const defaultAddressId = addressResponse.addresses[0]?.id || ''
      setCart(cartResponse.cart)
      setWallet(walletResponse.wallet)
      setAddresses(addressResponse.addresses)
      setSelectedAddressId((current) => current || defaultAddressId)

      if (cartResponse.cart.items.length > 0) {
        const preview = await apiFetch<{ checkout: CheckoutSummary }>('/buyer/checkout/preview', {
          method: 'POST',
          token,
          body: JSON.stringify({
            addressId: defaultAddressId || 'preview',
            deliveryMethod,
            discountCode: appliedDiscountCode.trim() || undefined,
          }),
        })
        setCheckout(preview.checkout)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat checkout.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCheckoutData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  useEffect(() => {
    if (!token || !cart?.items.length) return

    apiFetch<{ checkout: CheckoutSummary }>('/buyer/checkout/preview', {
      method: 'POST',
      token,
      body: JSON.stringify({
        addressId: selectedAddressId || 'preview',
        deliveryMethod,
        discountCode: appliedDiscountCode.trim() || undefined,
      }),
    })
      .then((response) => setCheckout(response.checkout))
      .catch((err) => setError(err instanceof Error ? err.message : 'Preview checkout gagal.'))
  }, [appliedDiscountCode, cart?.items.length, deliveryMethod, selectedAddressId, token])

  async function handleApplyDiscount(event: FormEvent) {
    event.preventDefault()
    if (!token || !cart?.items.length) return

    setSubmitting(true)
    try {
      const normalizedCode = discountCode.trim().toUpperCase()
      const preview = await previewCheckout(normalizedCode)
      setAppliedDiscountCode(normalizedCode)

      if (normalizedCode && preview?.discountAmount) {
        await showSuccess(
          'Kode diskon terpasang',
          `${preview.discountType === 'VOUCHER' ? 'Voucher' : 'Promo'} ${preview.discountCode} mengurangi total ${formatPrice(preview.discountAmount)}.`,
        )
      } else {
        await showSuccess('Kode diskon dikosongkan', 'Checkout kembali memakai harga normal.')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kode diskon tidak valid.'
      setError(message)
      await showError('Kode diskon gagal', message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleAddressSubmit(event: FormEvent) {
    event.preventDefault()
    if (!token) return
    setSubmitting(true)
    setError('')

    try {
      const response = await apiFetch<{ address: BuyerAddress }>('/buyer/addresses', {
        method: 'POST',
        token,
        body: JSON.stringify({ ...addressForm, isPrimary: addresses.length === 0 }),
      })
      setAddresses((items) => [response.address, ...items])
      setSelectedAddressId(response.address.id)
      setAddressForm({ recipientName: '', phone: '', addressLine: '', city: '', postalCode: '' })
      await showSuccess('Alamat disimpan', 'Alamat pengiriman sudah masuk ke database.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Alamat gagal disimpan.'
      setError(message)
      await showError('Alamat gagal', message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCheckout() {
    if (!token || !selectedAddressId) return

    const confirmed = await showConfirm(
      'Buat pesanan?',
      'Wallet akan dipotong, stock produk dikurangi, dan order masuk ke history.',
      'Ya, checkout',
    )

    if (!confirmed) return

    setSubmitting(true)
    setError('')

    try {
      const response = await apiFetch<{ orderId: string; checkout: CheckoutSummary }>(
        '/buyer/checkout',
        {
          method: 'POST',
          token,
          body: JSON.stringify({
            addressId: selectedAddressId,
            deliveryMethod,
            discountCode: appliedDiscountCode.trim() || undefined,
          }),
        },
      )
      await showSuccess(
        'Pesanan berhasil',
        `Order ${response.orderId.slice(0, 12)} sudah dibuat dan masuk ke seller.`,
      )
      navigate(`/orders/${response.orderId}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Checkout gagal.'
      setError(message)
      await showError('Pesanan gagal', message)
    } finally {
      setSubmitting(false)
    }
  }

  if (user?.activeRole !== 'BUYER') {
    return (
      <section className="page-shell py-10">
        <Card className="p-5 text-sm text-slate-600">
          Checkout hanya tersedia untuk active role BUYER.
        </Card>
      </section>
    )
  }

  return (
    <section className="page-shell py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge className="border-emerald-100 bg-emerald-50 text-harbor">
            Checkout
          </Badge>
          <h1 className="mt-3 text-3xl font-bold text-ink">Pembayaran</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Konfirmasi alamat, metode pengiriman, total PPN, dan pembayaran wallet.
          </p>
        </div>
        <Link to="/keranjang">
          <Button variant="secondary">
            <ArrowLeft size={16} />
            Back to cart
          </Button>
        </Link>
      </div>

      {error && <p className="mt-6 text-sm font-semibold text-red-600">{error}</p>}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_24rem]">
        <div className="grid gap-6">
          <Card className="p-5 shadow-soft">
            <div className="flex gap-3">
              <MapPin className="mt-0.5 text-harbor" size={21} />
              <div>
                <h2 className="text-lg font-bold text-ink">Delivery address</h2>
                <p className="text-sm text-slate-600">Alamat disimpan saat checkout.</p>
              </div>
            </div>

            {addresses.length > 0 && (
              <div className="mt-5 grid gap-3">
                <select
                  className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-ink outline-none focus:border-harbor focus:ring-2 focus:ring-emerald-100"
                  value={selectedAddressId}
                  onChange={(event) => setSelectedAddressId(event.target.value)}
                >
                  {addresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.recipientName} - {address.city}
                    </option>
                  ))}
                </select>
                {selectedAddress && (
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                    <p className="font-bold text-ink">{selectedAddress.recipientName}</p>
                    <p>{selectedAddress.phone}</p>
                    <p>{selectedAddress.addressLine}</p>
                    <p>
                      {selectedAddress.city}, {selectedAddress.postalCode}
                    </p>
                  </div>
                )}
              </div>
            )}

            <form className="mt-5 grid gap-3" onSubmit={handleAddressSubmit}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  value={addressForm.recipientName}
                  onChange={(event) => setAddressForm((form) => ({ ...form, recipientName: event.target.value }))}
                  placeholder="Nama penerima"
                />
                <Input
                  value={addressForm.phone}
                  onChange={(event) => setAddressForm((form) => ({ ...form, phone: event.target.value }))}
                  placeholder="Nomor telepon"
                />
              </div>
              <Input
                value={addressForm.addressLine}
                onChange={(event) => setAddressForm((form) => ({ ...form, addressLine: event.target.value }))}
                placeholder="Alamat lengkap"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  value={addressForm.city}
                  onChange={(event) => setAddressForm((form) => ({ ...form, city: event.target.value }))}
                  placeholder="Kota"
                />
                <Input
                  value={addressForm.postalCode}
                  onChange={(event) => setAddressForm((form) => ({ ...form, postalCode: event.target.value }))}
                  placeholder="Kode pos"
                />
              </div>
              <Button variant="secondary" disabled={submitting}>
                <Home size={16} />
                Save address
              </Button>
            </form>
          </Card>

          <Card className="p-5 shadow-soft">
            <h2 className="text-lg font-bold text-ink">Delivery method</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {deliveryOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`rounded-md border p-4 text-left transition ${
                    deliveryMethod === option.value
                      ? 'border-harbor bg-emerald-50'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                  onClick={() => setDeliveryMethod(option.value)}
                >
                  <span className="font-bold text-ink">{option.label}</span>
                  <span className="mt-1 block text-sm text-slate-600">{option.description}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <Card className="h-fit p-5 shadow-soft">
          <h2 className="text-lg font-bold text-ink">Checkout summary</h2>
          {loading ? (
            <p className="mt-4 text-sm text-slate-600">Memuat checkout...</p>
          ) : (
            <>
              <div className="mt-5 grid gap-3 text-sm">
                <SummaryRow label="Wallet" value={formatPrice(wallet?.balance ?? 0)} />
                <SummaryRow label="Subtotal" value={formatPrice(checkout?.subtotal ?? cart?.subtotal ?? 0)} />
                <form className="grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-3" onSubmit={handleApplyDiscount}>
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Voucher / Promo
                  </label>
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                    <Input
                      value={discountCode}
                      onChange={(event) => setDiscountCode(event.target.value.toUpperCase())}
                      placeholder="WELCOME50 / PROMO25"
                    />
                    <Button variant="secondary" disabled={submitting || !cart?.items.length}>
                      <TicketPercent size={16} />
                      Apply
                    </Button>
                  </div>
                  {checkout?.discountCode && (
                    <p className="text-xs font-semibold text-harbor">
                      {checkout.discountType === 'VOUCHER' ? 'Voucher' : 'Promo'} {checkout.discountCode} aktif.
                    </p>
                  )}
                </form>
                {(checkout?.discountAmount ?? 0) > 0 && (
                  <>
                    <SummaryRow label="Discount" value={`-${formatPrice(checkout?.discountAmount ?? 0)}`} />
                    <SummaryRow label="Taxable subtotal" value={formatPrice(checkout?.taxableAmount ?? 0)} />
                  </>
                )}
                <SummaryRow label="Delivery" value={formatPrice(checkout?.deliveryFee ?? 0)} />
                <SummaryRow label="PPN 12%" value={formatPrice(checkout?.ppn ?? 0)} />
                <div className="border-t border-slate-200 pt-3">
                  <SummaryRow label="Final total" value={formatPrice(checkout?.finalTotal ?? 0)} strong />
                </div>
              </div>
              <Button
                className="mt-5 w-full"
                disabled={!cart?.items.length || !selectedAddressId || submitting}
                onClick={handleCheckout}
              >
                <PackageCheck size={16} />
                {submitting ? 'Memproses...' : 'Pay with wallet'}
              </Button>
            </>
          )}
        </Card>
      </div>
    </section>
  )
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-600">{label}</span>
      <span className={strong ? 'text-base font-bold text-harbor' : 'font-bold text-ink'}>
        {value}
      </span>
    </div>
  )
}
