import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  return (
    <section className="page-shell grid min-h-[calc(100vh-8rem)] place-items-center py-12 text-center">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-harbor">404</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">Page not found</h1>
        <p className="mt-2 text-sm text-slate-600">Halaman ini tidak tersedia.</p>
        <Link to="/" className="mt-6 inline-block">
          <Button>Back home</Button>
        </Link>
      </div>
    </section>
  )
}
