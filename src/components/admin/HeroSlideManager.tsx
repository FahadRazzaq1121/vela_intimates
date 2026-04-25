'use client'

import { useState } from 'react'
import { HeroSlide } from '@/types'
import { Plus, Edit, Trash2, Check, X, Upload, GripVertical } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

function isAbsoluteUrl(url: string): boolean {
  try { return Boolean(new URL(url)) } catch { return false }
}

type SlideForm = {
  image_url: string
  tag: string
  title: string
  subtitle: string
  cta_text: string
  cta_href: string
  cta_secondary_text: string
  cta_secondary_href: string
  align: 'left' | 'center' | 'right'
  is_active: boolean
  sort_order: number
}

const emptyForm = (): SlideForm => ({
  image_url: '', tag: '', title: '', subtitle: '',
  cta_text: '', cta_href: '', cta_secondary_text: '', cta_secondary_href: '',
  align: 'left', is_active: true, sort_order: 0,
})

export default function HeroSlideManager({ initialSlides }: { initialSlides: HeroSlide[] }) {
  const [slides, setSlides] = useState(initialSlides)
  const [creating, setCreating] = useState(false)
  const [newSlide, setNewSlide] = useState<SlideForm>(emptyForm())
  const [editing, setEditing] = useState<(SlideForm & { id: string }) | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const uploadImage = async (file: File, target: 'new' | 'edit') => {
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'hero-images')
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (target === 'new') setNewSlide((prev) => ({ ...prev, image_url: data.url }))
      else setEditing((prev) => prev ? { ...prev, image_url: data.url } : prev)
      toast.success('Image uploaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleCreate = async () => {
    if (!newSlide.title.trim()) { toast.error('Title is required'); return }
    if (!newSlide.image_url.trim()) { toast.error('Image is required'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/hero-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSlide),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSlides([...slides, data.slide])
      setCreating(false)
      setNewSlide(emptyForm())
      toast.success('Slide created')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!editing) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/hero-slides/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSlides(slides.map((s) => s.id === editing.id ? data.slide : s))
      setEditing(null)
      toast.success('Slide updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this slide?')) return
    try {
      const res = await fetch(`/api/admin/hero-slides/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      setSlides(slides.filter((s) => s.id !== id))
      toast.success('Slide deleted')
    } catch {
      toast.error('Failed to delete slide')
    }
  }

  const startEdit = (slide: HeroSlide) => {
    setEditing({
      id: slide.id,
      image_url: slide.image_url,
      tag: slide.tag || '',
      title: slide.title,
      subtitle: slide.subtitle || '',
      cta_text: slide.cta_text || '',
      cta_href: slide.cta_href || '',
      cta_secondary_text: slide.cta_secondary_text || '',
      cta_secondary_href: slide.cta_secondary_href || '',
      align: slide.align,
      is_active: slide.is_active,
      sort_order: slide.sort_order,
    })
  }

  const SlideFormFields = ({
    form,
    onChange,
    target,
  }: {
    form: SlideForm
    onChange: (updates: Partial<SlideForm>) => void
    target: 'new' | 'edit'
  }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Image */}
      <div className="sm:col-span-2">
        <label className="label-luxury">Image *</label>
        <div className="flex gap-2">
          <input
            value={form.image_url}
            onChange={(e) => onChange({ image_url: e.target.value })}
            className="input-luxury flex-1"
            placeholder="https://... or upload"
          />
          <label className={`btn-secondary text-xs px-3 py-2 cursor-pointer flex items-center gap-1 whitespace-nowrap ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
            <Upload size={14} />
            {uploadingImage ? 'Uploading…' : 'Upload'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploadingImage}
              onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], target)}
            />
          </label>
        </div>
        {isAbsoluteUrl(form.image_url) && (
          <div className="mt-2 relative w-full h-32 bg-gray-100 rounded overflow-hidden">
            <Image src={form.image_url} alt="Preview" fill className="object-cover" sizes="600px" />
          </div>
        )}
      </div>

      {/* Tag */}
      <div>
        <label className="label-luxury">Tag</label>
        <input value={form.tag} onChange={(e) => onChange({ tag: e.target.value })} className="input-luxury" placeholder="e.g. New Collection" />
      </div>

      {/* Title */}
      <div>
        <label className="label-luxury">Title *</label>
        <input value={form.title} onChange={(e) => onChange({ title: e.target.value })} className="input-luxury" placeholder="e.g. Wear Your Confidence" />
      </div>

      {/* Subtitle */}
      <div className="sm:col-span-2">
        <label className="label-luxury">Subtitle</label>
        <input value={form.subtitle} onChange={(e) => onChange({ subtitle: e.target.value })} className="input-luxury" placeholder="Short description shown below the title" />
      </div>

      {/* CTA Primary */}
      <div>
        <label className="label-luxury">Button Text</label>
        <input value={form.cta_text} onChange={(e) => onChange({ cta_text: e.target.value })} className="input-luxury" placeholder="e.g. Shop Now" />
      </div>
      <div>
        <label className="label-luxury">Button Link</label>
        <input value={form.cta_href} onChange={(e) => onChange({ cta_href: e.target.value })} className="input-luxury" placeholder="/shop" />
      </div>

      {/* CTA Secondary */}
      <div>
        <label className="label-luxury">Secondary Button Text</label>
        <input value={form.cta_secondary_text} onChange={(e) => onChange({ cta_secondary_text: e.target.value })} className="input-luxury" placeholder="e.g. View Lookbook" />
      </div>
      <div>
        <label className="label-luxury">Secondary Button Link</label>
        <input value={form.cta_secondary_href} onChange={(e) => onChange({ cta_secondary_href: e.target.value })} className="input-luxury" placeholder="/shop?filter=new" />
      </div>

      {/* Align + Status + Order */}
      <div>
        <label className="label-luxury">Text Alignment</label>
        <select value={form.align} onChange={(e) => onChange({ align: e.target.value as 'left' | 'center' | 'right' })} className="input-luxury">
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="label-luxury">Status</label>
          <select value={form.is_active ? 'true' : 'false'} onChange={(e) => onChange({ is_active: e.target.value === 'true' })} className="input-luxury">
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <div className="w-24">
          <label className="label-luxury">Order</label>
          <input type="number" min="0" value={form.sort_order} onChange={(e) => onChange({ sort_order: parseInt(e.target.value) || 0 })} className="input-luxury" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setCreating(true); setEditing(null) }} className="btn-rose text-xs px-5 py-2.5 flex items-center gap-2">
          <Plus size={14} />
          Add Slide
        </button>
      </div>

      {/* Create Form */}
      {creating && (
        <div className="admin-card border-2 border-blush-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">New Slide</h3>
          <SlideFormFields
            form={newSlide}
            onChange={(updates) => setNewSlide((prev) => ({ ...prev, ...updates }))}
            target="new"
          />
          <div className="flex gap-3 mt-4">
            <button onClick={handleCreate} disabled={loading} className="btn-primary text-xs px-5 py-2.5 flex items-center gap-2">
              <Check size={14} />
              Create
            </button>
            <button onClick={() => { setCreating(false); setNewSlide(emptyForm()) }} className="btn-secondary text-xs px-5 py-2.5">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit Form */}
      {editing && (
        <div className="admin-card border-2 border-amber-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Edit Slide</h3>
          <SlideFormFields
            form={editing}
            onChange={(updates) => setEditing((prev) => prev ? { ...prev, ...updates } : prev)}
            target="edit"
          />
          <div className="flex gap-3 mt-4">
            <button onClick={handleUpdate} disabled={loading} className="btn-primary text-xs px-5 py-2.5 flex items-center gap-2">
              <Check size={14} />
              Save Changes
            </button>
            <button onClick={() => setEditing(null)} className="btn-secondary text-xs px-5 py-2.5">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Slides List */}
      <div className="space-y-3">
        {slides.length === 0 && (
          <div className="admin-card text-center text-gray-400 text-sm py-12">
            No slides yet. <button onClick={() => setCreating(true)} className="text-blush-600 hover:underline">Add one</button>
          </div>
        )}
        {slides.map((slide, i) => (
          <div key={slide.id} className="admin-card flex items-start gap-4">
            {/* Sort indicator */}
            <div className="flex-shrink-0 flex flex-col items-center gap-1 text-gray-300 pt-1">
              <GripVertical size={16} />
              <span className="text-xs font-mono">{slide.sort_order}</span>
            </div>

            {/* Image preview */}
            <div className="flex-shrink-0 relative w-24 h-16 bg-gray-100 rounded overflow-hidden">
              <Image src={slide.image_url} alt={slide.title} fill className="object-cover" sizes="96px" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {slide.tag && (
                  <span className="text-2xs uppercase tracking-widest text-blush-500 font-medium">{slide.tag}</span>
                )}
                <span className={`badge text-xs ${slide.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {slide.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className="text-xs text-gray-400">Align: {slide.align}</span>
              </div>
              <p className="font-medium text-gray-800 text-sm mt-0.5 truncate">{slide.title}</p>
              {slide.subtitle && (
                <p className="text-xs text-gray-400 truncate mt-0.5">{slide.subtitle}</p>
              )}
              <div className="flex gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                {slide.cta_text && <span>CTA: <span className="text-gray-600">{slide.cta_text}</span> → {slide.cta_href}</span>}
                {slide.cta_secondary_text && <span>2nd: <span className="text-gray-600">{slide.cta_secondary_text}</span></span>}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => { startEdit(slide); setCreating(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                className="p-1.5 text-gray-400 hover:text-blush-600 hover:bg-blush-50 rounded transition-colors"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={() => handleDelete(slide.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center">
        Slides display in order of the <strong>Order</strong> number. Lower = first.
      </p>
    </div>
  )
}
