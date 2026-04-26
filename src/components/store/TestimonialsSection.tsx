import { getCachedTestimonials } from '@/lib/cache'
import TestimonialsCarousel from './TestimonialsCarousel'

export default async function TestimonialsSection() {
  const testimonials = await getCachedTestimonials()
  if (testimonials.length === 0) return null
  return <TestimonialsCarousel testimonials={testimonials} />
}
