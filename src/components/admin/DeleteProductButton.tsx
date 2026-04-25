'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Product deleted')
      router.refresh()
    } catch {
      toast.error('Failed to delete product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded hover:bg-red-50 disabled:opacity-50"
      title="Delete product"
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin block" />
      ) : (
        <Trash2 size={14} />
      )}
    </button>
  )
}
