'use client'

import Link from 'next/link'
import { Instagram, Facebook, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-charcoal text-cream-100">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="block mb-4">
              <span className="font-display text-xl font-light tracking-[0.15em] uppercase text-cream-100">
                Vela Intimates
              </span>
            </Link>
            <p className="text-sm text-cream-200/60 leading-relaxed mb-6">
              Luxury lingerie crafted for the modern woman who appreciates beauty, comfort, and confidence.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com/velaintimates"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center border border-cream-200/20 text-cream-200/60 hover:border-blush-400 hover:text-blush-400 transition-all duration-200"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
              <a
                href="#"
                className="w-9 h-9 flex items-center justify-center border border-cream-200/20 text-cream-200/60 hover:border-blush-400 hover:text-blush-400 transition-all duration-200"
                aria-label="Facebook"
              >
                <Facebook size={16} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-ultra-wide text-cream-100 mb-5">Shop</h3>
            <ul className="space-y-3">
              {[
                { label: 'All Products', href: '/shop' },
                { label: 'Bras', href: '/shop?category=bras' },
                { label: 'Panties', href: '/shop?category=panties' },
                { label: 'Sets', href: '/shop?category=sets' },
                { label: 'Sleepwear', href: '/shop?category=sleepwear' },
                { label: 'Loungewear', href: '/shop?category=loungewear' },
                { label: 'New Arrivals', href: '/shop?filter=new' },
                { label: 'Sale', href: '/shop?filter=sale' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream-200/60 hover:text-cream-100 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-ultra-wide text-cream-100 mb-5">Help</h3>
            <ul className="space-y-3">
              {[
                { label: 'Size Guide', href: '/size-guide' },
                { label: 'Shipping Info', href: '/shipping' },
                { label: 'Returns & Exchanges', href: '/returns' },
                { label: 'Care Guide', href: '/care' },
                { label: 'FAQs', href: '/faqs' },
                { label: 'Contact Us', href: '/contact' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream-200/60 hover:text-cream-100 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact / Newsletter */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-ultra-wide text-cream-100 mb-5">Stay Connected</h3>
            <p className="text-sm text-cream-200/60 mb-4">
              Subscribe for exclusive offers, new arrivals, and style inspiration.
            </p>
            <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                className="bg-transparent border border-cream-200/20 text-cream-100 placeholder-cream-200/30 px-4 py-3 text-sm outline-none focus:border-blush-400 transition-colors"
              />
              <button type="submit" className="btn-rose text-xs py-3 justify-center">
                Subscribe
              </button>
            </form>

            <div className="mt-6">
              <p className="text-xs text-cream-200/40 mb-1">WhatsApp Support</p>
              <a
                href="https://wa.me/1234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-cream-200/60 hover:text-cream-100 transition-colors"
              >
                +1 (234) 567-890
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-cream-200/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-cream-200/40">
            © {new Date().getFullYear()} Vela Intimates. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs text-cream-200/40 hover:text-cream-200/70 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-cream-200/40 hover:text-cream-200/70 transition-colors">
              Terms of Service
            </Link>
          </div>
          <p className="text-xs text-cream-200/30 flex items-center gap-1">
            Made with <Heart size={10} className="text-blush-400" /> for Vela Intimates
          </p>
        </div>
      </div>
    </footer>
  )
}
