import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { slugify } from '@/lib/utils'
import { revalidateTag } from 'next/cache'

async function verifyAdmin(serverClient: Awaited<ReturnType<typeof createServerClient>>) {
  const { data: { user } } = await serverClient.auth.getUser()
  if (!user) return null
  const { data: admin } = await serverClient.from('admins').select('id').eq('id', user.id).single()
  return admin ? user : null
}

const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const serverClient = await createServerClient()
  const user = await verifyAdmin(serverClient)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseService
    .from('categories')
    .select('*')
    .order('sort_order')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const serverClient = await createServerClient()
  const user = await verifyAdmin(serverClient)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const slug = body.slug || slugify(body.name)

  const { data, error } = await supabaseService
    .from('categories')
    .insert({ ...body, slug })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidateTag('categories', 'default')
  return NextResponse.json({ success: true, category: data })
}
