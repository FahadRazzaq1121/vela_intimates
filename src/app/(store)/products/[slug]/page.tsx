import { getCachedProduct, getCachedRelatedProducts } from '@/lib/cache'
import { notFound } from 'next/navigation'
import ProductDetailClient from '@/components/store/ProductDetailClient'
import FeaturedProducts from '@/components/store/FeaturedProducts'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getCachedProduct(slug)
  if (!product) return { title: 'Product Not Found' }

  return {
    title: product.meta_title || product.name,
    description:
      product.meta_description ||
      product.short_description ||
      product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.short_description || '',
      images: product.images?.find((i) => i.is_primary)?.url
        ? [product.images.find((i) => i.is_primary)!.url]
        : [],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getCachedProduct(slug)
  if (!product) notFound()

  const related = product.category_id
    ? await getCachedRelatedProducts(product.category_id, product.id)
    : []

  return (
    <div>
      <ProductDetailClient product={product} />
      {related.length > 0 && (
        <div className="border-t border-cream-200">
          <FeaturedProducts
            title="You May Also Like"
            subtitle="Similar pieces"
            products={related}
            viewAllHref={`/shop?category=${product.category?.slug}`}
          />
        </div>
      )}
    </div>
  )
}
