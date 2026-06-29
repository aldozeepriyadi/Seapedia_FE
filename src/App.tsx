import { Route, Routes } from 'react-router-dom'
import { PageLayout } from './components/PageLayout'
import { RedirectIfAuthed, RequireAuth } from './components/RouteGuards'
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

export default App
