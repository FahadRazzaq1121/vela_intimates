'use client'

import dynamic from 'next/dynamic'

const CheckoutForm = dynamic(() => import('./CheckoutForm'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-cream-300 border-t-blush-500 rounded-full animate-spin" />
    </div>
  ),
})

export default function CheckoutClient() {
  return <CheckoutForm />
}
