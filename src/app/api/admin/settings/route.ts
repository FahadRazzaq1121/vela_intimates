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

  const { data, error } = await supabaseService.from('settings').select('key, value')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const settings: Record<string, string> = {}
  for (const row of data || []) {
    settings[row.key] = row.value || ''
  }
  return NextResponse.json(settings)
}

export async function PUT(req: NextRequest) {
  const user = await verifyAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: Record<string, string> = await req.json()

  const upserts = Object.entries(body).map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() }))

  const { error } = await supabaseService.from('settings').upsert(upserts, { onConflict: 'key' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidateTag('site-settings', 'default')
  return NextResponse.json({ success: true })
}
