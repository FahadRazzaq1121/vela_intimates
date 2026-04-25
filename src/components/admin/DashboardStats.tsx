'use client'

import { useQuery } from '@tanstack/react-query'
import { ShoppingBag, DollarSign, Users, Package, TrendingUp, Clock, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { formatPrice, formatDateShort, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@/lib/utils'

interface DashboardData {
  totalRevenue: number
  totalOrders: number
  todayOrders: number
  pendingOrders: number
  totalCustomers: number
  totalProducts: number
  revenueGrowth: number
  recentOrders: RecentOrder[]
}

interface RecentOrder {
  id: string
  order_number: string
  shipping_full_name: string
  shipping_email: string
  created_at: string
  total: number
  status: string
  items?: unknown[]
}

const STATS_CONFIG = [
  { key: 'totalRevenue', label: 'Total Revenue', icon: DollarSign, format: 'currency', color: 'bg-green-50 text-green-600' },
  { key: 'totalOrders', label: 'Total Orders', icon: ShoppingBag, format: 'number', color: 'bg-blue-50 text-blue-600' },
  { key: 'todayOrders', label: "Today's Orders", icon: TrendingUp, format: 'number', color: 'bg-purple-50 text-purple-600' },
  { key: 'pendingOrders', label: 'Pending Orders', icon: Clock, format: 'number', color: 'bg-amber-50 text-amber-600' },
  { key: 'totalCustomers', label: 'Customers', icon: Users, format: 'number', color: 'bg-pink-50 text-pink-600' },
  { key: 'totalProducts', label: 'Active Products', icon: Package, format: 'number', color: 'bg-indigo-50 text-indigo-600' },
]

export default function DashboardStats() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/admin/dashboard')
      if (!res.ok) throw new Error('Failed to fetch dashboard')
      return res.json()
    },
    staleTime: 2 * 60 * 1000,
  })

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {STATS_CONFIG.map((stat) => {
          const Icon = stat.icon
          const value = (data?.[stat.key as keyof DashboardData] as number) ?? 0
          return (
            <div key={stat.key} className="admin-card">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
                <Icon size={20} />
              </div>
              {isLoading ? (
                <>
                  <div className="h-7 w-20 bg-gray-100 rounded animate-pulse mb-1" />
                  <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-gray-800">
                    {stat.format === 'currency' ? formatPrice(value) : value.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                  {stat.key === 'totalRevenue' && data && (
                    <p className={`text-xs mt-1 font-medium ${data.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {data.revenueGrowth >= 0 ? '+' : ''}{data.revenueGrowth.toFixed(1)}% vs last 30d
                    </p>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Recent Orders */}
      <div className="admin-card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-800">Recent Orders</h2>
          <Link href="/admin/orders" className="flex items-center gap-1 text-xs text-blush-600 hover:text-blush-700 font-medium">
            View all <ArrowUpRight size={12} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Order', 'Customer', 'Date', 'Items', 'Total', 'Status', ''].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3 pr-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="py-3 pr-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : (data?.recentOrders || []).map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-gray-800 text-xs">{order.order_number}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="font-medium text-gray-700 text-xs">{order.shipping_full_name}</p>
                        <p className="text-xs text-gray-400">{order.shipping_email}</p>
                      </td>
                      <td className="py-3 pr-4 text-gray-500 text-xs whitespace-nowrap">
                        {formatDateShort(order.created_at)}
                      </td>
                      <td className="py-3 pr-4 text-gray-500 text-xs text-center">
                        {(order.items as unknown[])?.length || 0}
                      </td>
                      <td className="py-3 pr-4 font-medium text-gray-800 text-xs">
                        {formatPrice(order.total)}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`badge text-xs ${ORDER_STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                          {ORDER_STATUS_LABELS[order.status] || order.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <Link href={`/admin/orders/${order.id}`} className="text-xs text-blush-600 hover:text-blush-700 font-medium">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
              {!isLoading && (data?.recentOrders || []).length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 text-sm">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
