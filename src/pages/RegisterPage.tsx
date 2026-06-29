import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { showError, showSuccess } from '../lib/alerts'
import { cn } from '../lib/cn'
import { Role } from '../types'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'

const roleOptions: { role: Role; label: string; text: string }[] = [
  { role: 'BUYER', label: 'Buyer', text: 'Marketplace browsing session' },
  { role: 'SELLER', label: 'Seller', text: 'Store and product management' },
  { role: 'DRIVER', label: 'Driver', text: 'Delivery role identity' },
]

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [roles, setRoles] = useState<Role[]>(['BUYER'])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function toggleRole(role: Role) {
    setRoles((items) => {
      if (items.includes(role)) {
        const next = items.filter((item) => item !== role)
        return next.length > 0 ? next : items
      }

      return [...items, role]
    })
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const response = await register({ displayName, username, password, roles })
      await showSuccess('Register berhasil', 'Akun baru sudah tersimpan di database.')
      navigate(response.requiresRoleSelection ? '/choose-role' : '/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Register gagal.'
      setError(message)
      await showError('Register gagal', message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="page-shell grid min-h-[calc(100vh-8rem)] place-items-center py-12">
      <Card className="w-full max-w-2xl p-6 shadow-soft">
        <h1 className="text-2xl font-bold text-ink">Register</h1>
        <p className="mt-2 text-sm text-slate-600">
          Non-admin user boleh punya lebih dari satu role. Setelah login, active role
          menentukan dashboard dan akses API.
        </p>
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Nama
              <Input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Username
              <Input value={username} onChange={(event) => setUsername(event.target.value)} />
            </label>
          </div>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Password
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimal 8 karakter"
            />
          </label>

          <div className="grid gap-2">
            <p className="text-sm font-semibold text-slate-700">Roles</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {roleOptions.map((item) => {
                const active = roles.includes(item.role)
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => toggleRole(item.role)}
                    className={cn(
                      'rounded-md border p-4 text-left transition',
                      active
                        ? 'border-harbor bg-emerald-50 text-ink'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                    )}
                  >
                    <span className="font-bold">{item.label}</span>
                    <span className="mt-1 block text-xs text-slate-500">{item.text}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
          <Button disabled={submitting}>{submitting ? 'Membuat akun...' : 'Register'}</Button>
        </form>
        <p className="mt-5 text-sm text-slate-600">
          Sudah punya akun?{' '}
          <Link className="font-bold text-harbor" to="/login">
            Login
          </Link>
        </p>
      </Card>
    </section>
  )
}
