'use client'

import { useCart } from '@/contexts/CartContext'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import Button from '@/components/ui/Button'

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, itemCount } = useCart()

  const FREE_SHIPPING_THRESHOLD = 75
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 8
  const total = subtotal + shippingFee

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <ShoppingBag size={64} className="text-cream-300 mb-6" />
        <h1 className="font-display text-3xl text-charcoal/40 mb-3">Your bag is empty</h1>
        <p className="text-sm text-charcoal/30 mb-8">Add some beautiful pieces to get started</p>
        <Link href="/shop" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-16">
      <div className="flex items-center gap-4 mb-10">
        <Link href="/shop" className="flex items-center gap-2 text-xs text-charcoal/50 hover:text-charcoal transition-colors">
          <ArrowLeft size={14} />
          Continue Shopping
        </Link>
        <span className="text-cream-300">|</span>
        <h1 className="font-display text-2xl md:text-3xl font-light text-charcoal">
          Your Bag ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const price = item.sale_price ?? item.price
            return (
              <div key={item.id} className="flex gap-5 bg-cream-50 p-4">
                <div className="relative w-24 h-32 flex-shrink-0 bg-cream-100 overflow-hidden">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link href={`/products/${item.slug}`} className="font-medium text-sm text-charcoal hover:text-blush-600 transition-colors">
                          {item.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          {item.size && <span className="text-xs text-charcoal/50">Size: {item.size}</span>}
                          {item.color && <span className="text-xs text-charcoal/50">· {item.color}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-charcoal/30 hover:text-red-500 transition-colors p-1"
                        aria-label="Remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-cream-300 bg-white">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:text-blush-600 transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock_quantity}
                        className="w-8 h-8 flex items-center justify-center hover:text-blush-600 disabled:opacity-30 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="font-medium text-sm text-charcoal">{formatPrice(price * item.quantity)}</p>
                      {item.sale_price && (
                        <p className="text-xs text-charcoal/40 line-through">{formatPrice(item.price * item.quantity)}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-cream-50 p-6 sticky top-24">
            <h2 className="font-display text-xl text-charcoal mb-6">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-charcoal/60">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-charcoal/60">Shipping</span>
                <span className={shippingFee === 0 ? 'text-green-600 font-medium' : ''}>
                  {shippingFee === 0 ? 'Free' : formatPrice(shippingFee)}
                </span>
              </div>
              {shippingFee > 0 && (
                <p className="text-xs text-charcoal/40">
                  Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping
                </p>
              )}
            </div>

            <div className="border-t border-cream-200 pt-4 mb-6">
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span className="font-display text-lg">{formatPrice(total)}</span>
              </div>
              <p className="text-xs text-charcoal/40 mt-1">Taxes included where applicable</p>
            </div>

            <Link href="/checkout" className="block">
              <Button className="w-full" size="lg">
                Proceed to Checkout
              </Button>
            </Link>

            <div className="mt-4 space-y-2">
              {['Secure SSL Encryption', 'Easy 30-Day Returns', 'Cash on Delivery Available'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-charcoal/40">
                  <span className="text-green-500">✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
