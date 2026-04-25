'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Category, Product, ProductColor } from '@/types'
import Button from '@/components/ui/Button'
import { Plus, X, Upload, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface ProductFormProps {
  product?: Product
  categories: Category[]
  mode: 'create' | 'edit'
}

interface ImageEntry {
  url: string
  alt_text: string
  is_primary: boolean
}

export default function ProductForm({ product, categories, mode }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const [form, setForm] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    short_description: product?.short_description || '',
    price: product?.price?.toString() || '',
    sale_price: product?.sale_price?.toString() || '',
    sku: product?.sku || '',
    category_id: product?.category_id || '',
    stock_quantity: product?.stock_quantity?.toString() || '0',
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured ?? false,
    is_new_arrival: product?.is_new_arrival ?? false,
    is_best_seller: product?.is_best_seller ?? false,
    materials: product?.materials || '',
    care_instructions: product?.care_instructions || '',
    meta_title: product?.meta_title || '',
    meta_description: product?.meta_description || '',
  })

  const [sizes, setSizes] = useState<string[]>(product?.sizes || [])
  const [newSize, setNewSize] = useState('')
  const [colors, setColors] = useState<ProductColor[]>(product?.colors || [])
  const [newColorName, setNewColorName] = useState('')
  const [newColorHex, setNewColorHex] = useState('#F2D0D6')
  const [images, setImages] = useState<ImageEntry[]>(
    product?.images?.map((img) => ({ url: img.url, alt_text: img.alt_text || '', is_primary: img.is_primary })) || []
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const addSize = () => {
    if (newSize.trim() && !sizes.includes(newSize.trim().toUpperCase())) {
      setSizes([...sizes, newSize.trim().toUpperCase()])
      setNewSize('')
    }
  }

  const addColor = () => {
    if (newColorName.trim() && !colors.find((c) => c.name === newColorName.trim())) {
      setColors([...colors, { name: newColorName.trim(), hex: newColorHex }])
      setNewColorName('')
    }
  }

  const uploadImage = async (file: File) => {
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'product-images')

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Upload failed')

      setImages((prev) => [...prev, { url: data.url, alt_text: '', is_primary: prev.length === 0 }])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.price) {
      toast.error('Name and price are required')
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
        stock_quantity: parseInt(form.stock_quantity, 10),
        category_id: form.category_id || null,
        sizes,
        colors,
        images,
      }

      const url = mode === 'create' ? '/api/admin/products' : `/api/admin/products/${product!.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')

      toast.success(mode === 'create' ? 'Product created!' : 'Product updated!', {
        style: { background: '#2C2C2C', color: '#FAF6F1' },
      })
      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-5">
          <div className="admin-card space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Product Information</h3>
            <div>
              <label className="label-luxury">Product Name *</label>
              <input name="name" value={form.name} onChange={handleChange} required className="input-luxury" placeholder="Rose Petal Lace Bra" />
            </div>
            <div>
              <label className="label-luxury">Slug</label>
              <input name="slug" value={form.slug} onChange={handleChange} className="input-luxury font-mono text-xs" placeholder="auto-generated from name" />
            </div>
            <div>
              <label className="label-luxury">Short Description</label>
              <input name="short_description" value={form.short_description} onChange={handleChange} className="input-luxury" placeholder="Brief product description for cards" />
            </div>
            <div>
              <label className="label-luxury">Full Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={5} className="input-luxury resize-none" placeholder="Detailed product description..." />
            </div>
          </div>

          {/* Pricing */}
          <div className="admin-card space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Pricing & Inventory</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-luxury">Price *</label>
                <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required className="input-luxury" placeholder="68.00" />
              </div>
              <div>
                <label className="label-luxury">Sale Price</label>
                <input name="sale_price" type="number" step="0.01" min="0" value={form.sale_price} onChange={handleChange} className="input-luxury" placeholder="54.00" />
              </div>
              <div>
                <label className="label-luxury">SKU</label>
                <input name="sku" value={form.sku} onChange={handleChange} className="input-luxury" placeholder="VI-BRA-001" />
              </div>
              <div>
                <label className="label-luxury">Stock Quantity</label>
                <input name="stock_quantity" type="number" min="0" value={form.stock_quantity} onChange={handleChange} className="input-luxury" />
              </div>
            </div>
          </div>

          {/* Sizes */}
          <div className="admin-card space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Sizes</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {sizes.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 bg-cream-100 text-xs text-charcoal border border-cream-200">
                  {s}
                  <button type="button" onClick={() => setSizes(sizes.filter((x) => x !== s))} className="text-gray-400 hover:text-red-500">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                className="input-luxury flex-1 text-xs"
                placeholder="Add size (e.g. XS, S, M, 32B)"
              />
              <button type="button" onClick={addSize} className="px-4 bg-charcoal text-cream-50 text-xs hover:bg-blush-600 transition-colors">
                Add
              </button>
            </div>
          </div>

          {/* Colors */}
          <div className="admin-card space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Colors</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {colors.map((c) => (
                <span key={c.name} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cream-100 text-xs text-charcoal border border-cream-200">
                  <span className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: c.hex }} />
                  {c.name}
                  <button type="button" onClick={() => setColors(colors.filter((x) => x.name !== c.name))} className="text-gray-400 hover:text-red-500">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                className="input-luxury flex-1 text-xs"
                placeholder="Color name (e.g. Blush Pink)"
              />
              <input
                type="color"
                value={newColorHex}
                onChange={(e) => setNewColorHex(e.target.value)}
                className="w-12 h-10 border border-cream-200 cursor-pointer p-0.5"
                title="Pick color"
              />
              <button type="button" onClick={addColor} className="px-4 bg-charcoal text-cream-50 text-xs hover:bg-blush-600 transition-colors">
                Add
              </button>
            </div>
          </div>

          {/* Images */}
          <div className="admin-card space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Product Images</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative group aspect-[3/4] bg-gray-100 overflow-hidden">
                  <Image src={img.url} alt={img.alt_text || `Image ${i + 1}`} fill className="object-cover" sizes="100px" />
                  {img.is_primary && (
                    <span className="absolute top-1 left-1 bg-blush-500 text-white text-2xs px-1.5 py-0.5">Primary</span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    {!img.is_primary && (
                      <button
                        type="button"
                        onClick={() => setImages(images.map((x, j) => ({ ...x, is_primary: j === i })))}
                        className="text-white text-2xs bg-blush-500 px-1.5 py-1"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, j) => j !== i))}
                      className="text-white bg-red-500 p-1"
                    >
                      <X size={10} />
                    </button>
                  </div>
                </div>
              ))}

              <label className="aspect-[3/4] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-blush-400 transition-colors bg-gray-50">
                {uploadingImage ? (
                  <span className="w-5 h-5 border-2 border-blush-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload size={20} className="text-gray-400 mb-1" />
                    <span className="text-2xs text-gray-400">Upload</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) uploadImage(file)
                    e.target.value = ''
                  }}
                />
              </label>
            </div>
            <p className="text-xs text-gray-400">Or paste an image URL:</p>
            <div className="flex gap-2">
              <input
                placeholder="https://..."
                className="input-luxury flex-1 text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const url = (e.target as HTMLInputElement).value.trim()
                    if (url) {
                      setImages((prev) => [...prev, { url, alt_text: '', is_primary: prev.length === 0 }]);
                      (e.target as HTMLInputElement).value = ''
                    }
                  }
                }}
              />
              <span className="text-xs text-gray-400 self-center whitespace-nowrap">Press Enter</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Status Toggles */}
          <div className="admin-card space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Status & Flags</h3>
            {[
              { name: 'is_active', label: 'Active (Visible on store)' },
              { name: 'is_featured', label: 'Featured' },
              { name: 'is_new_arrival', label: 'New Arrival' },
              { name: 'is_best_seller', label: 'Best Seller' },
            ].map((toggle) => (
              <label key={toggle.name} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-600">{toggle.label}</span>
                <input
                  type="checkbox"
                  name={toggle.name}
                  checked={form[toggle.name as keyof typeof form] as boolean}
                  onChange={handleChange}
                  className="w-4 h-4 accent-blush-500"
                />
              </label>
            ))}
          </div>

          {/* Category */}
          <div className="admin-card">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Category</h3>
            <select name="category_id" value={form.category_id} onChange={handleChange} className="input-luxury text-sm w-full">
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Additional Info */}
          <div className="admin-card space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Additional Info</h3>
            <div>
              <label className="label-luxury">Materials</label>
              <input name="materials" value={form.materials} onChange={handleChange} className="input-luxury text-sm" placeholder="95% Silk, 5% Elastane" />
            </div>
            <div>
              <label className="label-luxury">Care Instructions</label>
              <textarea name="care_instructions" value={form.care_instructions} onChange={handleChange} rows={2} className="input-luxury text-sm resize-none" placeholder="Hand wash cold, lay flat to dry" />
            </div>
          </div>

          {/* SEO */}
          <div className="admin-card space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">SEO</h3>
            <div>
              <label className="label-luxury">Meta Title</label>
              <input name="meta_title" value={form.meta_title} onChange={handleChange} className="input-luxury text-sm" />
            </div>
            <div>
              <label className="label-luxury">Meta Description</label>
              <textarea name="meta_description" value={form.meta_description} onChange={handleChange} rows={2} className="input-luxury text-sm resize-none" />
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button type="submit" loading={loading} className="w-full">
              {mode === 'create' ? 'Create Product' : 'Save Changes'}
            </Button>
            <button type="button" onClick={() => router.back()} className="w-full btn-secondary text-xs">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
