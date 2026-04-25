import OrdersTable from '@/components/admin/OrdersTable'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Orders | Admin' }

export default function AdminOrdersPage() {
  return <OrdersTable />
}
