'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Star, Check, X, Trash2 } from 'lucide-react'
import { formatDateShort } from '@/lib/utils'
import Pagination from './Pagination'
import toast from 'react-hot-toast'

interface Review {
  id: string
  customer_name: string
  customer_email: string
  rating: number
  title: string | null
  body: string | null
  is_approved: boolean
  is_verified: boolean
  created_at: string
  product: { name: string; slug: string } | null
}

export default function ReviewsTable() {
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const queryClient = useQueryClient()

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin-reviews', page, filter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), filter })
      const res = await fetch(`/api/admin/reviews?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json() as Promise<{ data: Review[]; count: number; page: number; pageSize: number }>
    },
    placeholderData: (prev) => prev,
  })

  const approveMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_approved: approved }),
      })
      if (!res.ok) throw new Error('Failed')
    },
    onSuccess: (_, { approved }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      toast.success(approved ? 'Review approved' : 'Review rejected')
    },
    onError: () => toast.error('Action failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      toast.success('Review deleted')
    },
    onError: () => toast.error('Failed to delete'),
  })

  const reviews = data?.data || []
  const total = data?.count || 0
  const totalPages = Math.ceil(total / 20)

  const pendingCount = filter === 'all' ? reviews.filter((r) => !r.is_approved).length : null

  return (
    <div className="space-y-5">
      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'pending', 'approved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1) }}
            className={`px-4 py-1.5 text-xs rounded-full border transition-colors capitalize ${filter === f ? 'bg-charcoal text-white border-charcoal' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
          >
            {f}
            {f === 'pending' && pendingCount !== null && pendingCount > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-2xs px-1.5 py-0.5 rounded-full">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="admin-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Customer', 'Product', 'Rating', 'Review', 'Date', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}</tr>
                  ))
                : reviews.map((review) => (
                    <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800 text-xs">{review.customer_name}</p>
                        <p className="text-gray-400 text-xs">{review.customer_email}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 max-w-[120px]">
                        <p className="truncate">{review.product?.name || '—'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} size={10} className={s <= review.rating ? 'fill-gold text-gold' : 'fill-gray-200 text-gray-200'} />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        {review.title && <p className="text-xs font-medium text-gray-700 truncate">{review.title}</p>}
                        {review.body && <p className="text-xs text-gray-500 truncate">{review.body}</p>}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {formatDateShort(review.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge text-xs ${review.is_approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {review.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {!review.is_approved ? (
                            <button
                              onClick={() => approveMutation.mutate({ id: review.id, approved: true })}
                              disabled={approveMutation.isPending}
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Approve"
                            >
                              <Check size={14} />
                            </button>
                          ) : (
                            <button
                              onClick={() => approveMutation.mutate({ id: review.id, approved: false })}
                              disabled={approveMutation.isPending}
                              className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                              title="Reject"
                            >
                              <X size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => confirm('Delete this review?') && deleteMutation.mutate(review.id)}
                            disabled={deleteMutation.isPending}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              {!isLoading && reviews.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">No reviews found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} total={total} pageSize={20} onPageChange={setPage} isFetching={isFetching} />
      </div>
    </div>
  )
}
