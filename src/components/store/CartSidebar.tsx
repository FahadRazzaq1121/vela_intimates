'use client'

import { useCart } from '@/contexts/CartContext'
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

export default function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, itemCount } = useCart()

  const FREE_SHIPPING_THRESHOLD = 75
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal
  const freeShippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
          onClick={closeCart}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-cream-50 z-[70] flex flex-col shadow-luxury-lg transition-transform duration-400 ease-in-out ${isOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-cream-200">
          <div className="flex items-center gap-3">
            <ShoppingBag size={18} className="text-charcoal" />
            <span className="font-medium text-sm uppercase tracking-widest">
              Your Bag ({itemCount})
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-2 text-charcoal hover:text-blush-600 transition-colors"
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </div>

        {/* Free shipping progress */}
        {subtotal > 0 && (
          <div className="px-6 py-3 bg-cream-100 border-b border-cream-200">
            {remaining > 0 ? (
              <p className="text-xs text-charcoal/70 mb-2">
                Add <span className="font-medium text-charcoal">{formatPrice(remaining)}</span> more for free shipping
              </p>
            ) : (
              <p className="text-xs text-blush-600 font-medium mb-2">🎉 You've unlocked free shipping!</p>
            )}
            <div className="h-1 bg-cream-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blush-500 transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <ShoppingBag size={48} className="text-cream-300 mb-4" />
              <p className="font-display text-xl text-charcoal/50 mb-2">Your bag is empty</p>
              <p className="text-sm text-charcoal/40 mb-6">Discover our luxurious collection</p>
              <button onClick={closeCart} className="btn-primary text-xs px-6 py-3">
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => {
              const price = item.sale_price ?? item.price
              return (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-cream-200 last:border-0">
                  <div className="relative w-20 h-24 flex-shrink-0 bg-cream-100 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2 mb-1">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={closeCart}
                        className="text-sm font-medium text-charcoal hover:text-blush-600 line-clamp-2 leading-tight transition-colors"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="flex-shrink-0 text-charcoal/30 hover:text-red-500 transition-colors p-0.5"
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      {item.size && (
                        <span className="text-xs text-charcoal/50 uppercase">
                          Size: {item.size}
                        </span>
                      )}
                      {item.color && (
                        <span className="text-xs text-charcoal/50">· {item.color}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-cream-300 bg-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{ touchAction: 'manipulation' }}
                          className="w-11 h-11 flex items-center justify-center text-charcoal hover:text-blush-600 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2 text-xs font-medium min-w-[28px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock_quantity}
                          style={{ touchAction: 'manipulation' }}
                          className="w-11 h-11 flex items-center justify-center text-charcoal hover:text-blush-600 disabled:opacity-30 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-medium text-charcoal">
                          {formatPrice(price * item.quantity)}
                        </p>
                        {item.sale_price && (
                          <p className="text-xs text-charcoal/40 line-through">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-6 border-t border-cream-200 space-y-4 bg-cream-50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-charcoal/70 uppercase tracking-wider">Subtotal</span>
              <span className="font-medium text-charcoal">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-charcoal/50">
              Shipping and taxes calculated at checkout
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full btn-primary text-center"
            >
              Proceed to Checkout
            </Link>
            <Link
              href="/cart"
              onClick={closeCart}
              className="block w-full btn-secondary text-center text-xs"
            >
              View Cart
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
