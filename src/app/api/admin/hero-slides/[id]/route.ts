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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const { data, error } = await supabaseService
    .from('hero_slides')
    .update({
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
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidateTag('hero-slides', 'default')
  return NextResponse.json({ slide: data })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { error } = await supabaseService.from('hero_slides').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidateTag('hero-slides', 'default')
  return NextResponse.json({ success: true })
}
