'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, Edit, Search, Trash2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCurrency } from '@/contexts/CurrencyContext'
import Pagination from './Pagination'
import toast from 'react-hot-toast'

export default function ProductsTable() {
  const currency = useCurrency()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), search, pageSize: '20' })
      const res = await fetch(`/api/admin/products?${params}`)
      if (!res.ok) throw new Error('Failed to fetch products')
      return res.json() as Promise<{ data: Product[]; count: number; page: number; pageSize: number }>
    },
    placeholderData: (prev) => prev,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      toast.success('Product deleted')
    },
    onError: () => toast.error('Failed to delete product'),
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const products = data?.data || []
  const total = data?.count || 0
  const totalPages = Math.ceil(total / 20)

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <form onSubmit={handleSearch} className="flex-1 max-w-md flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 text-sm outline-none focus:border-blush-400 bg-white rounded-lg"
            />
          </div>
          <button type="submit" className="px-4 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200 transition-colors">
            Search
          </button>
        </form>
        <Link
          href="/admin/products/new"
          className="btn-rose text-xs px-5 py-2.5 flex items-center gap-2 whitespace-nowrap self-start"
        >
          <Plus size={14} />
          Add Product
        </Link>
      </div>

      <div className="admin-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : products.map((product) => {
                    const primaryImage = (product.images as { is_primary?: boolean; url: string }[])
                      ?.find((i) => i.is_primary)?.url ||
                      (product.images as { url: string }[])?.[0]?.url

                    return (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {primaryImage ? (
                              <div className="relative w-10 h-12 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                <Image src={primaryImage} alt={product.name} fill className="object-cover" sizes="40px" />
                              </div>
                            ) : (
                              <div className="w-10 h-12 bg-gray-100 rounded flex-shrink-0" />
                            )}
                            <div>
                              <p className="font-medium text-gray-800 text-xs">{product.name}</p>
                              <p className="text-gray-400 text-xs">{product.sku || 'No SKU'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {(product.category as { name?: string } | null)?.name || '—'}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <span className="font-medium text-gray-800">
                            {formatPrice(product.sale_price || product.price, currency)}
                          </span>
                          {product.sale_price && (
                            <span className="text-gray-400 line-through ml-1">
                              {formatPrice(product.price, currency)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium ${
                            product.stock_quantity === 0 ? 'text-red-500'
                              : product.stock_quantity <= 5 ? 'text-amber-500'
                              : 'text-green-600'
                          }`}>
                            {product.stock_quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge text-xs ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="p-1.5 text-gray-400 hover:text-blush-600 transition-colors rounded hover:bg-blush-50"
                            >
                              <Edit size={14} />
                            </Link>
                            <button
                              onClick={() => {
                                if (confirm(`Delete "${product.name}"?`)) {
                                  deleteMutation.mutate(product.id)
                                }
                              }}
                              disabled={deleteMutation.isPending}
                              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded hover:bg-red-50 disabled:opacity-40"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
              {!isLoading && products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">
                    No products found.{' '}
                    <Link href="/admin/products/new" className="text-blush-600 hover:underline">
                      Add your first product
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={20}
          onPageChange={setPage}
          isFetching={isFetching}
        />
      </div>
    </div>
  )
}

// Minimal type for table rows
interface Product {
  id: string
  name: string
  sku?: string
  price: number
  sale_price?: number | null
  stock_quantity: number
  is_active: boolean
  category?: unknown
  images?: unknown[]
}
