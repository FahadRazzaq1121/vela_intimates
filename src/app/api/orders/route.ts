import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email/send'
import { orderConfirmationEmail, adminNewOrderEmail } from '@/lib/email/templates'
import { Order } from '@/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generateOrderNumber(): string {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `VI-${dateStr}-${random}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      full_name, email, phone, address, city, country, postal_code,
      notes, payment_method, coupon_code,
      items, subtotal, discount_amount, shipping_fee, total,
    } = body

    if (!full_name || !email || !address || !city || !country || !items?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Upsert customer
    const { data: customer } = await supabase
      .from('customers')
      .upsert({ email, full_name, phone }, { onConflict: 'email' })
      .select()
      .single()

    const orderNumber = generateOrderNumber()

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_id: customer?.id || null,
        shipping_full_name: full_name,
        shipping_email: email,
        shipping_phone: phone || null,
        shipping_address: address,
        shipping_city: city,
        shipping_country: country,
        shipping_postal_code: postal_code || null,
        notes: notes || null,
        subtotal,
        discount_amount: discount_amount || 0,
        shipping_fee: shipping_fee || 0,
        total,
        payment_method: payment_method || 'cod',
        payment_status: 'pending',
        status: 'pending',
        coupon_code: coupon_code || null,
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('[Orders] Create order error:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Create order items
    const orderItems = items.map((item: {
      product_id: string
      product_name: string
      product_sku?: string
      product_image?: string
      size?: string
      color?: string
      quantity: number
      unit_price: number
      total_price: number
    }) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_sku: item.product_sku || null,
      product_image: item.product_image || null,
      size: item.size || null,
      color: item.color || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    }))

    await supabase.from('order_items').insert(orderItems)

    // Status history
    await supabase.from('order_status_history').insert({
      order_id: order.id,
      status: 'pending',
      note: 'Order placed',
      created_by: 'system',
    })

    // Update coupon usage (fire and forget)
    if (coupon_code) {
      supabase
        .from('coupons')
        .select('usage_count')
        .eq('code', coupon_code)
        .single()
        .then(({ data: coupon }) => {
          if (coupon) {
            supabase
              .from('coupons')
              .update({ usage_count: coupon.usage_count + 1 })
              .eq('code', coupon_code)
              .then(() => {})
          }
        })
    }

    // Fetch full order with items for emails
    const { data: fullOrder } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', order.id)
      .single()

    // Send emails (non-blocking)
    if (fullOrder) {
      const orderWithItems = fullOrder as Order
      const { data: currencyRow } = await supabase.from('settings').select('value').eq('key', 'store_currency').single()
      const currency = currencyRow?.value || 'USD'
      const { subject: custSubject, html: custHtml } = orderConfirmationEmail(orderWithItems, currency)
      const { subject: adminSubject, html: adminHtml } = adminNewOrderEmail(orderWithItems, currency)

      await Promise.allSettled([
        sendEmail({ to: email, subject: custSubject, html: custHtml }),
        sendEmail({
          to: process.env.ADMIN_EMAIL || process.env.ADMIN_EMAILS?.split(',')[0] || 'admin@velaintimates.com',
          subject: adminSubject,
          html: adminHtml,
        }),
      ])
    }

    return NextResponse.json({
      success: true,
      order_id: order.id,
      order_number: orderNumber,
    })
  } catch (err) {
    console.error('[Orders] POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
