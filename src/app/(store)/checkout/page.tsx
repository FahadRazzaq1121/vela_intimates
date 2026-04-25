import CheckoutClient from '@/components/store/CheckoutClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your Vela Intimates order.',
}

export default function CheckoutPage() {
  return <CheckoutClient />
}
