export type Role = 'ADMIN' | 'BUYER' | 'SELLER' | 'DRIVER'

export type User = {
  id: string
  username: string
  email: string
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
  discountCode: string | null
  discountType: string | null
  discountAmount: number
  taxableAmount: number
  ppn: number
  ppnRate: number
  finalTotal: number
  storeCount?: number
  itemCount?: number
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
  discountCode: string | null
  discountType: string | null
  discountAmount: number
  taxableAmount: number
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
  totalDiscount: number
  totalPpn: number
  totalDeliveryFee: number
}

export type SellerReport = {
  orderCount: number
  totalIncome: number
  totalDiscount: number
  pendingOrders: number
  processedOrders: number
}

export type DiscountResource = {
  id: string
  code: string
  discountAmount: number
  expiryDate: string
  remainingUsage?: number
  createdAt: string
}

export type DeliveryJob = {
  id: string
  orderId: string
  orderStatus: string
  jobStatus: 'AVAILABLE' | 'TAKEN' | 'COMPLETED' | 'RETURNED'
  driverId: string | null
  buyerName: string
  sellerId: string
  storeName: string
  deliveryMethod: DeliveryMethod
  deliveryFee: number
  earningAmount: number
  recipientName: string
  phone: string
  addressLine: string
  city: string
  postalCode: string
  createdAt: string
  takenAt: string | null
  completedAt: string | null
}

export type DriverReport = {
  availableJobs: number
  activeJobs: number
  completedJobs: number
  totalEarnings: number
  earningRule: string
}

export type AdminMonitoringSnapshot = {
  summary: {
    users: number
    stores: number
    products: number
    orders: number
    vouchers: number
    promos: number
    deliveryJobs: number
    overdueOrders: number
  }
  slaRules: Record<DeliveryMethod, number>
  now: string
  users: {
    id: string
    username: string
    email: string
    displayName: string
    roles: Role[]
    createdAt: string
  }[]
  stores: {
    id: string
    storeName: string
    sellerName: string
    productCount: number
    createdAt: string
  }[]
  products: {
    id: string
    name: string
    storeName: string
    category: string
    price: number
    stock: number
    createdAt: string
  }[]
  recentOrders: {
    id: string
    buyerName: string
    storeName: string
    deliveryMethod: DeliveryMethod
    finalTotal: number
    status: string
    createdAt: string
  }[]
  deliveryJobs: {
    id: string
    orderId: string
    storeName: string
    driverName: string | null
    jobStatus: string
    orderStatus: string
    earningAmount: number
    createdAt: string
    takenAt: string | null
    completedAt: string | null
  }[]
  overdueOrders: {
    id: string
    buyerId: string
    buyerName: string
    storeName: string
    deliveryMethod: DeliveryMethod
    finalTotal: number
    status: string
    createdAt: string
    deadlineAt: string
  }[]
}

export type OverdueRunResult = {
  simulatedNow: string
  processedCount: number
  processedOrders: AdminMonitoringSnapshot['overdueOrders']
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
