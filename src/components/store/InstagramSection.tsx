import Image from 'next/image'
import { Instagram } from 'lucide-react'
import { getCachedInstagramPosts, getCachedSiteSettings } from '@/lib/cache'

export default async function InstagramSection() {
  const [posts, settings] = await Promise.all([
    getCachedInstagramPosts(),
    getCachedSiteSettings(),
  ])

  if (posts.length === 0) return null

  const handle = settings.instagram_handle || '@velaintimate'
  const profileUrl = settings.instagram_url || `https://instagram.com/${handle.replace('@', '')}`

  return (
    <section className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <p className="section-tag">Instagram</p>
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display text-2xl md:text-3xl text-charcoal hover:text-blush-600 transition-colors flex items-center justify-center gap-2"
          >
            <Instagram size={24} />
            {handle}
          </a>
          <p className="text-sm text-charcoal/50 mt-2">Tag us in your photos for a chance to be featured</p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-1 md:gap-2">
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.post_url || profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square overflow-hidden group block"
            >
              <Image
                src={post.image_url}
                alt={post.caption || 'Instagram post'}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 33vw, 16vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                <Instagram size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
