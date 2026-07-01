import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { showError, showSuccess } from '../lib/alerts'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const response = await login(identifier, password)
      await showSuccess(
        'Login berhasil',
        response.requiresRoleSelection
          ? 'Silakan pilih active role untuk sesi ini.'
          : `Masuk sebagai ${response.user.activeRole}.`,
      )
      navigate(response.requiresRoleSelection ? '/choose-role' : '/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login gagal.'
      setError(message)
      await showError('Login gagal', message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="page-shell grid min-h-[calc(100vh-8rem)] place-items-center py-12">
      <Card className="w-full max-w-md p-6 shadow-soft">
        <h1 className="text-2xl font-bold text-ink">Login</h1>
        <p className="mt-2 text-sm text-slate-600">
          Masuk sebagai user SEAPEDIA, lalu pilih role aktif untuk sesi ini.
        </p>
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Username atau email
            <Input
              autoComplete="username"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="admin atau admin@seapedia.test"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Password
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
          <Button disabled={submitting}>{submitting ? 'Masuk...' : 'Login'}</Button>
        </form>
        
        <p className="mt-5 text-sm text-slate-600">
          Belum punya akun?{' '}
          <Link className="font-bold text-harbor" to="/register">
            Register
          </Link>
        </p>
      </Card>
    </section>
  )
}
