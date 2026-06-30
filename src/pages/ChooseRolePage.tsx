import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Role } from '../types'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

const roleCopy: Record<Role, string> = {
  ADMIN: 'Konteks admin dikenali untuk pemisahan akses internal.',
  BUYER: 'Buyer dapat mengelola wallet, keranjang, checkout, dan order history.',
  SELLER: 'Seller dapat membuat store, mengelola produk, memproses order, dan tracking delivery pada Level 5.',
  DRIVER: 'Driver dapat mencari job, mengambil pengiriman, menyelesaikan delivery, dan melihat earning.',
}

export function ChooseRolePage() {
  const { user, selectRole } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loadingRole, setLoadingRole] = useState<Role | null>(null)

  if (!user) return null

  async function handleSelect(role: Role) {
    setLoadingRole(role)
    setError('')

    try {
      await selectRole(role)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memilih role.')
    } finally {
      setLoadingRole(null)
    }
  }

  return (
    <section className="page-shell py-12">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-wide text-harbor">
          Active role required
        </p>
        <h1 className="mt-2 text-3xl font-bold text-ink">Pilih role untuk sesi ini</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Authorization mengikuti active role, bukan semua role yang dimiliki user.
          Kamu bisa kembali ke halaman ini untuk mengganti konteks sesi.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {user.roles.map((role) => (
            <Card key={role} className="grid gap-4 p-5 shadow-soft">
              <div>
                <h2 className="text-lg font-bold text-ink">{role}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{roleCopy[role]}</p>
              </div>
              <Button disabled={loadingRole === role} onClick={() => handleSelect(role)}>
                {loadingRole === role ? 'Memilih...' : `Gunakan ${role}`}
              </Button>
            </Card>
          ))}
        </div>
        {error && <p className="mt-5 text-sm font-semibold text-red-600">{error}</p>}
      </div>
    </section>
  )
}
