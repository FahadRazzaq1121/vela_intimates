export * from './database'

export interface CartItem {
  id: string
  product_id: string
  name: string
  slug: string
  price: number
  sale_price: number | null
  image: string
  size: string | null
  color: string | null
  quantity: number
  stock_quantity: number
}

export interface CartState {
  items: CartItem[]
  total: number
  subtotal: number
  itemCount: number
}

export interface CheckoutFormData {
  full_name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  postal_code: string
  notes: string
  payment_method: 'cod' | 'manual'
  coupon_code: string
}

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  sizes?: string[]
  search?: string
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular'
  page?: number
  pageSize?: number
  featured?: boolean
  newArrival?: boolean
  bestSeller?: boolean
}

export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  pendingOrders: number
  todayOrders: number
  totalProducts: number
  totalCustomers: number
  revenueGrowth: number
  ordersGrowth: number
}
