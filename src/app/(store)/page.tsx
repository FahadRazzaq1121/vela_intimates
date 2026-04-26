import { getCachedHomeData } from '@/lib/cache'
import HeroSection from '@/components/store/HeroSection'
import CategorySection from '@/components/store/CategorySection'
import FeaturedProducts from '@/components/store/FeaturedProducts'
import TestimonialsSection from '@/components/store/TestimonialsSection'
import NewsletterSection from '@/components/store/NewsletterSection'
import InstagramSection from '@/components/store/InstagramSection'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vela Intimates — Luxury Lingerie & Intimates',
  description:
    'Discover our exquisite collection of luxury lingerie, intimate wear, and sleepwear. Crafted with the finest materials for the modern woman.',
}

export default async function HomePage() {
  const { featured, newArrivals, bestSellers, categories, heroSlides } =
    await getCachedHomeData()

  return (
    <>
      <HeroSection slides={heroSlides} />
      <CategorySection categories={categories} />
      <FeaturedProducts
        title="Featured Collection"
        subtitle="Handpicked favourites"
        products={featured}
        viewAllHref="/shop"
      />
      <div className="bg-gradient-luxury py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="section-tag">Our Promise</p>
          <h2 className="section-title max-w-2xl mx-auto mb-6">
            Crafted with love, worn with confidence
          </h2>
          <p className="text-base text-charcoal/60 max-w-xl mx-auto leading-relaxed">
            Every piece in our collection is thoughtfully designed to celebrate the feminine form.
            We source only the finest materials — European lace, mulberry silk, Supima cotton — so
            you always feel your most beautiful.
          </p>
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-12">
            {[
              { label: 'Premium Quality', desc: 'Finest European & Asian fabrics' },
              { label: 'Perfect Fit', desc: 'Inclusive sizing XS–3XL' },
              { label: 'Eco Conscious', desc: 'Sustainable practices' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="font-display text-lg font-medium text-charcoal mb-1">{item.label}</p>
                <p className="text-xs text-charcoal/50">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <FeaturedProducts
        title="New Arrivals"
        subtitle="Just arrived"
        products={newArrivals}
        viewAllHref="/shop?filter=new"
      />
      <FeaturedProducts
        title="Best Sellers"
        subtitle="Customer favourites"
        products={bestSellers}
        viewAllHref="/shop?filter=bestseller"
        dark
      />
      <TestimonialsSection />
      <InstagramSection />
      {/* <NewsletterSection /> */}
    </>
  )
}
