'use client'

import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { formatPrice, COUNTRIES } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { Shield, Truck, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface FormData {
  full_name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  postal_code: string
  notes: string
  payment_method: 'cod' | 'manual'
  coupon_code: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const [form, setForm] = useState<FormData>({
    full_name: '', email: '', phone: '', address: '',
    city: '', country: 'United States', postal_code: '',
    notes: '', payment_method: 'cod', coupon_code: '',
  })
  const [couponStatus, setCouponStatus] = useState<'idle' | 'valid' | 'invalid'>('idle')
  const [discount, setDiscount] = useState(0)
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData>>({})

  const FREE_SHIPPING_THRESHOLD = 75
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 8

  const discountAmount = discountType === 'percentage'
    ? (subtotal * discount) / 100
    : Math.min(discount, subtotal)

  const total = subtotal + shippingFee - discountAmount

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateCoupon = async () => {
    if (!form.coupon_code.trim()) return
    try {
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(form.coupon_code)}&orderTotal=${subtotal}`)
      const data = await res.json()
      if (data.valid) {
        setCouponStatus('valid')
        setDiscount(data.discount_value)
        setDiscountType(data.discount_type)
      } else {
        setCouponStatus('invalid')
        setDiscount(0)
      }
    } catch {
      setCouponStatus('invalid')
    }
  }

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {}
    if (!form.full_name.trim()) newErrors.full_name = 'Name is required'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Valid email required'
    if (!form.phone.trim()) newErrors.phone = 'Phone is required'
    if (!form.address.trim()) newErrors.address = 'Address is required'
    if (!form.city.trim()) newErrors.city = 'City is required'
    if (!form.country.trim()) newErrors.country = 'Country is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    if (items.length === 0) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: items.map((item) => ({
            product_id: item.product_id,
            product_name: item.name,
            product_sku: null,
            product_image: item.image,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            unit_price: item.sale_price ?? item.price,
            total_price: (item.sale_price ?? item.price) * item.quantity,
          })),
          subtotal,
          discount_amount: discountAmount,
          shipping_fee: shippingFee,
          total,
          coupon_code: couponStatus === 'valid' ? form.coupon_code : null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Order failed')
      }

      clearCart()
      router.push(`/order-confirmed?order=${data.order_number}&email=${encodeURIComponent(form.email)}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
        <p className="font-display text-2xl text-charcoal/40 mb-4">Your cart is empty</p>
        <Link href="/shop" className="btn-primary">Shop Now</Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Header */}
      <div className="flex items-center gap-2 mb-8">
        <Link href="/" className="font-display text-lg tracking-wider text-charcoal">Vela Intimates</Link>
        <ChevronRight size={14} className="text-charcoal/30" />
        <span className="text-sm text-charcoal/50">Checkout</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Form */}
          <div className="lg:col-span-3 space-y-8">
            {/* Contact */}
            <div>
              <h2 className="font-display text-xl text-charcoal mb-5">Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label-luxury">Full Name *</label>
                  <input name="full_name" value={form.full_name} onChange={handleChange} className={`input-luxury ${errors.full_name ? 'border-red-400' : ''}`} placeholder="Jane Smith" />
                  {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>}
                </div>
                <div>
                  <label className="label-luxury">Email Address *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} className={`input-luxury ${errors.email ? 'border-red-400' : ''}`} placeholder="jane@example.com" />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="label-luxury">Phone Number *</label>
                  <input name="phone" type="tel" value={form.phone} onChange={handleChange} className={`input-luxury ${errors.phone ? 'border-red-400' : ''}`} placeholder="+1 234 567 8900" />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div>
              <h2 className="font-display text-xl text-charcoal mb-5">Shipping Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label-luxury">Street Address *</label>
                  <input name="address" value={form.address} onChange={handleChange} className={`input-luxury ${errors.address ? 'border-red-400' : ''}`} placeholder="123 Luxury Lane, Apt 4B" />
                  {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                </div>
                <div>
                  <label className="label-luxury">City *</label>
                  <input name="city" value={form.city} onChange={handleChange} className={`input-luxury ${errors.city ? 'border-red-400' : ''}`} placeholder="New York" />
                  {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="label-luxury">Postal Code</label>
                  <input name="postal_code" value={form.postal_code} onChange={handleChange} className="input-luxury" placeholder="10001" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label-luxury">Country *</label>
                  <select name="country" value={form.country} onChange={handleChange} className={`input-luxury ${errors.country ? 'border-red-400' : ''}`}>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="label-luxury">Order Notes (Optional)</label>
                  <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="input-luxury resize-none" placeholder="Special instructions, delivery preferences..." />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div>
              <h2 className="font-display text-xl text-charcoal mb-5">Payment Method</h2>
              <div className="space-y-3">
                {[
                  { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives at your door' },
                  { value: 'manual', label: 'Bank Transfer / Manual Payment', desc: 'We will send you payment details via email' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-4 p-4 border cursor-pointer transition-all duration-200 ${form.payment_method === opt.value ? 'border-charcoal bg-cream-100' : 'border-cream-200 hover:border-cream-300'}`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={opt.value}
                      checked={form.payment_method === opt.value}
                      onChange={handleChange}
                      className="mt-0.5 accent-blush-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-charcoal">{opt.label}</p>
                      <p className="text-xs text-charcoal/50 mt-0.5">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-cream-50 p-6 sticky top-24">
              <h2 className="font-display text-xl text-charcoal mb-6">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {items.map((item) => {
                  const price = item.sale_price ?? item.price
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-12 h-16 flex-shrink-0 bg-cream-200 overflow-hidden">
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                        <span className="absolute -top-1 -right-1 bg-charcoal text-cream-50 text-[10px] w-4 h-4 flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-charcoal truncate">{item.name}</p>
                        {item.size && <p className="text-2xs text-charcoal/40">Size: {item.size}</p>}
                        <p className="text-xs text-charcoal/60 mt-1">{formatPrice(price * item.quantity)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Coupon */}
              <div className="border-t border-cream-200 pt-4 mb-4">
                <label className="label-luxury">Coupon Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.coupon_code}
                    onChange={(e) => { setForm((p) => ({ ...p, coupon_code: e.target.value.toUpperCase() })); setCouponStatus('idle') }}
                    className={`flex-1 input-luxury text-xs ${couponStatus === 'valid' ? 'border-green-400' : couponStatus === 'invalid' ? 'border-red-400' : ''}`}
                    placeholder="WELCOME10"
                  />
                  <button type="button" onClick={validateCoupon} className="px-4 bg-charcoal text-cream-50 text-xs hover:bg-blush-600 transition-colors">
                    Apply
                  </button>
                </div>
                {couponStatus === 'valid' && <p className="text-xs text-green-600 mt-1">✓ Coupon applied!</p>}
                {couponStatus === 'invalid' && <p className="text-xs text-red-500 mt-1">Invalid or expired coupon</p>}
              </div>

              {/* Totals */}
              <div className="border-t border-cream-200 pt-4 space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal/60">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal/60">Shipping</span>
                  <span className={shippingFee === 0 ? 'text-green-600' : ''}>
                    {shippingFee === 0 ? 'Free' : formatPrice(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between font-medium text-base pt-2 border-t border-cream-200">
                  <span>Total</span>
                  <span className="font-display text-lg">{formatPrice(total)}</span>
                </div>
              </div>

              <Button type="submit" loading={submitting} className="w-full" size="lg">
                <Shield size={14} />
                Place Order
              </Button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-charcoal/40">
                <Truck size={12} />
                <span>
                  {shippingFee === 0 ? 'Free shipping on this order' : `+${formatPrice(shippingFee)} shipping`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
