import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatPrice, formatDate, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import OrderStatusUpdater from '@/components/admin/OrderStatusUpdater'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  return { title: `Order ${id.slice(0, 8)} | Admin` }
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*, items:order_items(*), status_history:order_status_history(*)')
    .eq('id', id)
    .single()

  if (!order) notFound()

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back */}
      <div className="flex items-center gap-4">
        <Link href="/admin/orders" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft size={16} />
          Back to Orders
        </Link>
        <span className="text-gray-300">|</span>
        <h1 className="text-base font-semibold text-gray-800">{order.order_number}</h1>
        <span className={`badge ${ORDER_STATUS_COLORS[order.status]}`}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <div className="admin-card">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items?.map((item: {
                id: string
                product_name: string
                product_image: string | null
                size: string | null
                color: string | null
                quantity: number
                unit_price: number
                total_price: number
                product_sku: string | null
              }) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  {item.product_image && (
                    <div className="relative w-16 h-20 flex-shrink-0 bg-gray-100 overflow-hidden rounded">
                      <Image src={item.product_image} alt={item.product_name} fill className="object-cover" sizes="64px" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-800">{item.product_name}</p>
                    {item.product_sku && <p className="text-xs text-gray-400">SKU: {item.product_sku}</p>}
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span>Color: {item.color}</span>}
                      <span>Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm text-gray-800">{formatPrice(item.total_price)}</p>
                    <p className="text-xs text-gray-400">{formatPrice(item.unit_price)} each</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount {order.coupon_code && `(${order.coupon_code})`}</span>
                  <span>-{formatPrice(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-500">
                <span>Shipping</span>
                <span>{order.shipping_fee === 0 ? 'Free' : formatPrice(order.shipping_fee)}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-800 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Status History */}
          <div className="admin-card">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Status History</h2>
            <div className="space-y-3">
              {(order.status_history || [])
                .sort((a: { created_at: string }, b: { created_at: string }) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((hist: { id: string; status: string; note: string | null; created_by: string | null; created_at: string }) => (
                  <div key={hist.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blush-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`badge text-xs ${ORDER_STATUS_COLORS[hist.status] || 'bg-gray-100 text-gray-600'}`}>
                          {ORDER_STATUS_LABELS[hist.status] || hist.status}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(hist.created_at)}</span>
                        {hist.created_by && <span className="text-xs text-gray-400">by {hist.created_by}</span>}
                      </div>
                      {hist.note && <p className="text-xs text-gray-500 mt-0.5">{hist.note}</p>}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Update Status */}
          <OrderStatusUpdater order={order} />

          {/* Customer */}
          <div className="admin-card">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Customer</h2>
            <p className="font-medium text-sm text-gray-800">{order.shipping_full_name}</p>
            <p className="text-sm text-gray-500">{order.shipping_email}</p>
            {order.shipping_phone && <p className="text-sm text-gray-500">{order.shipping_phone}</p>}
          </div>

          {/* Shipping Address */}
          <div className="admin-card">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Shipping Address</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {order.shipping_address}<br />
              {order.shipping_city}{order.shipping_postal_code ? `, ${order.shipping_postal_code}` : ''}<br />
              {order.shipping_country}
            </p>
          </div>

          {/* Order Info */}
          <div className="admin-card">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Order Info</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Payment</span>
                <span className="text-gray-700 capitalize">{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Manual'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Status</span>
                <span className="text-gray-700 capitalize">{order.payment_status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Placed</span>
                <span className="text-gray-700">{formatDate(order.created_at)}</span>
              </div>
              {order.tracking_number && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Tracking</span>
                  <span className="text-gray-700 font-mono text-xs">{order.tracking_number}</span>
                </div>
              )}
            </div>
            {order.notes && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Customer Notes:</p>
                <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
