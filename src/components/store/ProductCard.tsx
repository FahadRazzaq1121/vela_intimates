'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingBag, Eye } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Product } from '@/types'
import { formatPrice, getDiscountPercent } from '@/lib/utils'
import { useCurrency } from '@/contexts/CurrencyContext'
import { useCart } from '@/contexts/CartContext'
import Badge from '@/components/ui/Badge'

interface ProductCardProps {
  product: Product
  priority?: boolean
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const currency = useCurrency()
  const { addItem, getItemKey } = useCart()
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [quickAdded, setQuickAdded] = useState(false)

  const FALLBACK_IMAGE = '/images/product-placeholder.svg'

  const primaryImage = product.images?.find((i) => i.is_primary)?.url ||
    product.images?.[0]?.url ||
    FALLBACK_IMAGE

  const secondaryImage = product.images?.[1]?.url

  const [imgSrc, setImgSrc] = useState(primaryImage)

  const displayPrice = product.sale_price ?? product.price
  const hasDiscount = product.sale_price !== null && product.sale_price < product.price

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('vela-wishlist') || '[]') as string[]
    setIsWishlisted(wishlist.includes(product.id))
  }, [product.id])

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const wishlist = JSON.parse(localStorage.getItem('vela-wishlist') || '[]') as string[]
    const updated = isWishlisted
      ? wishlist.filter((id) => id !== product.id)
      : [...wishlist, product.id]
    localStorage.setItem('vela-wishlist', JSON.stringify(updated))
    setIsWishlisted(!isWishlisted)
  }

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.stock_quantity === 0) return

    const defaultSize = product.sizes?.[0] || null
    const defaultColor = product.colors?.[0]?.name || null
    const itemKey = getItemKey(product.id, defaultSize, defaultColor)

    addItem({
      id: itemKey,
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      sale_price: product.sale_price,
      image: primaryImage,
      size: defaultSize,
      color: defaultColor,
      quantity: 1,
      stock_quantity: product.stock_quantity,
    })

    setQuickAdded(true)
    setTimeout(() => setQuickAdded(false), 2000)
  }

  const isOutOfStock = product.stock_quantity === 0
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= product.low_stock_threshold

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group product-card block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-cream-100">
        <Image
          src={hovered && secondaryImage ? secondaryImage : imgSrc}
          alt={product.images?.find((i) => i.is_primary)?.alt_text || product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover transition-all duration-700 ${hovered ? 'scale-105' : 'scale-100'}`}
          priority={priority}
          onError={() => setImgSrc(FALLBACK_IMAGE)}
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {hasDiscount && (
            <Badge variant="sale">
              -{getDiscountPercent(product.price, product.sale_price!)}%
            </Badge>
          )}
          {product.is_new_arrival && !hasDiscount && (
            <Badge variant="new">New</Badge>
          )}
          {isLowStock && (
            <Badge variant="low">Only {product.stock_quantity} left</Badge>
          )}
          {isOutOfStock && (
            <Badge variant="out">Sold Out</Badge>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={toggleWishlist}
          className={`absolute top-3 right-3 w-8 h-8 flex items-center justify-center transition-all duration-200 ${hovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'} bg-cream-50/90 hover:bg-cream-50`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={14}
            className={isWishlisted ? 'fill-blush-500 text-blush-500' : 'text-charcoal'}
          />
        </button>

        {/* Quick add button */}
        {!isOutOfStock && (
          <div className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${hovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <button
              onClick={handleQuickAdd}
              className="w-full bg-charcoal text-cream-50 py-3 text-xs font-medium uppercase tracking-widest hover:bg-blush-600 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {quickAdded ? (
                <>
                  <span>✓</span>
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={14} />
                  <span>Quick Add</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* View indicator for mobile (visual only — outer card link handles navigation) */}
        <div
          className={`md:hidden absolute bottom-3 right-3 w-9 h-9 flex items-center justify-center bg-cream-50/90 ${hovered ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200 pointer-events-none`}
          aria-hidden="true"
        >
          <Eye size={14} className="text-charcoal" />
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3 md:p-4">
        {product.category && (
          <p className="text-2xs uppercase tracking-widest text-charcoal/40 mb-1">
            {product.category.name}
          </p>
        )}
        <h3 className="font-medium text-sm text-charcoal leading-snug mb-2 group-hover:text-blush-600 transition-colors duration-200 line-clamp-2">
          {product.name}
        </h3>

        {/* Colors */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-1 mb-2">
            {product.colors.slice(0, 4).map((color) => (
              <div
                key={color.name}
                className="w-3.5 h-3.5 rounded-full border border-cream-300"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-2xs text-charcoal/40">+{product.colors.length - 4}</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${hasDiscount ? 'text-blush-600' : 'text-charcoal'}`}>
            {formatPrice(displayPrice, currency)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-charcoal/40 line-through">
              {formatPrice(product.price, currency)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
