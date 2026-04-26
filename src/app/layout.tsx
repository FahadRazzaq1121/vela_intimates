import type { Metadata, Viewport } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from '@/contexts/CartContext'
import { CurrencyProvider } from '@/contexts/CurrencyContext'
import QueryProvider from '@/providers/QueryProvider'
import { getCachedSiteSettings } from '@/lib/cache'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://velaintimates.com'),
  title: {
    default: 'Vela Intimates — Luxury Lingerie & Intimates',
    template: '%s | Vela Intimates',
  },
  description: 'Discover our exquisite collection of luxury lingerie, intimate wear, and sleepwear. Crafted for the modern woman who appreciates beauty and comfort.',
  keywords: ['luxury lingerie', 'intimate wear', 'bras', 'sleepwear', 'Vela Intimates'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://velaintimates.com',
    siteName: 'Vela Intimates',
    title: 'Vela Intimates — Luxury Lingerie & Intimates',
    description: 'Discover our exquisite collection of luxury lingerie, intimate wear, and sleepwear.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Vela Intimates' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vela Intimates',
    description: 'Luxury lingerie for every woman.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getCachedSiteSettings()
  const currency = settings.store_currency || 'USD'

  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${cormorant.variable}`}>
      <body>
        <QueryProvider>
        <CartProvider>
        <CurrencyProvider currency={currency}>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#2C2C2C',
                color: '#FAF6F1',
                fontSize: '14px',
                fontFamily: 'var(--font-inter)',
                borderRadius: '0',
                padding: '12px 16px',
              },
            }}
          />
        </CurrencyProvider>
        </CartProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
