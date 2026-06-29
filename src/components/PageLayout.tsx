import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export function PageLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="page-shell flex flex-col gap-2 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>SEAPEDIA Level 3 marketplace revision</p>
          <p>Catalog, seller products, buyer wallet, cart, checkout, and basic orders</p>
        </div>
      </footer>
    </div>
  )
}
