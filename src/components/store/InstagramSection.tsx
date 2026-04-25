import Image from 'next/image'
import { Instagram } from 'lucide-react'

const INSTAGRAM_POSTS = [
  'https://images.unsplash.com/photo-1617118994648-f1e4b2f9fd8c?w=400&q=80',
  'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80',
  'https://images.unsplash.com/photo-1583846552345-f38b0c5d5b41?w=400&q=80',
  'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&q=80',
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80',
]

export default function InstagramSection() {
  return (
    <section className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <p className="section-tag">Instagram</p>
          <a
            href="https://instagram.com/velaintimates"
            target="_blank"
            rel="noopener noreferrer"
            className="font-display text-2xl md:text-3xl text-charcoal hover:text-blush-600 transition-colors flex items-center justify-center gap-2"
          >
            <Instagram size={24} />
            @velaintimates
          </a>
          <p className="text-sm text-charcoal/50 mt-2">Tag us in your photos for a chance to be featured</p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-1 md:gap-2">
          {INSTAGRAM_POSTS.map((src, i) => (
            <a
              key={i}
              href="https://instagram.com/velaintimates"
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square overflow-hidden group block"
            >
              <Image
                src={src}
                alt={`Instagram post ${i + 1}`}
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
