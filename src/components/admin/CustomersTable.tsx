'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { formatPrice, formatDateShort } from '@/lib/utils'
import { useCurrency } from '@/contexts/CurrencyContext'
import Pagination from './Pagination'

interface Customer {
  id: string
  full_name: string
  email: string
  phone?: string
  total_orders: number
  total_spent: number
  created_at: string
}

export default function CustomersTable() {
  const currency = useCurrency()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin-customers', page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: '20', search })
      const res = await fetch(`/api/admin/customers?${params}`)
      if (!res.ok) throw new Error('Failed to fetch customers')
      return res.json() as Promise<{ data: Customer[]; count: number; page: number; pageSize: number }>
    },
    placeholderData: (prev) => prev,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const customers = data?.data || []
  const total = data?.count || 0
  const totalPages = Math.ceil(total / 20)

  return (
    <div className="space-y-5">
      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 text-sm outline-none focus:border-blush-400 bg-white rounded-lg"
          />
        </div>
        <button type="submit" className="px-4 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200 transition-colors">
          Search
        </button>
      </form>

      <div className="admin-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Customer', 'Phone', 'Orders', 'Total Spent', 'Joined', 'Action'].map((h) => (
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
                : customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800 text-xs">{customer.full_name}</p>
                        <p className="text-gray-400 text-xs">{customer.email}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{customer.phone || '—'}</td>
                      <td className="px-4 py-3 text-xs font-medium text-gray-700 text-center">
                        {customer.total_orders}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-gray-800">
                        {formatPrice(customer.total_spent, currency)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {formatDateShort(customer.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`/admin/orders?search=${encodeURIComponent(customer.email)}`}
                          className="text-xs text-blush-600 hover:text-blush-700 font-medium"
                        >
                          View Orders
                        </a>
                      </td>
                    </tr>
                  ))}
              {!isLoading && customers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">
                    No customers found
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
