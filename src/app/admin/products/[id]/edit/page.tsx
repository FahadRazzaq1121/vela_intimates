import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/admin/ProductForm'
import { Category, Product } from '@/types'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = { title: 'Edit Product | Admin' }

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*, images:product_images(*)').eq('id', id).single(),
    supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
  ])

  if (!product) notFound()

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-800 mb-6">Edit: {product.name}</h1>
      <ProductForm product={product as Product} categories={(categories || []) as Category[]} mode="edit" />
    </div>
  )
}
