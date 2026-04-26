import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { revalidateTag } from 'next/cache'

const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function verifyAdmin() {
  const serverClient = await createServerClient()
  const { data: { user } } = await serverClient.auth.getUser()
  if (!user) return null
  const { data: admin } = await serverClient.from('admins').select('id').eq('id', user.id).single()
  return admin ? user : null
}

export async function GET() {
  const user = await verifyAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseService
    .from('testimonials')
    .select('*')
    .order('sort_order')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  const user = await verifyAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { data, error } = await supabaseService
    .from('testimonials')
    .insert(body)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidateTag('testimonials', 'default')
  return NextResponse.json({ testimonial: data })
}
