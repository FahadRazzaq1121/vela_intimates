import Link from 'next/link'
import { Instagram, Facebook, Heart } from 'lucide-react'
import { getCachedSiteSettings } from '@/lib/cache'
import NewsletterForm from './NewsletterForm'

interface FooterLink {
  label: string
  href: string
  visible: boolean
}

export default async function Footer() {
  const s = await getCachedSiteSettings()

  const shopLinks: FooterLink[] = (() => {
    try { return JSON.parse(s.footer_shop_links || '[]') } catch { return [] }
  })()

  const helpLinks: FooterLink[] = (() => {
    try { return JSON.parse(s.footer_help_links || '[]') } catch { return [] }
  })()

  const visibleShopLinks = shopLinks.filter((l) => l.visible)
  const visibleHelpLinks = helpLinks.filter((l) => l.visible)

  const whatsappNumber = s.footer_whatsapp || s.whatsapp_number || ''
  const whatsappClean = whatsappNumber.replace(/\D/g, '')

  return (
    <footer className="bg-charcoal text-cream-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="block mb-4">
              <span className="font-display text-xl font-light tracking-[0.15em] uppercase text-cream-100">
                {s.brand_name || 'Vela Intimates'}
              </span>
            </Link>
            <p className="text-sm text-cream-200/60 leading-relaxed mb-6">
              {s.brand_tagline || 'Luxury lingerie crafted for the modern woman.'}
            </p>
            <div className="flex items-center gap-4">
              {s.show_instagram === 'true' && (
                <a href={s.instagram_url || '#'} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center border border-cream-200/20 text-cream-200/60 hover:border-blush-400 hover:text-blush-400 transition-all duration-200"
                  aria-label="Instagram">
                  <Instagram size={16} />
                </a>
              )}
              {s.show_facebook === 'true' && (
                <a href={s.facebook_url || '#'} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center border border-cream-200/20 text-cream-200/60 hover:border-blush-400 hover:text-blush-400 transition-all duration-200"
                  aria-label="Facebook">
                  <Facebook size={16} />
                </a>
              )}
            </div>
          </div>

          {/* Shop */}
          {visibleShopLinks.length > 0 && (
            <div>
              <h3 className="text-xs font-medium uppercase tracking-ultra-wide text-cream-100 mb-5">Shop</h3>
              <ul className="space-y-3">
                {visibleShopLinks.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-cream-200/60 hover:text-cream-100 transition-colors duration-200">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Help */}
          {visibleHelpLinks.length > 0 && (
            <div>
              <h3 className="text-xs font-medium uppercase tracking-ultra-wide text-cream-100 mb-5">Help</h3>
              <ul className="space-y-3">
                {visibleHelpLinks.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-cream-200/60 hover:text-cream-100 transition-colors duration-200">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Newsletter + Contact */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-ultra-wide text-cream-100 mb-5">Stay Connected</h3>

            {s.show_newsletter === 'true' && (
              <>
                <p className="text-sm text-cream-200/60 mb-4">
                  Subscribe for exclusive offers, new arrivals, and style inspiration.
                </p>
                <NewsletterForm />
              </>
            )}

            {s.show_whatsapp === 'true' && whatsappNumber && (
              <div className={s.show_newsletter === 'true' ? 'mt-6' : ''}>
                <p className="text-xs text-cream-200/40 mb-1">WhatsApp Support</p>
                <a
                  href={`https://wa.me/${whatsappClean}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-cream-200/60 hover:text-cream-100 transition-colors"
                >
                  {whatsappNumber}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-cream-200/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-cream-200/40">
            © {new Date().getFullYear()} {s.footer_copyright || 'Vela Intimates. All rights reserved.'}
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs text-cream-200/40 hover:text-cream-200/70 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-cream-200/40 hover:text-cream-200/70 transition-colors">Terms of Service</Link>
          </div>
          <p className="text-xs text-cream-200/30 flex items-center gap-1">
            Made with <Heart size={10} className="text-blush-400" /> for {s.brand_name || 'Vela Intimates'}
          </p>
        </div>
      </div>
    </footer>
  )
}
