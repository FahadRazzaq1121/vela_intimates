'use client'

import { useState } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Sophie M.',
    location: 'New York, USA',
    rating: 5,
    text: 'Vela Intimates has completely transformed my lingerie drawer. The quality is extraordinary — the silk feels like a dream and the lace is so delicate yet surprisingly durable. I\'ve received so many compliments. Worth every single penny.',
    product: 'Silk & Lace Matching Set',
  },
  {
    id: 2,
    name: 'Emma L.',
    location: 'London, UK',
    rating: 5,
    text: 'I was looking for a special anniversary gift for myself and found Vela Intimates. The packaging alone made me feel pampered — like opening a gift from a luxury boutique. The bra fits perfectly and the lace is absolutely gorgeous.',
    product: 'Rose Petal Lace Bra',
  },
  {
    id: 3,
    name: 'Isabelle D.',
    location: 'Paris, France',
    rating: 5,
    text: 'As a Parisian woman with high standards for lingerie, I am thoroughly impressed. The craftsmanship rivals the finest French labels but at a fraction of the price. The silk chemise is my new favourite piece.',
    product: 'Midnight Silk Chemise',
  },
  {
    id: 4,
    name: 'Mia R.',
    location: 'Sydney, Australia',
    rating: 5,
    text: 'Finding lingerie that is both beautiful and comfortable has always been a struggle. Vela Intimates solved that problem beautifully. The cashmere lounge set is my weekend uniform now — so soft and elegant.',
    product: 'Cashmere Lounge Set',
  },
]

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent(current === 0 ? TESTIMONIALS.length - 1 : current - 1)
  const next = () => setCurrent(current === TESTIMONIALS.length - 1 ? 0 : current + 1)

  const t = TESTIMONIALS[current]

  return (
    <section className="py-20 md:py-28 bg-blush-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="section-tag">Reviews</p>
          <h2 className="section-title">What Our Customers Say</h2>
        </div>

        <div className="relative">
          <div className="text-center px-8 md:px-16">
            {/* Stars */}
            <div className="flex justify-center gap-1 mb-6">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} size={16} className="fill-gold text-gold" />
              ))}
            </div>

            {/* Quote */}
            <div className="relative">
              <Quote size={40} className="text-blush-200 absolute -top-4 -left-2 md:-left-8" />
              <p className="font-display text-xl md:text-2xl font-light text-charcoal leading-relaxed italic mb-8">
                &ldquo;{t.text}&rdquo;
              </p>
            </div>

            {/* Author */}
            <div>
              <p className="font-medium text-charcoal text-sm">{t.name}</p>
              <p className="text-xs text-charcoal/50 mt-0.5">{t.location}</p>
              <p className="text-xs text-blush-500 mt-1 uppercase tracking-wider">{t.product}</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-6 mt-10">
            <button onClick={prev} className="w-10 h-10 border border-cream-300 text-charcoal hover:border-blush-400 hover:text-blush-600 flex items-center justify-center transition-all">
              <ChevronLeft size={16} />
            </button>

            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
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
