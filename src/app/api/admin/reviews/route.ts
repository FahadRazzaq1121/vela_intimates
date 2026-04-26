import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

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

export async function GET(req: NextRequest) {
  const user = await verifyAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = 20
  const filter = searchParams.get('filter') || 'all'
  const from = (page - 1) * pageSize

  let query = supabaseService
    .from('product_reviews')
    .select('*, product:products(name, slug)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1)

  if (filter === 'pending') query = query.eq('is_approved', false)
  if (filter === 'approved') query = query.eq('is_approved', true)

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data, count, page, pageSize })
}
