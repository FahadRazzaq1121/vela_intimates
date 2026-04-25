'use client'

import { Admin } from '@/types'
import Link from 'next/link'
import { Bell, ExternalLink } from 'lucide-react'
import { usePathname } from 'next/navigation'

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/orders': 'Orders',
  '/admin/products': 'Products',
  '/admin/categories': 'Categories',
  '/admin/customers': 'Customers',
}

export default function AdminTopBar({ admin }: { admin: Admin }) {
  const pathname = usePathname()
  const title = Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1] || 'Admin'

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-lg font-semibold text-gray-800">{title}</h1>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blush-600 transition-colors"
        >
          <ExternalLink size={14} />
          <span className="hidden sm:inline">View Store</span>
        </Link>

        <button className="relative text-gray-500 hover:text-gray-700 transition-colors">
          <Bell size={18} />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blush-100 flex items-center justify-center text-sm font-medium text-blush-700">
            {admin.full_name?.[0] || admin.email[0].toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-gray-700">{admin.full_name || 'Admin'}</p>
            <p className="text-2xs text-gray-400">{admin.email}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
