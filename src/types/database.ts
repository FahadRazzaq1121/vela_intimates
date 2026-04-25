export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'packed' | 'dispatched' | 'delivered' | 'cancelled'
export type PaymentMethod = 'cod' | 'manual' | 'stripe'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ProductColor {
  name: string
  hex: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  price: number
  sale_price: number | null
  cost_price: number | null
  sku: string | null
  category_id: string | null
  stock_quantity: number
  low_stock_threshold: number
  is_active: boolean
  is_featured: boolean
  is_new_arrival: boolean
  is_best_seller: boolean
  sizes: string[]
  colors: ProductColor[]
  tags: string[]
  weight: number | null
  materials: string | null
  care_instructions: string | null
  meta_title: string | null
  meta_description: string | null
  sort_order: number
  created_at: string
  updated_at: string
  // Joined
  category?: Category
  images?: ProductImage[]
  reviews?: ProductReview[]
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  alt_text: string | null
  is_primary: boolean
  sort_order: number
  created_at: string
}

export interface Customer {
  id: string
  email: string
  full_name: string
  phone: string | null
  total_orders: number
  total_spent: number
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  customer_id: string | null
  shipping_full_name: string
  shipping_email: string
  shipping_phone: string | null
  shipping_address: string
  shipping_city: string
  shipping_country: string
  shipping_postal_code: string | null
  notes: string | null
  subtotal: number
  discount_amount: number
  shipping_fee: number
  total: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  status: OrderStatus
  coupon_code: string | null
  tracking_number: string | null
  tracking_url: string | null
  created_at: string
  updated_at: string
  delivered_at: string | null
  cancelled_at: string | null
  cancel_reason: string | null
  // Joined
  items?: OrderItem[]
  customer?: Customer
  status_history?: OrderStatusHistory[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_sku: string | null
  product_image: string | null
  size: string | null
  color: string | null
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface Coupon {
  id: string
  code: string
  description: string | null
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  minimum_order: number
  usage_limit: number | null
  usage_count: number
  is_active: boolean
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface NewsletterSubscriber {
  id: string
  email: string
  name: string | null
  is_active: boolean
  subscribed_at: string
  unsubscribed_at: string | null
}

export interface ProductReview {
  id: string
  product_id: string
  order_id: string | null
  customer_name: string
  customer_email: string
  rating: number
  title: string | null
  body: string | null
  is_verified: boolean
  is_approved: boolean
  created_at: string
}

export interface OrderStatusHistory {
  id: string
  order_id: string
  status: OrderStatus
  note: string | null
  created_by: string | null
  created_at: string
}

export interface Admin {
  id: string
  email: string
  full_name: string | null
  is_active: boolean
  created_at: string
}

export interface Setting {
  key: string
  value: string | null
  updated_at: string
}

export interface HeroSlide {
  id: string
  image_url: string
  tag: string | null
  title: string
  subtitle: string | null
  cta_text: string | null
  cta_href: string | null
  cta_secondary_text: string | null
  cta_secondary_href: string | null
  align: 'left' | 'center' | 'right'
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}
