import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/admin/ProductForm'
import { Category } from '@/types'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Add Product | Admin' }

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('*').eq('is_active', true).order('sort_order')

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-800 mb-6">Add New Product</h1>
      <ProductForm categories={(categories || []) as Category[]} mode="create" />
    </div>
  )
}
