import { createClient } from '@/lib/supabase/server'
import CategoryManager from '@/components/admin/CategoryManager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Categories | Admin' }

export default async function AdminCategoriesPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('*').order('sort_order')

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-800 mb-6">Categories</h1>
      <CategoryManager initialCategories={categories || []} />
    </div>
  )
}
