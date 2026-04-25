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

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')
  const search = searchParams.get('search') || ''
  const from = (page - 1) * pageSize

  let query = supabaseService
    .from('products')
    .select('*, category:categories(*), images:product_images(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1)

  if (search) query = query.ilike('name', `%${search}%`)

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data, count, page, pageSize })
}

export async function POST(req: NextRequest) {
  const serverClient = await createServerClient()
  const user = await verifyAdmin(serverClient)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { images, ...productData } = body

  const slug = productData.slug || slugify(productData.name)

  const { data: product, error } = await supabaseService
    .from('products')
    .insert({ ...productData, slug })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (images?.length) {
    await supabaseService.from('product_images').insert(
      images.map((img: { url: string; alt_text?: string; is_primary?: boolean; sort_order?: number }, i: number) => ({
        product_id: product.id,
        url: img.url,
        alt_text: img.alt_text || null,
        is_primary: i === 0,
        sort_order: i,
      }))
    )
  }

  revalidateTag('products', 'default')
  return NextResponse.json({ success: true, product })
}
