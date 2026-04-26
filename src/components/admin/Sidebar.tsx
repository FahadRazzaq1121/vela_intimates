'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ShoppingBag, Package, Tag, Users,
  BarChart2, Settings, LogOut, ChevronLeft, ChevronRight, Layers, MessageSquare, Star
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const NAV = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { href: '/admin/products', icon: Package, label: 'Products' },
  { href: '/admin/categories', icon: Tag, label: 'Categories' },
  { href: '/admin/hero-slides', icon: Layers, label: 'Hero Slides' },
  { href: '/admin/customers', icon: Users, label: 'Customers' },
  { href: '/admin/reviews', icon: Star, label: 'Reviews' },
  { href: '/admin/testimonials', icon: MessageSquare, label: 'Testimonials' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <aside className={cn(
      'flex flex-col bg-charcoal text-cream-100 transition-all duration-300 flex-shrink-0 hidden md:flex',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo */}
      <div className={cn('flex items-center border-b border-cream-200/10 h-16 px-4', collapsed ? 'justify-center' : 'justify-between px-5')}>
        {!collapsed && (
          <Link href="/admin/dashboard">
            <span className="font-display text-sm font-light tracking-[0.15em] uppercase text-cream-100">
              Vela Admin
            </span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-7 h-7 flex items-center justify-center text-cream-200/40 hover:text-cream-100 transition-colors rounded"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                active
                  ? 'bg-blush-600/20 text-blush-300'
                  : 'text-cream-200/60 hover:bg-cream-200/5 hover:text-cream-100',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-cream-200/10 py-4 px-2 space-y-1">
        <Link
          href="/"
          target="_blank"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cream-200/60 hover:text-cream-100 hover:bg-cream-200/5 transition-all duration-200',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? 'View Store' : undefined}
        >
          <BarChart2 size={18} />
          {!collapsed && <span>View Store</span>}
        </Link>

        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cream-200/60 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut size={18} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}
