'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Order, OrderStatus } from '@/types'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

const STATUS_FLOW: OrderStatus[] = ['pending', 'confirmed', 'processing', 'packed', 'dispatched', 'delivered', 'cancelled']

export default function OrderStatusUpdater({ order }: { order: Order }) {
  const router = useRouter()
  const [status, setStatus] = useState<OrderStatus>(order.status)
  const [note, setNote] = useState('')
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '')
  const [loading, setLoading] = useState(false)

  const handleUpdate = async () => {
    if (status === order.status && !note && trackingNumber === order.tracking_number) return
    setLoading(true)
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note, tracking_number: trackingNumber || undefined }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update')
      }

      toast.success('Order status updated and email sent to customer', {
        style: { background: '#2C2C2C', color: '#FAF6F1' },
      })
      router.refresh()
      setNote('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-card">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Update Status</h2>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blush-400 bg-white"
          >
            {STATUS_FLOW.map((s) => (
              <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
            ))}
          </select>
          <div className="mt-2">
            <span className={`badge text-xs ${ORDER_STATUS_COLORS[status]}`}>
              {ORDER_STATUS_LABELS[status]}
            </span>
          </div>
        </div>

        {status === 'dispatched' && (
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">
              Tracking Number
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. 1Z999AA10123456784"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blush-400"
            />
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">
            Internal Note (Optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Add a note about this status change..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blush-400 resize-none"
          />
        </div>

        <Button onClick={handleUpdate} loading={loading} className="w-full" size="sm">
          Update & Notify Customer
        </Button>

        <p className="text-xs text-gray-400 text-center">
          An email will be sent to {order.shipping_email}
        </p>
      </div>
    </div>
  )
}
