import TestimonialsManager from '@/components/admin/TestimonialsManager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Testimonials | Admin' }

export default function AdminTestimonialsPage() {
  return <TestimonialsManager />
}
