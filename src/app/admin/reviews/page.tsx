import ReviewsTable from '@/components/admin/ReviewsTable'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Reviews | Admin' }

export default function AdminReviewsPage() {
  return <ReviewsTable />
}
