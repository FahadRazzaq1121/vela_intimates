'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { HeroSlide } from '@/types'

interface HeroSectionProps {
  slides: HeroSlide[]
}

export default function HeroSection({ slides }: HeroSectionProps) {
  const [current, setCurrent] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const total = slides.length

  useEffect(() => {
    if (total <= 1) return
    const timer = setInterval(() => goToNext(), 6000)
    return () => clearInterval(timer)
  })

  const goToSlide = (index: number) => {
    if (isAnimating || index === current) return
    setIsAnimating(true)
    setCurrent(index)
    setTimeout(() => setIsAnimating(false), 700)
  }

  const goToPrev = () => goToSlide(current === 0 ? total - 1 : current - 1)
  const goToNext = () => goToSlide(current === total - 1 ? 0 : current + 1)

  if (total === 0) return null

  const slide = slides[current]

  const textAlign = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  }[slide.align]

  const overlayGradient = {
    left: 'bg-gradient-to-r from-black/55 via-black/30 to-transparent',
    center: 'bg-black/40',
    right: 'bg-gradient-to-l from-black/55 via-black/30 to-transparent',
  }[slide.align]

  return (
    <section className="relative h-[85vh] min-h-[500px] max-h-[800px] overflow-hidden">
      {/* Background Images */}
      {slides.map((s, index) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ${index === current ? 'opacity-100' : 'opacity-0'}`}
        >
          <Image
            src={s.image_url}
            alt={s.title}
            fill
            className="object-cover object-center"
            priority={index <= 1}
            sizes="100vw"
          />
        </div>
      ))}

      {/* Overlay */}
      <div className={`absolute inset-0 ${overlayGradient}`} />

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 w-full">
          <div className={`flex flex-col ${textAlign} max-w-xl ${slide.align === 'right' ? 'ml-auto' : slide.align === 'center' ? 'mx-auto' : ''}`}>
            {slide.tag && (
              <div key={`tag-${current}`} className="inline-flex items-center gap-2 mb-4 animate-fade-in">
                <div className="w-8 h-px bg-cream-100/70" />
                <span className="text-xs font-medium uppercase tracking-ultra-wide text-cream-100/80">
                  {slide.tag}
                </span>
              </div>
            )}

            <h1
              key={`title-${current}`}
              className="font-display text-5xl sm:text-6xl md:text-7xl font-light text-cream-50 leading-tight mb-5 whitespace-pre-line animate-slide-up"
            >
              {slide.title}
            </h1>

            {slide.subtitle && (
              <p
                key={`sub-${current}`}
                className="text-sm sm:text-base text-cream-100/75 leading-relaxed mb-8 max-w-sm animate-fade-in"
                style={{ animationDelay: '0.2s' }}
              >
                {slide.subtitle}
              </p>
            )}

            <div
              key={`cta-${current}`}
              className={`flex flex-wrap gap-4 ${slide.align === 'center' ? 'justify-center' : slide.align === 'right' ? 'justify-end' : 'justify-start'} animate-slide-up`}
              style={{ animationDelay: '0.3s' }}
            >
              {slide.cta_text && slide.cta_href && (
                <Link href={slide.cta_href} className="btn-primary bg-cream-50 text-charcoal hover:bg-blush-500 hover:text-white border-none text-xs">
                  {slide.cta_text}
                </Link>
              )}
              {slide.cta_secondary_text && slide.cta_secondary_href && (
                <Link href={slide.cta_secondary_href} className="btn-secondary border-cream-100/60 text-cream-50 hover:bg-cream-50/10 text-xs">
                  {slide.cta_secondary_text}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {total > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-cream-50/10 border border-cream-100/20 text-cream-50 hover:bg-cream-50/20 transition-all duration-200 hidden md:flex"
            aria-label="Previous slide"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-cream-50/10 border border-cream-100/20 text-cream-50 hover:bg-cream-50/20 transition-all duration-200 hidden md:flex"
            aria-label="Next slide"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Dots */}
      {total > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 ${index === current ? 'w-8 h-1 bg-cream-50' : 'w-2 h-1 bg-cream-50/40'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
