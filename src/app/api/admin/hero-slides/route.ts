import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { revalidateTag } from 'next/cache'

const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function requireAdmin() {
  const serverClient = await createServerClient()
  const { data: { user } } = await serverClient.auth.getUser()
  if (!user) return null
  const { data: admin } = await serverClient.from('admins').select('id').eq('id', user.id).single()
  return admin
}

export async function GET() {
  const { data, error } = await supabaseService
    .from('hero_slides')
    .select('*')
    .order('sort_order')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ slides: data })
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  if (!body.title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  if (!body.image_url?.trim()) return NextResponse.json({ error: 'Image is required' }, { status: 400 })

  const { data, error } = await supabaseService
    .from('hero_slides')
    .insert({
      image_url: body.image_url,
      tag: body.tag || null,
      title: body.title,
      subtitle: body.subtitle || null,
      cta_text: body.cta_text || null,
      cta_href: body.cta_href || null,
      cta_secondary_text: body.cta_secondary_text || null,
      cta_secondary_href: body.cta_secondary_href || null,
      align: body.align || 'left',
      is_active: body.is_active ?? true,
      sort_order: body.sort_order ?? 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidateTag('hero-slides', 'default')
  return NextResponse.json({ slide: data }, { status: 201 })
}
