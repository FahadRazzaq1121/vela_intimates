'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingBag, Minus, Plus, Star, ChevronDown, ChevronRight, Truck, RefreshCw, Shield } from 'lucide-react'
import { Product } from '@/types'
import { useCart } from '@/contexts/CartContext'
import { formatPrice, getDiscountPercent } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface ProductDetailClientProps {
  product: Product
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addItem, getItemKey } = useCart()
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(product.sizes?.[0] || null)
  const [selectedColor, setSelectedColor] = useState<string | null>(product.colors?.[0]?.name || null)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(() => {
    if (typeof window === 'undefined') return false
    const wishlist = JSON.parse(localStorage.getItem('vela-wishlist') || '[]') as string[]
    return wishlist.includes(product.id)
  })
  const [openAccordion, setOpenAccordion] = useState<string | null>('description')
  const [adding, setAdding] = useState(false)

  const images = product.images || []
  const primaryImage = images.find((i) => i.is_primary)?.url || images[0]?.url || '/images/product-placeholder.svg'
  const displayImages = images.length > 0 ? images : [{ id: '0', url: primaryImage, alt_text: product.name, is_primary: true, sort_order: 0, product_id: product.id, created_at: '' }]

  const price = product.sale_price ?? product.price
  const hasDiscount = product.sale_price !== null && product.sale_price < product.price
  const isOutOfStock = product.stock_quantity === 0
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= (product.low_stock_threshold || 5)

  const approvedReviews = product.reviews?.filter((r) => r.is_approved) || []
  const avgRating = approvedReviews.length > 0
    ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
    : 0

  const handleAddToCart = () => {
    if (isOutOfStock) return
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size', { style: { background: '#2C2C2C', color: '#FAF6F1' } })
      return
    }

    setAdding(true)
    const itemKey = getItemKey(product.id, selectedSize, selectedColor)
    addItem({
      id: itemKey,
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      sale_price: product.sale_price,
      image: displayImages[selectedImage]?.url || primaryImage,
      size: selectedSize,
      color: selectedColor,
      quantity,
      stock_quantity: product.stock_quantity,
    })
    setTimeout(() => setAdding(false), 500)
  }

  const toggleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('vela-wishlist') || '[]') as string[]
    const updated = isWishlisted
      ? wishlist.filter((id) => id !== product.id)
      : [...wishlist, product.id]
    localStorage.setItem('vela-wishlist', JSON.stringify(updated))
    setIsWishlisted(!isWishlisted)
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist', {
      style: { background: '#2C2C2C', color: '#FAF6F1' },
    })
  }

  const ACCORDIONS = [
    {
      id: 'description',
      label: 'Description',
      content: product.description || product.short_description || 'No description available.',
    },
    ...(product.materials ? [{
      id: 'materials',
      label: 'Materials & Composition',
      content: product.materials,
    }] : []),
    ...(product.care_instructions ? [{
      id: 'care',
      label: 'Care Instructions',
      content: product.care_instructions,
    }] : []),
    {
      id: 'shipping',
      label: 'Shipping & Returns',
      content: 'We offer free shipping on all orders over $75. Standard shipping takes 3–5 business days. Express shipping (1–2 days) available at checkout. Easy 30-day returns on unworn items with tags attached.',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-charcoal/40 mb-8">
        <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
        <ChevronRight size={12} />
        <Link href="/shop" className="hover:text-charcoal transition-colors">Shop</Link>
        {product.category && (
          <>
            <ChevronRight size={12} />
            <Link href={`/shop?category=${product.category.slug}`} className="hover:text-charcoal transition-colors">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight size={12} />
        <span className="text-charcoal truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
        {/* Images — thumbnails + main */}
        <div className="flex gap-3">
          {/* Thumbnails */}
          {displayImages.length > 1 && (
            <div className="flex flex-col gap-2">
              {displayImages.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedImage(i)}
                  style={{ touchAction: 'manipulation' }}
                  className={`relative w-16 h-20 flex-shrink-0 overflow-hidden border-2 transition-all duration-200 ${i === selectedImage ? 'border-charcoal' : 'border-transparent hover:border-cream-300'}`}
                >
                  <Image src={img.url} alt={img.alt_text || `Image ${i + 1}`} fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}

          {/* Main Image */}
          <div className="flex-1 relative aspect-[3/4] bg-cream-100 overflow-hidden">
            <Image
              src={displayImages[selectedImage]?.url || primaryImage}
              alt={displayImages[selectedImage]?.alt_text || product.name}
              fill
              className="object-cover transition-opacity duration-300"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              loading="eager"
            />
            {hasDiscount && (
              <div className="absolute top-4 left-4">
                <Badge variant="sale">-{getDiscountPercent(product.price, product.sale_price!)}%</Badge>
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          {product.category && (
            <Link href={`/shop?category=${product.category.slug}`} className="text-xs uppercase tracking-widest text-charcoal/40 hover:text-blush-600 transition-colors mb-2">
              {product.category.name}
            </Link>
          )}

          <h1 className="font-display text-3xl md:text-4xl font-light text-charcoal leading-tight mb-3">
            {product.name}
          </h1>

          {/* Rating */}
          {approvedReviews.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={14}
                    className={star <= Math.round(avgRating) ? 'fill-gold text-gold' : 'fill-cream-300 text-cream-300'}
                  />
                ))}
              </div>
              <span className="text-xs text-charcoal/50">({approvedReviews.length} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            <span className={`font-display text-2xl font-medium ${hasDiscount ? 'text-blush-600' : 'text-charcoal'}`}>
              {formatPrice(price)}
            </span>
            {hasDiscount && (
              <span className="text-lg text-charcoal/40 line-through font-light">{formatPrice(product.price)}</span>
            )}
          </div>

          <p className="text-sm text-charcoal/65 leading-relaxed mb-6">
            {product.short_description || product.description?.slice(0, 200)}
          </p>

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="label-luxury">Color</label>
                <span className="text-xs text-charcoal/60">{selectedColor}</span>
              </div>
              <div className="flex gap-3 flex-wrap">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color.name)}
                    title={color.name}
                    style={{ backgroundColor: color.hex, touchAction: 'manipulation' }}
                    className={`w-11 h-11 rounded-full border-2 transition-all duration-200 ${selectedColor === color.name ? 'border-charcoal scale-110 ring-2 ring-charcoal ring-offset-2' : 'border-cream-200'}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="label-luxury">Size</label>
                <button type="button" className="text-xs text-charcoal/40 underline hover:text-charcoal transition-colors">Size Guide</button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    style={{ touchAction: 'manipulation' }}
                    className={`px-4 text-xs border transition-all duration-200 min-w-[44px] h-11 text-center ${selectedSize === size ? 'border-charcoal bg-charcoal text-cream-50' : 'border-cream-300 text-charcoal hover:border-charcoal'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <label className="label-luxury">Quantity</label>
            <div className="flex items-center border border-cream-300 w-36">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ touchAction: 'manipulation' }}
                className="w-11 h-11 flex items-center justify-center text-charcoal hover:text-blush-600 transition-colors"
                aria-label="Decrease"
              >
                <Minus size={14} />
              </button>
              <span className="flex-1 text-center text-sm font-medium">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                disabled={quantity >= product.stock_quantity}
                style={{ touchAction: 'manipulation' }}
                className="w-11 h-11 flex items-center justify-center text-charcoal hover:text-blush-600 disabled:opacity-30 transition-colors"
                aria-label="Increase"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Stock Status */}
          <div className="mb-4">
            {isOutOfStock ? (
              <Badge variant="out">Out of Stock</Badge>
            ) : isLowStock ? (
              <Badge variant="low">Only {product.stock_quantity} left in stock</Badge>
            ) : (
              <Badge variant="success">In Stock</Badge>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-3 mb-8">
            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              loading={adding}
              className="flex-1"
              size="lg"
            >
              <ShoppingBag size={16} />
              {isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
            </Button>
            <button
              type="button"
              onClick={toggleWishlist}
              style={{ touchAction: 'manipulation' }}
              className={`w-14 h-14 border flex items-center justify-center transition-all duration-200 ${isWishlisted ? 'border-blush-400 bg-blush-50 text-blush-500' : 'border-cream-300 text-charcoal hover:border-blush-400 hover:text-blush-500'}`}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={18} className={isWishlisted ? 'fill-blush-500' : ''} />
            </button>
          </div>

          {/* Trust Icons */}
          <div className="grid grid-cols-3 gap-3 py-6 border-t border-cream-200 mb-6">
            {[
              { icon: <Truck size={16} />, label: 'Free shipping over $75' },
              { icon: <RefreshCw size={16} />, label: '30-day easy returns' },
              { icon: <Shield size={16} />, label: 'Secure checkout' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center text-center gap-1.5">
                <span className="text-blush-500">{item.icon}</span>
                <span className="text-2xs text-charcoal/50 leading-tight">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Accordion */}
          <div className="space-y-1">
            {ACCORDIONS.map((acc) => (
              <div key={acc.id} className="border-b border-cream-200">
                <button
                  onClick={() => setOpenAccordion(openAccordion === acc.id ? null : acc.id)}
                  className="flex items-center justify-between w-full py-4 text-xs font-medium uppercase tracking-widest text-charcoal hover:text-blush-600 transition-colors"
                >
                  {acc.label}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${openAccordion === acc.id ? 'rotate-180' : ''}`}
                  />
                </button>
                {openAccordion === acc.id && (
                  <div className="pb-4 text-sm text-charcoal/60 leading-relaxed">
                    {acc.content}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Reviews Section */}
          {approvedReviews.length > 0 && (
            <div className="mt-8 pt-8 border-t border-cream-200">
              <h3 className="font-display text-xl text-charcoal mb-4">Customer Reviews</h3>
              <div className="space-y-4">
                {approvedReviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="pb-4 border-b border-cream-200 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={12} className={star <= review.rating ? 'fill-gold text-gold' : 'fill-cream-300 text-cream-300'} />
                        ))}
                      </div>
                      <span className="text-xs font-medium text-charcoal">{review.customer_name}</span>
                      {review.is_verified && (
                        <Badge variant="success" className="text-2xs py-0">Verified</Badge>
                      )}
                    </div>
                    {review.title && <p className="text-sm font-medium text-charcoal mb-1">{review.title}</p>}
                    {review.body && <p className="text-xs text-charcoal/60 leading-relaxed">{review.body}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
