import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const orderTotal = parseFloat(searchParams.get('orderTotal') || '0')

  if (!code) return NextResponse.json({ valid: false, error: 'No code provided' })

  const supabase = await createClient()
  const { data } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  if (!data) return NextResponse.json({ valid: false, error: 'Invalid coupon code' })

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, error: 'Coupon has expired' })
  }

  if (data.usage_limit && data.usage_count >= data.usage_limit) {
    return NextResponse.json({ valid: false, error: 'Coupon usage limit reached' })
  }

  if (data.minimum_order && orderTotal < data.minimum_order) {
    return NextResponse.json({ valid: false, error: `Minimum order of $${data.minimum_order} required` })
  }

  return NextResponse.json({
    valid: true,
    discount_type: data.discount_type,
    discount_value: data.discount_value,
    description: data.description,
  })
}
