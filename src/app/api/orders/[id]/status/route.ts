import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/send'
import { orderStatusUpdateEmail } from '@/lib/email/templates'
import { Order, OrderStatus } from '@/types'

const VALID_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'processing', 'packed', 'dispatched', 'delivered', 'cancelled']

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabaseAuth = await createServerClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: admin } = await supabaseAuth.from('admins').select('id').eq('id', user.id).single()
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = await req.json()
    const { status, note, tracking_number, tracking_url } = body

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = { status }
    if (tracking_number) updateData.tracking_number = tracking_number
    if (tracking_url) updateData.tracking_url = tracking_url
    if (status === 'delivered') updateData.delivered_at = new Date().toISOString()
    if (status === 'cancelled') {
      updateData.cancelled_at = new Date().toISOString()
      if (note) updateData.cancel_reason = note
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select('*, items:order_items(*)')
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Status history
    await supabase.from('order_status_history').insert({
      order_id: id,
      status,
      note: note || null,
      created_by: 'admin',
    })

    // Send status update email to customer
    const { subject, html } = orderStatusUpdateEmail(order as Order)
    await sendEmail({ to: order.shipping_email, subject, html })

    return NextResponse.json({ success: true, order })
  } catch (err) {
    console.error('[Order Status] PATCH error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
