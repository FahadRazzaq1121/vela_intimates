import Image from 'next/image'
import Link from 'next/link'
import { Category } from '@/types'

interface CategorySectionProps {
  categories: Category[]
}

export default function CategorySection({ categories }: CategorySectionProps) {
  if (!categories.length) return null

  return (
    <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-10">
        <p className="section-tag">Collections</p>
        <h2 className="section-title">Shop by Category</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/shop?category=${category.slug}`}
            className="group relative overflow-hidden aspect-[3/4] bg-cream-200"
          >
            {category.image_url ? (
              <Image
                src={category.image_url}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-luxury" />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

            {/* Label */}
            <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
              <p className="font-display text-sm font-medium text-cream-50 tracking-wide">
                {category.name}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
