import CartClient from '@/components/store/CartClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your Bag',
  description: 'Review your Vela Intimates shopping bag.',
}

export default function CartPage() {
  return <CartClient />
}
