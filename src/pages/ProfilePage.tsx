import { Link } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useAuth } from '../context/AuthContext'

export function ProfilePage() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <section className="page-shell py-10">
      <div className="max-w-4xl">
        <p className="text-sm font-bold uppercase tracking-wide text-harbor">Profile</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">{user.displayName}</h1>
        <p className="mt-2 text-sm text-slate-600">@{user.username}</p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Card className="p-5 shadow-soft">
            <h2 className="text-lg font-bold text-ink">Role ownership</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {user.roles.map((role) => (
                <Badge
                  key={role}
                  className={
                    user.activeRole === role
                      ? 'border-emerald-100 bg-emerald-50 text-harbor'
                      : undefined
                  }
                >
                  {role}
                </Badge>
              ))}
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              User dapat memiliki lebih dari satu role, tetapi authorization sesi hanya
              mengikuti active role yang sedang dipilih.
            </p>
            <Link to="/choose-role" className="mt-5 inline-block">
              <Button variant="secondary">Change active role</Button>
            </Link>
          </Card>

          <Card className="p-5 shadow-soft">
            <h2 className="text-lg font-bold text-ink">Session summary</h2>
            <div className="mt-5 grid gap-3">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Active role
                </p>
                <p className="mt-1 text-lg font-bold text-ink">
                  {user.activeRole ?? 'Belum dipilih'}
                </p>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Token
                </p>
                <p className="mt-1 text-sm font-semibold text-ink">JWT expires in 2 hours</p>
              </div>
              {user.activeRole && (
                <Link to="/dashboard">
                  <Button className="w-full">Open role dashboard</Button>
                </Link>
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
