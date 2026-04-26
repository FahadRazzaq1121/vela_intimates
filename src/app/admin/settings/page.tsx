import SettingsManager from '@/components/admin/SettingsManager'
import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

export const metadata: Metadata = { title: 'Settings | Admin' }

async function getSettings() {
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data } = await db.from('settings').select('key, value')
  const settings: Record<string, string> = {}
  for (const row of data || []) {
    settings[row.key] = row.value || ''
  }
  return settings
}

export default async function AdminSettingsPage() {
  const settings = await getSettings()
  return <SettingsManager initialSettings={settings} />
}
