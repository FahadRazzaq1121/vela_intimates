import ProductsTable from '@/components/admin/ProductsTable'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Products | Admin' }

export default function AdminProductsPage() {
  return <ProductsTable />
}
