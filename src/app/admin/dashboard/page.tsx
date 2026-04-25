import DashboardStats from '@/components/admin/DashboardStats'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard | Admin' }

export default function DashboardPage() {
  return <DashboardStats />
}
