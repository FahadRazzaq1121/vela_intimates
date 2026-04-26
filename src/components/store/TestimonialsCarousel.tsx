'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import type { Testimonial } from '@/lib/cache'

export default function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent(current === 0 ? testimonials.length - 1 : current - 1)
  const next = () => setCurrent(current === testimonials.length - 1 ? 0 : current + 1)

  const t = testimonials[current]

  return (
    <section className="py-20 md:py-28 bg-blush-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="section-tag">Reviews</p>
          <h2 className="section-title">What Our Customers Say</h2>
        </div>

        <div className="relative">
          <div className="text-center px-8 md:px-16">
            {/* Customer photo */}
            {t.customer_image_url && (
              <div className="flex justify-center mb-5">
                <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-blush-200">
                  <Image src={t.customer_image_url} alt={t.customer_name} fill className="object-cover" sizes="64px" />
                </div>
              </div>
            )}

            {/* Stars */}
            <div className="flex justify-center gap-1 mb-6">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={16} className={s <= t.rating ? 'fill-gold text-gold' : 'fill-cream-300 text-cream-300'} />
              ))}
            </div>

            {/* Quote */}
            <div className="relative">
              <Quote size={40} className="text-blush-200 absolute -top-4 -left-2 md:-left-8" />
              <p className="font-display text-xl md:text-2xl font-light text-charcoal leading-relaxed italic mb-8">
                &ldquo;{t.quote}&rdquo;
              </p>
            </div>

            {/* Author */}
            <div>
              <p className="font-medium text-charcoal text-sm">{t.customer_name}</p>
              {t.location && <p className="text-xs text-charcoal/50 mt-0.5">{t.location}</p>}
              {t.product_name && <p className="text-xs text-blush-500 mt-1 uppercase tracking-wider">{t.product_name}</p>}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-6 mt-10">
            <button onClick={prev} className="w-10 h-10 border border-cream-300 text-charcoal hover:border-blush-400 hover:text-blush-600 flex items-center justify-center transition-all">
              <ChevronLeft size={16} />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`transition-all duration-300 rounded-full ${i === current ? 'w-6 h-2 bg-blush-500' : 'w-2 h-2 bg-cream-300'}`}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button onClick={next} className="w-10 h-10 border border-cream-300 text-charcoal hover:border-blush-400 hover:text-blush-600 flex items-center justify-center transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-6 mt-16 pt-12 border-t border-cream-200">
          {[
            { number: '10,000+', label: 'Happy Customers' },
            { number: '4.9★', label: 'Average Rating' },
            { number: '50+', label: 'Premium Products' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-2xl md:text-3xl font-medium text-charcoal">{stat.number}</p>
              <p className="text-xs text-charcoal/50 mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
