import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Product } from '@/types'
import ProductCard from './ProductCard'
import { cn } from '@/lib/utils'

interface FeaturedProductsProps {
  title: string
  subtitle?: string
  products: Product[]
  viewAllHref: string
  dark?: boolean
}

export default function FeaturedProducts({ title, subtitle, products, viewAllHref, dark = false }: FeaturedProductsProps) {
  if (!products.length) return null

  return (
    <section className={cn('py-16 md:py-24', dark && 'bg-charcoal')}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            {subtitle && (
              <p className={cn('section-tag', dark && 'text-blush-400')}>{subtitle}</p>
            )}
            <h2 className={cn('section-title', dark && 'text-cream-100')}>{title}</h2>
          </div>
          <Link
            href={viewAllHref}
            className={cn(
              'hidden md:flex items-center gap-2 text-xs font-medium uppercase tracking-widest transition-colors duration-200',
              dark ? 'text-cream-200/60 hover:text-cream-100' : 'text-charcoal/60 hover:text-blush-600'
            )}
          >
            View All
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 2} />
          ))}
        </div>

        <div className="md:hidden mt-8 text-center">
          <Link href={viewAllHref} className={cn('btn-secondary text-xs', dark && 'border-cream-200/30 text-cream-100 hover:bg-cream-100/10')}>
            View All
          </Link>
        </div>
      </div>
    </section>
  )
}
