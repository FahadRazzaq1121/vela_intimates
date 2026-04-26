import InstagramManager from '@/components/admin/InstagramManager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Instagram Feed | Admin' }

export default function AdminInstagramPage() {
  return <InstagramManager />
}
