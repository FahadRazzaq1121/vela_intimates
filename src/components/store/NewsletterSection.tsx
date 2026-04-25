'use client'

import { useState } from 'react'
import { Mail, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setMessage('Thank you for subscribing! Check your inbox for a welcome gift.')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <section className="bg-charcoal py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 border border-blush-400/40 flex items-center justify-center">
            <Mail size={20} className="text-blush-400" />
          </div>
        </div>

        <p className="section-tag text-blush-400">Newsletter</p>
        <h2 className="font-display text-3xl md:text-4xl font-light text-cream-100 mb-4">
          Join the Vela Circle
        </h2>
        <p className="text-sm text-cream-200/60 mb-8 leading-relaxed">
          Subscribe and receive 10% off your first order, plus early access to new collections, exclusive offers, and style inspiration delivered to your inbox.
        </p>

        {status === 'success' ? (
          <div className="flex items-center justify-center gap-3 text-blush-400">
            <CheckCircle size={20} />
            <p className="text-sm">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 bg-cream-100/10 border border-cream-200/20 text-cream-100 placeholder-cream-200/30 px-4 py-3 text-sm outline-none focus:border-blush-400 transition-colors"
            />
            <Button
              type="submit"
              variant="rose"
              loading={status === 'loading'}
              className="whitespace-nowrap"
            >
              Subscribe
            </Button>
          </form>
        )}

        {status === 'error' && (
          <p className="text-red-400 text-xs mt-3">{message}</p>
        )}

        <p className="text-cream-200/30 text-xs mt-4">
          No spam, ever. Unsubscribe anytime.
        </p>
      </div>
    </section>
  )
}
