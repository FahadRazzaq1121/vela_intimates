import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://velaintimates.com'

  const [productsRes, categoriesRes] = await Promise.all([
    supabase.from('products').select('slug, updated_at').eq('is_active', true),
    supabase.from('categories').select('slug, updated_at').eq('is_active', true),
  ])

  const productUrls: MetadataRoute.Sitemap = (productsRes.data || []).map((p) => ({
    url: `${siteUrl}/products/${p.slug}`,
    lastModified: p.updated_at,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const categoryUrls: MetadataRoute.Sitemap = (categoriesRes.data || []).map((c) => ({
    url: `${siteUrl}/shop?category=${c.slug}`,
    lastModified: c.updated_at,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/shop?filter=new`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${siteUrl}/shop?filter=bestseller`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    ...categoryUrls,
    ...productUrls,
  ]
}
