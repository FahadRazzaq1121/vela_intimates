'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, Search, Heart, Menu, X, ChevronDown } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  {
    label: 'Shop',
    href: '/shop',
    children: [
      { label: 'All Products', href: '/shop' },
      { label: 'Bras', href: '/shop?category=bras' },
      { label: 'Panties', href: '/shop?category=panties' },
      { label: 'Sets', href: '/shop?category=sets' },
      { label: 'Sleepwear', href: '/shop?category=sleepwear' },
      { label: 'Loungewear', href: '/shop?category=loungewear' },
    ],
  },
  { label: 'New Arrivals', href: '/shop?filter=new' },
  { label: 'Best Sellers', href: '/shop?filter=bestseller' },
  { label: 'Sale', href: '/shop?filter=sale' },
]

export default function Header() {
  const pathname = usePathname()
  const { itemCount, toggleCart } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setSearchOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`
      setSearchOpen(false)
    }
  }

  const isHomePage = pathname === '/'

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-charcoal text-cream-100 text-center py-2 text-xs tracking-widest uppercase">
        Free shipping on orders over $75 · Use code WELCOME10 for 10% off
      </div>

      {/* Main Header */}
      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-cream-50/95 backdrop-blur-md shadow-sm'
            : 'bg-cream-50'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ touchAction: 'manipulation' }}
              className="md:hidden w-11 h-11 flex items-center justify-center text-charcoal hover:text-blush-600 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
              <span className="font-display text-xl md:text-2xl font-light tracking-[0.15em] text-charcoal uppercase">
                Vela Intimates
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.children && setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      'flex items-center gap-1 text-xs font-medium uppercase tracking-widest transition-colors duration-200 hover:text-blush-600',
                      pathname.startsWith(link.href) && link.href !== '/'
                        ? 'text-blush-600'
                        : 'text-charcoal'
                    )}
                  >
                    {link.label}
                    {link.children && <ChevronDown size={12} />}
                  </Link>

                  {/* Dropdown */}
                  {link.children && activeDropdown === link.label && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-cream-50 border border-cream-200 shadow-luxury py-2 z-50">
                      {link.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="block px-4 py-2 text-xs uppercase tracking-wider text-charcoal hover:bg-cream-100 hover:text-blush-600 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right icons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                style={{ touchAction: 'manipulation' }}
                className="p-2 text-charcoal hover:text-blush-600 transition-colors hidden md:flex"
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              <Link href="/wishlist" className="p-2 text-charcoal hover:text-blush-600 transition-colors hidden md:flex" aria-label="Wishlist">
                <Heart size={18} />
              </Link>

              <button
                type="button"
                onClick={toggleCart}
                style={{ touchAction: 'manipulation' }}
                className="relative w-11 h-11 flex items-center justify-center text-charcoal hover:text-blush-600 transition-colors"
                aria-label={`Cart (${itemCount} items)`}
              >
                <ShoppingBag size={18} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-blush-500 text-white text-[10px] w-4 h-4 flex items-center justify-center font-medium leading-none">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="border-t border-cream-200 bg-cream-50 px-4 py-4">
            <form onSubmit={handleSearch} className="max-w-lg mx-auto flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="flex-1 input-luxury text-sm"
                autoFocus
              />
              <button type="submit" className="btn-primary px-6 py-3 text-xs">
                Search
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-cream-50 shadow-luxury-lg overflow-y-auto cart-slide-in">
            <div className="p-6">
              <p className="font-display text-lg tracking-wider mb-8">Menu</p>

              {/* Mobile search */}
              <form onSubmit={handleSearch} className="flex gap-2 mb-8">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="flex-1 input-luxury text-sm"
                />
                <button type="submit" className="p-3 bg-charcoal text-cream-50">
                  <Search size={16} />
                </button>
              </form>

              <nav className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <div key={link.label}>
                    <Link
                      href={link.href}
                      className="block py-3 text-sm uppercase tracking-widest text-charcoal border-b border-cream-200 hover:text-blush-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                    {link.children && (
                      <div className="pl-4 pt-1 pb-2 space-y-1">
                        {link.children.slice(1).map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="block py-1.5 text-xs uppercase tracking-wider text-charcoal/60 hover:text-blush-600 transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>

              <div className="mt-8 pt-8 border-t border-cream-200 space-y-4">
                <Link href="/wishlist" className="flex items-center gap-3 text-sm text-charcoal hover:text-blush-600">
                  <Heart size={16} />
                  <span>Wishlist</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  )
}
