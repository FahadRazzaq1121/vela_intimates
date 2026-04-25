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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const serverClient = await createServerClient()
  const user = await verifyAdmin(serverClient)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseService
    .from('products')
    .select('*, category:categories(*), images:product_images(*)')
    .eq('id', id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const serverClient = await createServerClient()
  const user = await verifyAdmin(serverClient)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { images, ...productData } = body

  if (productData.name && !productData.slug) {
    productData.slug = slugify(productData.name)
  }

  const { data: product, error } = await supabaseService
    .from('products')
    .update(productData)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Replace images if provided
  if (images !== undefined) {
    await supabaseService.from('product_images').delete().eq('product_id', id)
    if (images.length > 0) {
      await supabaseService.from('product_images').insert(
        images.map((img: { url: string; alt_text?: string; is_primary?: boolean }, i: number) => ({
          product_id: id,
          url: img.url,
          alt_text: img.alt_text || null,
          is_primary: i === 0,
          sort_order: i,
        }))
      )
    }
  }

  revalidateTag('products', 'default')
  return NextResponse.json({ success: true, product })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const serverClient = await createServerClient()
  const user = await verifyAdmin(serverClient)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabaseService.from('products').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidateTag('products', 'default')
  return NextResponse.json({ success: true })
}
