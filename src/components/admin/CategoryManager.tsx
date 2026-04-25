'use client'

import { useState } from 'react'
import { Category } from '@/types'
import { Plus, Edit, Trash2, Check, X, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface EditState {
  id: string
  name: string
  description: string
  image_url: string
  is_active: boolean
  sort_order: number
}

export default function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories)
  const [editing, setEditing] = useState<EditState | null>(null)
  const [creating, setCreating] = useState(false)
  const [newCat, setNewCat] = useState({ name: '', description: '', image_url: '', is_active: true, sort_order: 0 })
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const uploadImage = async (file: File, target: 'new' | 'edit') => {
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'category-images')
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (target === 'new') {
        setNewCat((prev) => ({ ...prev, image_url: data.url }))
      } else {
        setEditing((prev) => prev ? { ...prev, image_url: data.url } : prev)
      }
      toast.success('Image uploaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleCreate = async () => {
    if (!newCat.name.trim()) { toast.error('Name is required'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCat),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCategories([...categories, data.category])
      setCreating(false)
      setNewCat({ name: '', description: '', image_url: '', is_active: true, sort_order: 0 })
      toast.success('Category created')
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
      const res = await fetch(`/api/admin/categories/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCategories(categories.map((c) => c.id === editing.id ? data.category : c))
      setEditing(null)
      toast.success('Category updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? Products in this category will be unassigned.`)) return
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setCategories(categories.filter((c) => c.id !== id))
      toast.success('Category deleted')
    } catch {
      toast.error('Failed to delete category')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setCreating(true)} className="btn-rose text-xs px-5 py-2.5 flex items-center gap-2">
          <Plus size={14} />
          Add Category
        </button>
      </div>

      {/* Create Form */}
      {creating && (
        <div className="admin-card border-2 border-blush-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">New Category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-luxury">Name *</label>
              <input value={newCat.name} onChange={(e) => setNewCat({ ...newCat, name: e.target.value })} className="input-luxury" placeholder="e.g. Bras" />
            </div>
            <div>
              <label className="label-luxury">Image</label>
              <div className="flex gap-2">
                <input
                  value={newCat.image_url}
                  onChange={(e) => setNewCat({ ...newCat, image_url: e.target.value })}
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
                    onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], 'new')}
                  />
                </label>
              </div>
              {newCat.image_url && (
                <div className="mt-2 relative w-16 h-16 bg-gray-100 rounded overflow-hidden">
                  <Image src={newCat.image_url} alt="Preview" fill className="object-cover" sizes="64px" />
                </div>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="label-luxury">Description</label>
              <input value={newCat.description} onChange={(e) => setNewCat({ ...newCat, description: e.target.value })} className="input-luxury" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleCreate} disabled={loading} className="btn-primary text-xs px-5 py-2.5 flex items-center gap-2">
              <Check size={14} />
              Create
            </button>
            <button onClick={() => setCreating(false)} className="btn-secondary text-xs px-5 py-2.5">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Categories Table */}
      <div className="admin-card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Image', 'Name', 'Slug', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  {editing?.id === cat.id ? (
                    <div className="space-y-1.5">
                      {editing.image_url && (
                        <div className="relative w-12 h-12 bg-gray-100 overflow-hidden rounded">
                          <Image src={editing.image_url} alt={editing.name} fill className="object-cover" sizes="48px" />
                        </div>
                      )}
                      <label className={`btn-secondary text-xs px-2 py-1 cursor-pointer flex items-center gap-1 w-fit ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                        <Upload size={12} />
                        {uploadingImage ? '…' : 'Upload'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingImage}
                          onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], 'edit')}
                        />
                      </label>
                      <input
                        value={editing.image_url}
                        onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
                        className="input-luxury text-xs w-36"
                        placeholder="or paste URL"
                      />
                    </div>
                  ) : cat.image_url ? (
                    <div className="relative w-12 h-12 bg-gray-100 overflow-hidden rounded">
                      <Image src={cat.image_url} alt={cat.name} fill className="object-cover" sizes="48px" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded" />
                  )}
                </td>
                <td className="px-4 py-3">
                  {editing?.id === cat.id ? (
                    <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="input-luxury text-xs" />
                  ) : (
                    <span className="font-medium text-gray-800 text-xs">{cat.name}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-gray-400 font-mono">{cat.slug}</td>
                <td className="px-4 py-3">
                  {editing?.id === cat.id ? (
                    <select value={editing.is_active ? 'true' : 'false'} onChange={(e) => setEditing({ ...editing, is_active: e.target.value === 'true' })} className="input-luxury text-xs py-1">
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  ) : (
                    <span className={`badge text-xs ${cat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {cat.is_active ? 'Active' : 'Inactive'}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {editing?.id === cat.id ? (
                      <>
                        <button onClick={handleUpdate} disabled={loading} className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors">
                          <Check size={14} />
                        </button>
                        <button onClick={() => setEditing(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors">
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditing({ id: cat.id, name: cat.name, description: cat.description || '', image_url: cat.image_url || '', is_active: cat.is_active, sort_order: cat.sort_order })} className="p-1.5 text-gray-400 hover:text-blush-600 hover:bg-blush-50 rounded transition-colors">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-sm">
                  No categories yet. <button onClick={() => setCreating(true)} className="text-blush-600 hover:underline">Add one</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
