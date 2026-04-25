import CustomersTable from '@/components/admin/CustomersTable'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Customers | Admin' }

export default function AdminCustomersPage() {
  return <CustomersTable />
}
