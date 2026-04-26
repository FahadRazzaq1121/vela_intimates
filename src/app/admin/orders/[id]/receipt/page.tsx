import { createClient } from '@/lib/supabase/server'
import { createClient as serviceClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import PrintButton from '@/components/admin/PrintButton'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Order Receipt' }

interface Props {
  params: Promise<{ id: string }>
}

async function getSettings() {
  const db = serviceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data } = await db.from('settings').select('key, value')
  const s: Record<string, string> = {}
  for (const row of data || []) s[row.key] = row.value || ''
  return s
}

export default async function OrderReceiptPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: order }, settings] = await Promise.all([
    supabase.from('orders').select('*, items:order_items(*)').eq('id', id).single(),
    getSettings(),
  ])

  if (!order) notFound()

  const brandName = settings.brand_name || 'Vela Intimates'
  const contactEmail = settings.contact_email || ''
  const whatsapp = settings.footer_whatsapp || settings.whatsapp_number || ''

  const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <html>
      <head>
        <title>Receipt — {order.order_number}</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #1a1a1a; background: #fff; padding: 40px; max-width: 680px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 2px solid #1a1a1a; margin-bottom: 28px; }
          .brand { font-size: 20px; font-weight: 300; letter-spacing: 0.15em; text-transform: uppercase; }
          .receipt-label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.1em; }
          .order-number { font-size: 16px; font-weight: 600; margin-top: 4px; }
          .order-date { font-size: 12px; color: #666; margin-top: 2px; }
          .section { margin-bottom: 24px; }
          .section-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #eee; }
          .info-row { display: flex; gap: 8px; margin-bottom: 3px; font-size: 13px; }
          .info-label { color: #888; min-width: 100px; }
          table { width: 100%; border-collapse: collapse; }
          th { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #888; text-align: left; padding: 8px 0; border-bottom: 1px solid #eee; }
          th:last-child, td:last-child { text-align: right; }
          td { padding: 10px 0; border-bottom: 1px solid #f5f5f5; font-size: 13px; vertical-align: top; }
          .item-name { font-weight: 500; }
          .item-meta { font-size: 11px; color: #888; margin-top: 2px; }
          .totals { margin-top: 16px; }
          .total-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; color: #555; }
          .total-row.discount { color: #16a34a; }
          .total-row.grand { font-size: 15px; font-weight: 700; color: #1a1a1a; padding-top: 10px; margin-top: 6px; border-top: 2px solid #1a1a1a; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
          .footer-brand { font-size: 12px; color: #888; }
          .thank-you { font-size: 14px; font-weight: 500; color: #1a1a1a; }
          .print-bar { position: fixed; top: 0; left: 0; right: 0; background: #1a1a1a; color: #fff; padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 100; }
          .print-bar button { background: #e07a90; color: #fff; border: none; padding: 7px 18px; font-size: 13px; cursor: pointer; border-radius: 4px; }
          .print-bar a { color: #aaa; font-size: 12px; text-decoration: none; }
          @media print {
            .print-bar { display: none; }
            body { padding: 20px; }
          }
        `}</style>
      </head>
      <body>
        {/* Print bar — hidden on print */}
        <div className="print-bar">
          <a href={`/admin/orders/${id}`}>← Back to Order</a>
          <PrintButton />
        </div>

        <div style={{ marginTop: '52px' }}>
          {/* Header */}
          <div className="header">
            <div>
              <div className="brand">{brandName}</div>
              {contactEmail && <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>{contactEmail}</div>}
              {whatsapp && <div style={{ fontSize: '12px', color: '#888' }}>{whatsapp}</div>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="receipt-label">Receipt</div>
              <div className="order-number">{order.order_number}</div>
              <div className="order-date">{orderDate}</div>
            </div>
          </div>

          {/* Customer & Shipping */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '28px' }}>
            <div className="section">
              <div className="section-title">Bill To</div>
              <div style={{ fontWeight: 500 }}>{order.shipping_full_name}</div>
              <div style={{ color: '#555', marginTop: '2px' }}>{order.shipping_email}</div>
              {order.shipping_phone && <div style={{ color: '#555' }}>{order.shipping_phone}</div>}
            </div>
            <div className="section">
              <div className="section-title">Ship To</div>
              <div>{order.shipping_address}</div>
              <div>{order.shipping_city}{order.shipping_postal_code ? `, ${order.shipping_postal_code}` : ''}</div>
              <div>{order.shipping_country}</div>
            </div>
          </div>

          {/* Order Info */}
          <div className="section">
            <div className="section-title">Order Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <div className="info-row"><span className="info-label">Order #</span><span>{order.order_number}</span></div>
              <div className="info-row"><span className="info-label">Date</span><span>{orderDate}</span></div>
              <div className="info-row"><span className="info-label">Payment</span><span>{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Manual'}</span></div>
              <div className="info-row"><span className="info-label">Status</span><span style={{ textTransform: 'capitalize' }}>{order.status}</span></div>
              <div className="info-row"><span className="info-label">Pay Status</span><span style={{ textTransform: 'capitalize' }}>{order.payment_status}</span></div>
              {order.coupon_code && <div className="info-row"><span className="info-label">Coupon</span><span>{order.coupon_code}</span></div>}
            </div>
          </div>

          {/* Items */}
          <div className="section">
            <div className="section-title">Items Ordered</div>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Size / Color</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((item: {
                  id: string
                  product_name: string
                  product_sku: string | null
                  size: string | null
                  color: string | null
                  quantity: number
                  unit_price: number
                  total_price: number
                }) => (
                  <tr key={item.id}>
                    <td><div className="item-name">{item.product_name}</div></td>
                    <td><div className="item-meta">{item.product_sku || '—'}</div></td>
                    <td><div className="item-meta">{[item.size, item.color].filter(Boolean).join(' / ') || '—'}</div></td>
                    <td>{item.quantity}</td>
                    <td>{formatPrice(item.unit_price)}</td>
                    <td>{formatPrice(item.total_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="totals" style={{ maxWidth: '280px', marginLeft: 'auto' }}>
              <div className="total-row"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              {order.discount_amount > 0 && (
                <div className="total-row discount">
                  <span>Discount{order.coupon_code ? ` (${order.coupon_code})` : ''}</span>
                  <span>−{formatPrice(order.discount_amount)}</span>
                </div>
              )}
              <div className="total-row">
                <span>Shipping</span>
                <span>{order.shipping_fee === 0 ? 'Free' : formatPrice(order.shipping_fee)}</span>
              </div>
              <div className="total-row grand"><span>Total</span><span>{formatPrice(order.total)}</span></div>
            </div>
          </div>

          {order.notes && (
            <div className="section">
              <div className="section-title">Customer Notes</div>
              <div style={{ background: '#f9f9f9', padding: '10px 14px', borderRadius: '4px', color: '#555' }}>{order.notes}</div>
            </div>
          )}

          {/* Footer */}
          <div className="footer">
            <div className="footer-brand">
              <div>{brandName}</div>
              {contactEmail && <div>{contactEmail}</div>}
            </div>
            <div className="thank-you">Thank you for your order!</div>
          </div>
        </div>
      </body>
    </html>
  )
}
