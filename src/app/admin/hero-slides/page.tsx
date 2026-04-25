import { createClient } from '@/lib/supabase/server'
import HeroSlideManager from '@/components/admin/HeroSlideManager'
import { HeroSlide } from '@/types'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Hero Slides | Admin' }

export default async function HeroSlidesPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('hero_slides')
    .select('*')
    .order('sort_order')

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Hero Slides</h1>
        <p className="text-sm text-gray-500 mt-1">Manage the homepage hero slideshow images and text.</p>
      </div>
      <HeroSlideManager initialSlides={(data || []) as HeroSlide[]} />
    </div>
  )
}
