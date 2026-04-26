import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CheckCircle, Package, Mail, ArrowRight } from 'lucide-react'
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from '@/lib/utils'
import { getCachedSiteSettings } from '@/lib/cache'
import Image from 'next/image'

interface Props {
  searchParams: Promise<{ order?: string; email?: string }>
}

async function OrderDetails({ orderNumber, email }: { orderNumber: string; email: string }) {
  const supabase = await createClient()
  const [{ data: order }, settings] = await Promise.all([
    supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('order_number', orderNumber)
      .eq('shipping_email', email)
      .single(),
    getCachedSiteSettings(),
  ])
  const currency = settings.store_currency || 'USD'

  if (!order) {
    return (
      <div className="text-center py-8">
        <p className="text-charcoal/50">Order details not found.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Order Summary Card */}
      <div className="bg-cream-50 border border-cream-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-cream-200">
          <div>
            <p className="text-xs uppercase tracking-widest text-charcoal/40 mb-1">Order Number</p>
            <p className="font-display text-lg text-charcoal">{order.order_number}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-charcoal/40 mb-1">Date</p>
            <p className="text-sm text-charcoal">{formatDate(order.created_at)}</p>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-4 mb-6">
          {order.items?.map((item: {
            id: string
            product_name: string
            product_image: string | null
            size: string | null
            color: string | null
            quantity: number
            unit_price: number
            total_price: number
          }) => (
            <div key={item.id} className="flex gap-4">
              {item.product_image && (
                <div className="relative w-16 h-20 flex-shrink-0 bg-cream-100 overflow-hidden">
                  <Image src={item.product_image} alt={item.product_name} fill className="object-cover" sizes="64px" />
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-charcoal">{item.product_name}</p>
                <div className="flex items-center gap-2 text-xs text-charcoal/50 mt-0.5">
                  {item.size && <span>Size: {item.size}</span>}
                  {item.color && <span>· {item.color}</span>}
                  <span>· Qty: {item.quantity}</span>
                </div>
                <p className="text-sm text-charcoal mt-1">{formatPrice(item.total_price, currency)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t border-cream-200 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-charcoal/60">Subtotal</span>
            <span>{formatPrice(order.subtotal, currency)}</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span>-{formatPrice(order.discount_amount, currency)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-charcoal/60">Shipping</span>
            <span>{order.shipping_fee === 0 ? 'Free' : formatPrice(order.shipping_fee, currency)}</span>
          </div>
          <div className="flex justify-between font-medium pt-2 border-t border-cream-200">
            <span>Total Paid</span>
            <span className="font-display text-lg">{formatPrice(order.total, currency)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-cream-50 border border-cream-200 p-6">
        <h3 className="text-xs uppercase tracking-widest text-charcoal/40 mb-3">Shipping To</h3>
        <p className="text-sm font-medium text-charcoal">{order.shipping_full_name}</p>
        <p className="text-sm text-charcoal/60">{order.shipping_address}</p>
        <p className="text-sm text-charcoal/60">{order.shipping_city}, {order.shipping_postal_code}</p>
        <p className="text-sm text-charcoal/60">{order.shipping_country}</p>
      </div>
    </div>
  )
}

export default async function OrderConfirmedPage({ searchParams }: Props) {
  const params = await searchParams
  const orderNumber = params.order
  const email = params.email

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16 text-center">
      {/* Success icon */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-green-50 flex items-center justify-center">
          <CheckCircle size={40} className="text-green-500" />
        </div>
      </div>

      <p className="section-tag mb-2">Order Placed</p>
      <h1 className="font-display text-3xl md:text-4xl font-light text-charcoal mb-4">
        Thank You!
      </h1>
      <p className="text-charcoal/60 text-sm mb-2">
        Your order <span className="font-medium text-charcoal">{orderNumber}</span> has been placed successfully.
      </p>
      {email && (
        <div className="flex items-center justify-center gap-2 text-sm text-charcoal/50 mb-8">
          <Mail size={14} />
          <span>A confirmation email has been sent to <strong className="text-charcoal">{decodeURIComponent(email)}</strong></span>
        </div>
      )}

      {/* What Happens Next */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left">
        {[
          { icon: <CheckCircle size={20} className="text-blush-500" />, step: '1', title: 'Order Confirmed', desc: 'We\'ve received your order and are reviewing it.' },
          { icon: <Package size={20} className="text-blush-500" />, step: '2', title: 'Being Prepared', desc: 'Your items will be carefully packed and prepared for shipping.' },
          { icon: <Mail size={20} className="text-blush-500" />, step: '3', title: 'Shipped', desc: 'You\'ll receive an email with tracking information.' },
        ].map((item) => (
          <div key={item.step} className="bg-cream-50 p-4 border border-cream-200">
            <div className="mb-2">{item.icon}</div>
            <p className="text-xs uppercase tracking-widest text-charcoal/40 mb-1">Step {item.step}</p>
            <p className="text-sm font-medium text-charcoal mb-1">{item.title}</p>
            <p className="text-xs text-charcoal/50 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Order Details */}
      {orderNumber && email && (
        <div className="mb-10 text-left">
          <h2 className="font-display text-xl text-charcoal mb-6 text-center">Order Details</h2>
          <Suspense fallback={<div className="text-center py-8 text-charcoal/40 text-sm">Loading order details...</div>}>
            <OrderDetails orderNumber={orderNumber} email={decodeURIComponent(email)} />
          </Suspense>
        </div>
      )}

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href="/shop" className="btn-primary flex items-center gap-2">
          Continue Shopping
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
