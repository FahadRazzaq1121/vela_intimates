'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { Plus, Edit, Trash2, Check, X, Upload, Star } from 'lucide-react'
import toast from 'react-hot-toast'

interface Testimonial {
  id: string
  customer_name: string
  customer_image_url: string | null
  quote: string
  rating: number
  product_name: string | null
  location: string | null
  is_active: boolean
  sort_order: number
}

type TestimonialForm = Omit<Testimonial, 'id'>

const emptyForm = (): TestimonialForm => ({
  customer_name: '',
  customer_image_url: null,
  quote: '',
  rating: 5,
  product_name: null,
  location: null,
  is_active: true,
  sort_order: 0,
})

export default function TestimonialsManager() {
  const queryClient = useQueryClient()
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [form, setForm] = useState<TestimonialForm>(emptyForm())
  const [uploadingImage, setUploadingImage] = useState(false)

  const { data: testimonials = [], isLoading } = useQuery<Testimonial[]>({
    queryKey: ['admin-testimonials'],
    queryFn: async () => {
      const res = await fetch('/api/admin/testimonials')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: TestimonialForm) => {
      const res = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] })
      toast.success('Testimonial created')
      setCreating(false)
      setForm(emptyForm())
    },
    onError: () => toast.error('Failed to create testimonial'),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Testimonial> }) => {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] })
      toast.success('Testimonial updated')
      setEditing(null)
    },
    onError: () => toast.error('Failed to update testimonial'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] })
      toast.success('Testimonial deleted')
    },
    onError: () => toast.error('Failed to delete'),
  })

  const uploadImage = async (file: File, target: 'form' | 'edit') => {
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'testimonial-images')
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (target === 'form') setForm((prev) => ({ ...prev, customer_image_url: data.url }))
      else if (editing) setEditing((prev) => prev ? { ...prev, customer_image_url: data.url } : prev)
      toast.success('Image uploaded')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploadingImage(false)
    }
  }

  const activeForm = editing ? editing : form
  const setActiveForm = editing
    ? (updates: Partial<TestimonialForm>) => setEditing((prev) => prev ? { ...prev, ...updates } : prev)
    : (updates: Partial<TestimonialForm>) => setForm((prev) => ({ ...prev, ...updates }))

  const FormFields = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="label-luxury">Customer Name *</label>
        <input value={activeForm.customer_name} onChange={(e) => setActiveForm({ customer_name: e.target.value })} className="input-luxury" placeholder="e.g. Sophie M." />
      </div>
      <div>
        <label className="label-luxury">Location</label>
        <input value={activeForm.location || ''} onChange={(e) => setActiveForm({ location: e.target.value || null })} className="input-luxury" placeholder="e.g. New York, USA" />
      </div>
      <div className="sm:col-span-2">
        <label className="label-luxury">Quote *</label>
        <textarea value={activeForm.quote} onChange={(e) => setActiveForm({ quote: e.target.value })} rows={3} className="input-luxury resize-none" placeholder="Customer testimonial..." />
      </div>
      <div>
        <label className="label-luxury">Product Name</label>
        <input value={activeForm.product_name || ''} onChange={(e) => setActiveForm({ product_name: e.target.value || null })} className="input-luxury" placeholder="e.g. Silk & Lace Set" />
      </div>
      <div>
        <label className="label-luxury">Rating</label>
        <div className="flex items-center gap-1 mt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button" onClick={() => setActiveForm({ rating: star })} className="focus:outline-none">
              <Star size={20} className={star <= activeForm.rating ? 'fill-gold text-gold' : 'text-gray-300'} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label-luxury">Customer Photo</label>
        <div className="flex items-center gap-3 mt-1">
          {activeForm.customer_image_url && (
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
              <Image src={activeForm.customer_image_url} alt="Preview" fill className="object-cover" sizes="48px" />
            </div>
          )}
          <label className={`btn-secondary text-xs px-3 py-2 cursor-pointer flex items-center gap-1 ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
            <Upload size={14} />
            {uploadingImage ? 'Uploading…' : 'Upload Photo'}
            <input type="file" accept="image/*" className="hidden" disabled={uploadingImage}
              onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], editing ? 'edit' : 'form')} />
          </label>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="label-luxury">Sort Order</label>
          <input type="number" min="0" value={activeForm.sort_order} onChange={(e) => setActiveForm({ sort_order: parseInt(e.target.value) || 0 })} className="input-luxury" />
        </div>
        <div>
          <label className="label-luxury">Status</label>
          <select value={activeForm.is_active ? 'true' : 'false'} onChange={(e) => setActiveForm({ is_active: e.target.value === 'true' })} className="input-luxury">
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => { setCreating(true); setEditing(null) }} className="btn-rose text-xs px-5 py-2.5 flex items-center gap-2">
          <Plus size={14} /> Add Testimonial
        </button>
      </div>

      {/* Create Form */}
      {creating && (
        <div className="admin-card border-2 border-blush-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">New Testimonial</h3>
          <FormFields />
          <div className="flex gap-3 mt-4">
            <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending || !form.customer_name || !form.quote}
              className="btn-primary text-xs px-5 py-2.5 flex items-center gap-2 disabled:opacity-50">
              <Check size={14} /> Create
            </button>
            <button onClick={() => { setCreating(false); setForm(emptyForm()) }} className="btn-secondary text-xs px-5 py-2.5">Cancel</button>
          </div>
        </div>
      )}

      {/* Edit Form */}
      {editing && (
        <div className="admin-card border-2 border-amber-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Edit Testimonial</h3>
          <FormFields />
          <div className="flex gap-3 mt-4">
            <button onClick={() => updateMutation.mutate({ id: editing.id, data: editing })} disabled={updateMutation.isPending}
              className="btn-primary text-xs px-5 py-2.5 flex items-center gap-2 disabled:opacity-50">
              <Check size={14} /> Save Changes
            </button>
            <button onClick={() => setEditing(null)} className="btn-secondary text-xs px-5 py-2.5">Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="admin-card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Customer', 'Quote', 'Rating', 'Product', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              : testimonials.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {t.customer_image_url ? (
                          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                            <Image src={t.customer_image_url} alt={t.customer_name} fill className="object-cover" sizes="32px" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blush-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-blush-600">{t.customer_name[0]}</span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-800 text-xs">{t.customer_name}</p>
                          {t.location && <p className="text-gray-400 text-xs">{t.location}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-xs text-gray-600 truncate">{t.quote}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} size={10} className={s <= t.rating ? 'fill-gold text-gold' : 'text-gray-200 fill-gray-200'} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{t.product_name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${t.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {t.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditing(t); setCreating(false) }}
                          className="p-1.5 text-gray-400 hover:text-blush-600 hover:bg-blush-50 rounded transition-colors">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => confirm(`Delete testimonial from "${t.customer_name}"?`) && deleteMutation.mutate(t.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            {!isLoading && testimonials.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">No testimonials yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
