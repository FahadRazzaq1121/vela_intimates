'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error()
      toast.success('Subscribed! Thank you.')
      setEmail('')
    } catch {
      toast.error('Failed to subscribe. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        className="bg-transparent border border-cream-200/20 text-cream-100 placeholder-cream-200/30 px-4 py-3 text-sm outline-none focus:border-blush-400 transition-colors"
        required
      />
      <button type="submit" disabled={loading} className="btn-rose text-xs py-3 justify-center disabled:opacity-60">
        {loading ? 'Subscribing…' : 'Subscribe'}
      </button>
    </form>
  )
}
