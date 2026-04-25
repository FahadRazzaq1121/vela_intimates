import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const serverClient = await createServerClient()
  const { data: { user } } = await serverClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: admin } = await serverClient.from('admins').select('id').eq('id', user.id).single()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const bucket = (formData.get('bucket') as string) || 'product-images'

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { data, error } = await supabaseService.storage
      .from(bucket)
      .upload(fileName, file, { contentType: file.type, upsert: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const { data: { publicUrl } } = supabaseService.storage.from(bucket).getPublicUrl(data.path)

    return NextResponse.json({ success: true, url: publicUrl, path: data.path })
  } catch (err) {
    console.error('[Upload] Error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
