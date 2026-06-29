import { Navigate, Route, Routes } from 'react-router-dom'
import { PageLayout } from './components/PageLayout'
import { RedirectIfAuthed, RequireAuth } from './components/RouteGuards'
import { useAuth } from './context/AuthContext'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { ChooseRolePage } from './pages/ChooseRolePage'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { DashboardPage } from './pages/DashboardPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { ProductsPage } from './pages/ProductsPage'
import { ProfilePage } from './pages/ProfilePage'
import { RegisterPage } from './pages/RegisterPage'
import { OrderDetailPage } from './pages/OrderDetailPage'
import { SellerDashboardPage } from './pages/SellerDashboardPage'

function App() {
  return (
    <Routes>
      <Route element={<PageLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />

        <Route element={<RedirectIfAuthed />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route path="choose-role" element={<ChooseRolePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="admin" element={<AdminRoutePage view="overview" />} />
          <Route path="admin/vouchers" element={<AdminRoutePage view="vouchers" />} />
          <Route path="admin/promos" element={<AdminRoutePage view="promos" />} />
          <Route path="seller" element={<SellerRoutePage view="overview" />} />
          <Route path="seller/store" element={<SellerRoutePage view="store" />} />
          <Route path="seller/products" element={<SellerRoutePage view="products" />} />
          <Route path="seller/orders" element={<SellerRoutePage view="orders" />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="keranjang" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="pembayaran" element={<CheckoutPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

function AdminRoutePage({ view }: { view: 'overview' | 'vouchers' | 'promos' }) {
  const { token, user } = useAuth()

  if (!token || user?.activeRole !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  return <AdminDashboardPage token={token} view={view} />
}

function SellerRoutePage({ view }: { view: 'overview' | 'store' | 'products' | 'orders' }) {
  const { token, user } = useAuth()

  if (!token || user?.activeRole !== 'SELLER') {
    return <Navigate to="/dashboard" replace />
  }

  return <SellerDashboardPage token={token} view={view} />
}

export default App
