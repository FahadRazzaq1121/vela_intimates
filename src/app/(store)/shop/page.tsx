import { getCachedShopData, getCachedCategories } from '@/lib/cache'
import ProductCard from '@/components/store/ProductCard'
import ShopFilters from '@/components/store/ShopFilters'
import { SlidersHorizontal } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop All',
  description:
    'Browse our complete collection of luxury lingerie, intimate wear, and sleepwear.',
}

interface ShopPageProps {
  searchParams: Promise<{
    category?: string
    search?: string
    sort?: string
    minPrice?: string
    maxPrice?: string
    filter?: string
    page?: string
    sizes?: string
  }>
}

const SORT_OPTIONS = [
  { value: 'default', label: 'Featured' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
]

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams
  const page = parseInt(params.page || '1', 10)

  const [{ products, total, totalPages }, categories] = await Promise.all([
    getCachedShopData(
      params.category || '',
      params.search || '',
      params.sort || 'default',
      params.filter || '',
      params.minPrice || '',
      params.maxPrice || '',
      params.sizes || '',
      page
    ),
    getCachedCategories(),
  ])

  const activeCategory = categories.find((c) => c.slug === params.category)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <p className="section-tag">
          {params.filter === 'new'
            ? 'New Arrivals'
            : params.filter === 'bestseller'
            ? 'Best Sellers'
            : params.filter === 'sale'
            ? 'On Sale'
            : activeCategory?.name || 'All Products'}
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <h1 className="section-title">
            {params.search
              ? `Results for "${params.search}"`
              : params.filter === 'new'
              ? 'New Arrivals'
              : params.filter === 'bestseller'
              ? 'Best Sellers'
              : params.filter === 'sale'
              ? 'Sale Collection'
              : activeCategory?.name || 'Shop All'}
          </h1>
          <p className="text-sm text-charcoal/50">{total} products</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-60 flex-shrink-0">
          <ShopFilters categories={categories} currentParams={params} />
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Sort Bar */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-cream-200">
            <div className="flex items-center gap-2 text-xs text-charcoal/50">
              <SlidersHorizontal size={14} />
              <span>Sort by:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {SORT_OPTIONS.map((opt) => (
                <a
                  key={opt.value}
                  href={`?${new URLSearchParams({ ...params, sort: opt.value, page: '1' }).toString()}`}
                  className={`text-xs px-3 py-1.5 border transition-all duration-200 ${
                    (params.sort || 'default') === opt.value
                      ? 'border-charcoal bg-charcoal text-cream-50'
                      : 'border-cream-300 text-charcoal hover:border-charcoal'
                  }`}
                >
                  {opt.label}
                </a>
              ))}
            </div>
          </div>

          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {products.map((product, i) => (
                  <ProductCard key={product.id} product={product} priority={i < 3} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  {page > 1 && (
                    <a
                      href={`?${new URLSearchParams({ ...params, page: String(page - 1) }).toString()}`}
                      className="px-4 py-2 border border-cream-300 text-sm text-charcoal hover:border-charcoal transition-colors"
                    >
                      ← Previous
                    </a>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                    .map((p, idx, arr) => (
                      <>
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span key={`ellipsis-${p}`} className="px-2 text-charcoal/40">…</span>
                        )}
                        <a
                          key={p}
                          href={`?${new URLSearchParams({ ...params, page: String(p) }).toString()}`}
                          className={`w-10 h-10 flex items-center justify-center border text-sm transition-colors ${
                            p === page
                              ? 'border-charcoal bg-charcoal text-cream-50'
                              : 'border-cream-300 text-charcoal hover:border-charcoal'
                          }`}
                        >
                          {p}
                        </a>
                      </>
                    ))}
                  {page < totalPages && (
                    <a
                      href={`?${new URLSearchParams({ ...params, page: String(page + 1) }).toString()}`}
                      className="px-4 py-2 border border-cream-300 text-sm text-charcoal hover:border-charcoal transition-colors"
                    >
                      Next →
                    </a>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="font-display text-2xl text-charcoal/30 mb-3">No products found</p>
              <p className="text-sm text-charcoal/40 mb-6">Try adjusting your filters</p>
              <a href="/shop" className="btn-secondary text-xs">
                Clear Filters
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
