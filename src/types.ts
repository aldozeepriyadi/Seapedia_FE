export type Role = 'ADMIN' | 'BUYER' | 'SELLER' | 'DRIVER'

export type User = {
  id: string
  username: string
  displayName: string
  roles: Role[]
  activeRole: Role | null
  createdAt: string
}

export type Product = {
  id: string
  storeId: string
  sellerId: string
  name: string
  price: number
  storeName: string
  storeDescription: string
  category: string
  stock: number
  image: string
  description: string
}

export type WalletTransaction = {
  id: string
  type: 'TOP_UP' | 'PAYMENT' | 'REFUND'
  amount: number
  description: string
  createdAt: string
}

export type WalletSummary = {
  balance: number
  transactions: WalletTransaction[]
}

export type BuyerAddress = {
  id: string
  recipientName: string
  phone: string
  addressLine: string
  city: string
  postalCode: string
  isPrimary: boolean
}

export type CartItem = {
  id: string
  productId: string
  name: string
  price: number
  stock: number
  quantity: number
  subtotal: number
  storeId: string
  storeName: string
  image: string
}

export type CartSummary = {
  id: string
  userId: string
  storeId: string | null
  storeName: string | null
  items: CartItem[]
  subtotal: number
}

export type DeliveryMethod = 'Instant' | 'Next Day' | 'Regular'

export type CheckoutSummary = {
  subtotal: number
  deliveryMethod: DeliveryMethod
  deliveryFee: number
  ppn: number
  ppnRate: number
  finalTotal: number
}

export type OrderSummary = {
  id: string
  buyerId: string
  buyerName: string
  sellerId: string
  storeId: string
  storeName: string
  deliveryMethod: DeliveryMethod
  deliveryFee: number
  subtotal: number
  ppn: number
  finalTotal: number
  status: string
  createdAt: string
}

export type OrderDetail = {
  order: OrderSummary
  items: {
    id: string
    productId: string
    productName: string
    unitPrice: number
    quantity: number
    subtotal: number
  }[]
  history: {
    id: string
    status: string
    note: string
    createdAt: string
  }[]
}

export type BuyerReport = {
  orderCount: number
  totalSpending: number
  totalPpn: number
  totalDeliveryFee: number
}

export type Store = {
  id: string
  sellerId: string
  storeName: string
  description: string
  createdAt: string
  updatedAt: string
}

export type AppReview = {
  id: string
  reviewerName: string
  rating: number
  comment: string
  createdAt: string
}

export type AuthResponse = {
  token: string
  user: User
  requiresRoleSelection: boolean
}
