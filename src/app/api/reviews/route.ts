import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { product_id, customer_name, customer_email, rating, title, body: reviewBody } = body

  if (!product_id || !customer_name || !customer_email || !rating) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
  }

  const { error } = await supabaseService.from('product_reviews').insert({
    product_id,
    customer_name: customer_name.trim(),
    customer_email: customer_email.trim().toLowerCase(),
    rating,
    title: title?.trim() || null,
    body: reviewBody?.trim() || null,
    is_approved: false,
    is_verified: false,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
