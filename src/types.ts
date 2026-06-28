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
  category: string
  stock: number
  image: string
  description: string
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
