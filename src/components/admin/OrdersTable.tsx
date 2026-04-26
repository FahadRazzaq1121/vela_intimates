'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Search, Eye } from 'lucide-react'
import { formatPrice, formatDateShort, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@/lib/utils'
import { useCurrency } from '@/contexts/CurrencyContext'
import Pagination from './Pagination'

const ALL_STATUSES = [
  'pending', 'confirmed', 'processing', 'packed', 'dispatched', 'delivered', 'cancelled',
]

interface Order {
  id: string
  order_number: string
  shipping_full_name: string
  shipping_email: string
  created_at: string
  total: number
  payment_method: string
  status: string
  items?: unknown[]
}

export default function OrdersTable() {
  const currency = useCurrency()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin-orders', page, status, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: '20', status, search })
      const res = await fetch(`/api/admin/orders?${params}`)
      if (!res.ok) throw new Error('Failed to fetch orders')
      return res.json() as Promise<{ data: Order[]; count: number; page: number; pageSize: number }>
    },
    placeholderData: (prev) => prev,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleStatusChange = (s: string) => {
    setStatus(s)
    setPage(1)
  }

  const orders = data?.data || []
  const total = data?.count || 0
  const totalPages = Math.ceil(total / 20)

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 max-w-md flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search order, email, name…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 text-sm outline-none focus:border-blush-400 bg-white rounded-lg"
            />
          </div>
          <button type="submit" className="px-4 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200 transition-colors">
            Search
          </button>
        </form>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleStatusChange('')}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${!status ? 'bg-charcoal text-white border-charcoal' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
          >
            All
          </button>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${status === s ? 'bg-charcoal text-white border-charcoal' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
            >
              {ORDER_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Order #', 'Customer', 'Date', 'Items', 'Total', 'Payment', 'Status', 'Action'].map((h) => (
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
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-medium text-gray-800">
                          {order.order_number}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-700 text-xs">{order.shipping_full_name}</p>
                        <p className="text-gray-400 text-xs">{order.shipping_email}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {formatDateShort(order.created_at)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 text-center">
                        {(order.items as unknown[])?.length || 0}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800 text-xs whitespace-nowrap">
                        {formatPrice(order.total, currency)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 capitalize">
                        {order.payment_method === 'cod' ? 'COD' : 'Manual'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge text-xs ${ORDER_STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                          {ORDER_STATUS_LABELS[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1 text-xs text-blush-600 hover:text-blush-700 font-medium"
                        >
                          <Eye size={12} />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
              {!isLoading && orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">
                    No orders found
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
