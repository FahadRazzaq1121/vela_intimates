import { NextResponse } from 'next/server'
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

export async function GET() {
  const user = await verifyAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()

  const [
    allOrdersRes, todayOrdersRes, pendingOrdersRes, customersRes,
    productsRes, recentOrdersRes, last30Res, prev30Res,
  ] = await Promise.all([
    supabaseService.from('orders').select('total, status', { count: 'exact' }),
    supabaseService.from('orders').select('id', { count: 'exact' }).gte('created_at', today.toISOString()),
    supabaseService.from('orders').select('id', { count: 'exact' }).in('status', ['pending', 'confirmed']),
    supabaseService.from('customers').select('id', { count: 'exact' }),
    supabaseService.from('products').select('id', { count: 'exact' }).eq('is_active', true),
    supabaseService.from('orders').select('*, items:order_items(*)').order('created_at', { ascending: false }).limit(8),
    supabaseService.from('orders').select('total').gte('created_at', thirtyDaysAgo).eq('status', 'delivered'),
    supabaseService.from('orders').select('total').gte('created_at', sixtyDaysAgo).lt('created_at', thirtyDaysAgo).eq('status', 'delivered'),
  ])

  const totalRevenue = (allOrdersRes.data || [])
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + (o.total || 0), 0)

  const last30Revenue = (last30Res.data || []).reduce((sum, o) => sum + (o.total || 0), 0)
  const prev30Revenue = (prev30Res.data || []).reduce((sum, o) => sum + (o.total || 0), 0)
  const revenueGrowth = prev30Revenue > 0 ? ((last30Revenue - prev30Revenue) / prev30Revenue) * 100 : 0

  return NextResponse.json({
    totalRevenue,
    totalOrders: allOrdersRes.count || 0,
    todayOrders: todayOrdersRes.count || 0,
    pendingOrders: pendingOrdersRes.count || 0,
    totalCustomers: customersRes.count || 0,
    totalProducts: productsRes.count || 0,
    revenueGrowth,
    recentOrders: recentOrdersRes.data || [],
  })
}
