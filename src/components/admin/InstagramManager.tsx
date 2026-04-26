'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { Plus, Trash2, Upload, Eye, EyeOff, Check, X, Edit } from 'lucide-react'
import toast from 'react-hot-toast'

interface InstagramPost {
  id: string
  image_url: string
  post_url: string | null
  caption: string | null
  is_active: boolean
  sort_order: number
}

type PostForm = Omit<InstagramPost, 'id'>

const emptyForm = (): PostForm => ({
  image_url: '',
  post_url: null,
  caption: null,
  is_active: true,
  sort_order: 0,
})

export default function InstagramManager() {
  const queryClient = useQueryClient()
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<InstagramPost | null>(null)
  const [form, setForm] = useState<PostForm>(emptyForm())
  const [uploadingImage, setUploadingImage] = useState(false)

  const { data: posts = [], isLoading } = useQuery<InstagramPost[]>({
    queryKey: ['admin-instagram'],
    queryFn: async () => {
      const res = await fetch('/api/admin/instagram')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: PostForm) => {
      const res = await fetch('/api/admin/instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-instagram'] })
      toast.success('Post added')
      setCreating(false)
      setForm(emptyForm())
    },
    onError: () => toast.error('Failed to add post'),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InstagramPost> }) => {
      const res = await fetch(`/api/admin/instagram/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-instagram'] })
      toast.success('Post updated')
      setEditing(null)
    },
    onError: () => toast.error('Failed to update'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/instagram/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-instagram'] })
      toast.success('Post removed')
    },
    onError: () => toast.error('Failed to delete'),
  })

  const uploadImage = async (file: File, target: 'form' | 'edit') => {
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'instagram-images')
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (target === 'form') setForm((prev) => ({ ...prev, image_url: data.url }))
      else if (editing) setEditing((prev) => prev ? { ...prev, image_url: data.url } : prev)
      toast.success('Image uploaded')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploadingImage(false)
    }
  }

  const activeForm = editing ?? form
  const setActiveForm = editing
    ? (u: Partial<PostForm>) => setEditing((p) => p ? { ...p, ...u } : p)
    : (u: Partial<PostForm>) => setForm((p) => ({ ...p, ...u }))

  const FormFields = () => (
    <div className="space-y-4">
      {/* Image upload */}
      <div>
        <label className="label-luxury">Photo *</label>
        <div className="flex items-start gap-4 mt-1">
          {activeForm.image_url && (
            <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded bg-gray-100">
              <Image src={activeForm.image_url} alt="Preview" fill className="object-cover" sizes="80px" />
            </div>
          )}
          <div className="space-y-2">
            <label className={`btn-secondary text-xs px-3 py-2 cursor-pointer flex items-center gap-1 w-fit ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
              <Upload size={14} />
              {uploadingImage ? 'Uploading…' : 'Upload Photo'}
              <input type="file" accept="image/*" className="hidden" disabled={uploadingImage}
                onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], editing ? 'edit' : 'form')} />
            </label>
            <p className="text-xs text-gray-400">Upload the photo from your Instagram post</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label-luxury">Instagram Post URL</label>
          <input
            value={activeForm.post_url || ''}
            onChange={(e) => setActiveForm({ post_url: e.target.value || null })}
            className="input-luxury"
            placeholder="https://instagram.com/p/..."
          />
          <p className="text-xs text-gray-400 mt-1">Link users to the actual post when clicked</p>
        </div>
        <div>
          <label className="label-luxury">Caption (optional)</label>
          <input
            value={activeForm.caption || ''}
            onChange={(e) => setActiveForm({ caption: e.target.value || null })}
            className="input-luxury"
            placeholder="Short caption or alt text"
          />
        </div>
        <div>
          <label className="label-luxury">Sort Order</label>
          <input
            type="number" min="0"
            value={activeForm.sort_order}
            onChange={(e) => setActiveForm({ sort_order: parseInt(e.target.value) || 0 })}
            className="input-luxury"
          />
        </div>
        <div>
          <label className="label-luxury">Visibility</label>
          <select
            value={activeForm.is_active ? 'true' : 'false'}
            onChange={(e) => setActiveForm({ is_active: e.target.value === 'true' })}
            className="input-luxury"
          >
            <option value="true">Visible</option>
            <option value="false">Hidden</option>
          </select>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">Upload your Instagram photos and optionally link each to the original post. Max 6 shown on homepage.</p>
        <button onClick={() => { setCreating(true); setEditing(null) }} className="btn-rose text-xs px-5 py-2.5 flex items-center gap-2 whitespace-nowrap">
          <Plus size={14} /> Add Post
        </button>
      </div>

      {/* Create Form */}
      {creating && (
        <div className="admin-card border-2 border-blush-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">New Instagram Post</h3>
          <FormFields />
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => createMutation.mutate(form)}
              disabled={createMutation.isPending || !form.image_url}
              className="btn-primary text-xs px-5 py-2.5 flex items-center gap-2 disabled:opacity-50"
            >
              <Check size={14} /> Add Post
            </button>
            <button onClick={() => { setCreating(false); setForm(emptyForm()) }} className="btn-secondary text-xs px-5 py-2.5">Cancel</button>
          </div>
        </div>
      )}

      {/* Edit Form */}
      {editing && (
        <div className="admin-card border-2 border-amber-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Edit Post</h3>
          <FormFields />
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => updateMutation.mutate({ id: editing.id, data: editing })}
              disabled={updateMutation.isPending}
              className="btn-primary text-xs px-5 py-2.5 flex items-center gap-2 disabled:opacity-50"
            >
              <Check size={14} /> Save Changes
            </button>
            <button onClick={() => setEditing(null)} className="btn-secondary text-xs px-5 py-2.5">Cancel</button>
          </div>
        </div>
      )}

      {/* Grid of posts */}
      {isLoading ? (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="admin-card text-center py-16 text-gray-400 text-sm">
          No posts yet. Add your first Instagram photo above.
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {posts.map((post) => (
            <div key={post.id} className="relative group aspect-square bg-gray-100 rounded overflow-hidden">
              <Image src={post.image_url} alt={post.caption || 'Instagram post'} fill className="object-cover" sizes="160px" />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => { setEditing(post); setCreating(false) }}
                  className="w-8 h-8 bg-white/90 rounded flex items-center justify-center text-gray-700 hover:bg-white transition-colors"
                  title="Edit"
                >
                  <Edit size={13} />
                </button>
                <button
                  onClick={() => {
                    updateMutation.mutate({ id: post.id, data: { is_active: !post.is_active } })
                  }}
                  className="w-8 h-8 bg-white/90 rounded flex items-center justify-center text-gray-700 hover:bg-white transition-colors"
                  title={post.is_active ? 'Hide' : 'Show'}
                >
                  {post.is_active ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>
                <button
                  onClick={() => confirm('Remove this post?') && deleteMutation.mutate(post.id)}
                  className="w-8 h-8 bg-white/90 rounded flex items-center justify-center text-red-500 hover:bg-white transition-colors"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Hidden badge */}
              {!post.is_active && (
                <div className="absolute top-1 left-1 bg-black/60 text-white text-2xs px-1.5 py-0.5 rounded flex items-center gap-1">
                  <X size={9} /> Hidden
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {posts.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          Hover over a photo to edit, toggle visibility, or remove it. Up to 6 photos are shown on the homepage.
        </p>
      )}
    </div>
  )
}
