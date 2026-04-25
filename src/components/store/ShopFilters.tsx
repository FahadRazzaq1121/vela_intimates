'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Category } from '@/types'
import { ChevronDown, ChevronUp, X } from 'lucide-react'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '32A', '32B', '32C', '32D', '34A', '34B', '34C', '34D', '36B', '36C', '36D']

interface ShopFiltersProps {
  categories: Category[]
  currentParams: Record<string, string | undefined>
}

export default function ShopFilters({ categories, currentParams }: ShopFiltersProps) {
  const router = useRouter()
  const [categoryOpen, setCategoryOpen] = useState(true)
  const [priceOpen, setPriceOpen] = useState(true)
  const [sizeOpen, setSizeOpen] = useState(false)
  const [minPrice, setMinPrice] = useState(currentParams.minPrice || '')
  const [maxPrice, setMaxPrice] = useState(currentParams.maxPrice || '')

  const selectedSizes = currentParams.sizes ? currentParams.sizes.split(',') : []

  const updateParam = (key: string, value: string | undefined) => {
    const params = new URLSearchParams()
    Object.entries(currentParams).forEach(([k, v]) => {
      if (v && k !== key && k !== 'page') params.set(k, v)
    })
    if (value) params.set(key, value)
    router.push(`/shop?${params.toString()}`)
  }

  const toggleSize = (size: string) => {
    const current = selectedSizes
    const updated = current.includes(size)
      ? current.filter((s) => s !== size)
      : [...current, size]
    updateParam('sizes', updated.length ? updated.join(',') : undefined)
  }

  const applyPrice = () => {
    const params = new URLSearchParams()
    Object.entries(currentParams).forEach(([k, v]) => {
      if (v && k !== 'minPrice' && k !== 'maxPrice' && k !== 'page') params.set(k, v)
    })
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    router.push(`/shop?${params.toString()}`)
  }

  const hasActiveFilters = !!(
    currentParams.category ||
    currentParams.minPrice ||
    currentParams.maxPrice ||
    currentParams.sizes ||
    currentParams.filter
  )

  return (
    <div className="space-y-1">
      {hasActiveFilters && (
        <a
          href="/shop"
          className="flex items-center gap-2 text-xs text-blush-600 hover:text-blush-700 mb-4 transition-colors"
        >
          <X size={12} />
          Clear all filters
        </a>
      )}

      {/* Categories */}
      <div className="border-b border-cream-200 pb-4">
        <button
          onClick={() => setCategoryOpen(!categoryOpen)}
          className="flex items-center justify-between w-full text-xs font-medium uppercase tracking-widest text-charcoal py-3"
        >
          Category
          {categoryOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {categoryOpen && (
          <div className="space-y-2 mt-1">
            <a
              href="/shop"
              className={`block text-sm transition-colors ${!currentParams.category ? 'text-blush-600 font-medium' : 'text-charcoal/60 hover:text-charcoal'}`}
            >
              All Products
            </a>
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className={`block text-sm transition-colors ${currentParams.category === cat.slug ? 'text-blush-600 font-medium' : 'text-charcoal/60 hover:text-charcoal'}`}
              >
                {cat.name}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Quick Filters */}
      <div className="border-b border-cream-200 pb-4">
        <p className="text-xs font-medium uppercase tracking-widest text-charcoal py-3">Filter</p>
        <div className="space-y-2">
          {[
            { label: 'New Arrivals', value: 'new' },
            { label: 'Best Sellers', value: 'bestseller' },
            { label: 'On Sale', value: 'sale' },
          ].map((f) => (
            <a
              key={f.value}
              href={`/shop?filter=${f.value}`}
              className={`block text-sm transition-colors ${currentParams.filter === f.value ? 'text-blush-600 font-medium' : 'text-charcoal/60 hover:text-charcoal'}`}
            >
              {f.label}
            </a>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="border-b border-cream-200 pb-4">
        <button
          onClick={() => setPriceOpen(!priceOpen)}
          className="flex items-center justify-between w-full text-xs font-medium uppercase tracking-widest text-charcoal py-3"
        >
          Price
          {priceOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {priceOpen && (
          <div className="mt-2 space-y-3">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min $"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full border border-cream-300 px-2 py-1.5 text-xs outline-none focus:border-blush-400"
                min="0"
              />
              <input
                type="number"
                placeholder="Max $"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full border border-cream-300 px-2 py-1.5 text-xs outline-none focus:border-blush-400"
                min="0"
              />
            </div>
            <button
              onClick={applyPrice}
              className="w-full bg-charcoal text-cream-50 py-2 text-xs uppercase tracking-wider hover:bg-blush-600 transition-colors"
            >
              Apply
            </button>
            {(currentParams.minPrice || currentParams.maxPrice) && (
              <button
                onClick={() => {
                  setMinPrice('')
                  setMaxPrice('')
                  updateParam('minPrice', undefined)
                }}
                className="w-full text-xs text-charcoal/50 hover:text-charcoal underline"
              >
                Clear price filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sizes */}
      <div className="border-b border-cream-200 pb-4">
        <button
          onClick={() => setSizeOpen(!sizeOpen)}
          className="flex items-center justify-between w-full text-xs font-medium uppercase tracking-widest text-charcoal py-3"
        >
          Size
          {sizeOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {sizeOpen && (
          <div className="flex flex-wrap gap-2 mt-2">
            {SIZES.map((size) => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`px-2.5 py-1 text-xs border transition-all duration-200 ${
                  selectedSizes.includes(size)
                    ? 'border-charcoal bg-charcoal text-cream-50'
                    : 'border-cream-300 text-charcoal hover:border-charcoal'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
