import { unstable_cache } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import type { Product, Category, HeroSlide } from '@/types'

export interface SiteSettings {
  brand_name: string
  brand_tagline: string
  site_name: string
  contact_email: string
  instagram_url: string
  facebook_url: string
  show_instagram: string
  show_facebook: string
  footer_whatsapp: string
  show_whatsapp: string
  show_newsletter: string
  footer_copyright: string
  footer_shop_links: string
  footer_help_links: string
  whatsapp_number: string
  [key: string]: string
}

export interface Testimonial {
  id: string
  customer_name: string
  customer_image_url: string | null
  quote: string
  rating: number
  product_name: string | null
  location: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export const getCachedCategories = unstable_cache(
  async () => {
    const db = getDb()
    const { data } = await db
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    return (data || []) as Category[]
  },
  ['categories'],
  { tags: ['categories'], revalidate: 600 }
)

export const getCachedHomeData = unstable_cache(
  async () => {
    const db = getDb()
    const [featuredRes, newRes, bestRes, categoriesRes, slidesRes] = await Promise.all([
      db
        .from('products')
        .select('*, category:categories(*), images:product_images(*)')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('sort_order')
        .limit(8),
      db
        .from('products')
        .select('*, category:categories(*), images:product_images(*)')
        .eq('is_active', true)
        .eq('is_new_arrival', true)
        .order('created_at', { ascending: false })
        .limit(4),
      db
        .from('products')
        .select('*, category:categories(*), images:product_images(*)')
        .eq('is_active', true)
        .eq('is_best_seller', true)
        .order('sort_order')
        .limit(4),
      db.from('categories').select('*').eq('is_active', true).order('sort_order').limit(6),
      db.from('hero_slides').select('*').eq('is_active', true).order('sort_order'),
    ])
    return {
      featured: (featuredRes.data || []) as Product[],
      newArrivals: (newRes.data || []) as Product[],
      bestSellers: (bestRes.data || []) as Product[],
      categories: (categoriesRes.data || []) as Category[],
      heroSlides: (slidesRes.data || []) as HeroSlide[],
    }
  },
  ['home-data'],
  { tags: ['products', 'categories', 'hero-slides'], revalidate: 300 }
)

export const getCachedShopData = unstable_cache(
  async (
    category: string,
    search: string,
    sort: string,
    filter: string,
    minPrice: string,
    maxPrice: string,
    sizes: string,
    page: number
  ) => {
    const db = getDb()
    const pageSize = 12
    const from = (page - 1) * pageSize

    let query = db
      .from('products')
      .select('*, category:categories(*), images:product_images(*)', { count: 'exact' })
      .eq('is_active', true)

    if (category) {
      const { data: cat } = await db
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single()
      if (cat) query = query.eq('category_id', cat.id)
    }
    if (search) query = query.ilike('name', `%${search}%`)
    if (filter === 'new') query = query.eq('is_new_arrival', true)
    if (filter === 'bestseller') query = query.eq('is_best_seller', true)
    if (filter === 'sale') query = query.not('sale_price', 'is', null)
    if (filter === 'featured') query = query.eq('is_featured', true)
    if (minPrice) query = query.gte('price', parseFloat(minPrice))
    if (maxPrice) query = query.lte('price', parseFloat(maxPrice))
    if (sizes) query = query.overlaps('sizes', sizes.split(','))

    switch (sort) {
      case 'price_asc': query = query.order('price', { ascending: true }); break
      case 'price_desc': query = query.order('price', { ascending: false }); break
      case 'newest': query = query.order('created_at', { ascending: false }); break
      default: query = query.order('sort_order').order('created_at', { ascending: false })
    }

    const { data, count } = await query.range(from, from + pageSize - 1)
    return {
      products: (data || []) as Product[],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    }
  },
  ['shop-products'],
  { tags: ['products', 'categories'], revalidate: 60 }
)

export const getCachedProduct = unstable_cache(
  async (slug: string) => {
    const db = getDb()
    const { data } = await db
      .from('products')
      .select('*, category:categories(*), images:product_images(*), reviews:product_reviews(*)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()
    return (data as Product | null)
  },
  ['product-detail'],
  { tags: ['products'], revalidate: 60 }
)

export const getCachedRelatedProducts = unstable_cache(
  async (categoryId: string, excludeId: string) => {
    const db = getDb()
    const { data } = await db
      .from('products')
      .select('*, category:categories(*), images:product_images(*)')
      .eq('is_active', true)
      .eq('category_id', categoryId)
      .neq('id', excludeId)
      .limit(4)
    return (data || []) as Product[]
  },
  ['related-products'],
  { tags: ['products'], revalidate: 300 }
)

export const getCachedSiteSettings = unstable_cache(
  async () => {
    const db = getDb()
    const { data } = await db.from('settings').select('key, value')
    const settings: SiteSettings = {
      brand_name: 'Vela Intimates',
      brand_tagline: 'Luxury lingerie crafted for the modern woman.',
      site_name: 'Vela Intimates',
      contact_email: '',
      instagram_url: '',
      facebook_url: '',
      show_instagram: 'true',
      show_facebook: 'true',
      footer_whatsapp: '',
      show_whatsapp: 'true',
      show_newsletter: 'true',
      footer_copyright: 'Vela Intimates. All rights reserved.',
      footer_shop_links: '[]',
      footer_help_links: '[]',
      whatsapp_number: '',
    }
    for (const row of data || []) {
      settings[row.key] = row.value || ''
    }
    return settings
  },
  ['site-settings'],
  { tags: ['site-settings'], revalidate: 300 }
)

export const getCachedTestimonials = unstable_cache(
  async () => {
    const db = getDb()
    const { data } = await db
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    return (data || []) as Testimonial[]
  },
  ['testimonials'],
  { tags: ['testimonials'], revalidate: 300 }
)
