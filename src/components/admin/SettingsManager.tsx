'use client'

import { useState } from 'react'
import { Save, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

interface FooterLink {
  label: string
  href: string
  visible: boolean
}

interface Props {
  initialSettings: Record<string, string>
}

export default function SettingsManager({ initialSettings }: Props) {
  const [settings, setSettings] = useState(initialSettings)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'social' | 'footer' | 'contact'>('general')

  const set = (key: string, value: string) => setSettings((prev) => ({ ...prev, [key]: value }))
  const toggle = (key: string) => set(key, settings[key] === 'true' ? 'false' : 'true')

  const parseLinks = (key: string): FooterLink[] => {
    try { return JSON.parse(settings[key] || '[]') } catch { return [] }
  }

  const updateLink = (key: string, index: number, field: keyof FooterLink, value: string | boolean) => {
    const links = parseLinks(key)
    links[index] = { ...links[index], [field]: value }
    set(key, JSON.stringify(links))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success('Settings saved')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const TABS = [
    { id: 'general', label: 'General' },
    { id: 'social', label: 'Social & Contact' },
    { id: 'footer', label: 'Footer Links' },
  ] as const

  const shopLinks = parseLinks('footer_shop_links')
  const helpLinks = parseLinks('footer_help_links')

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === tab.id ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="admin-card space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Brand</h2>
          <div>
            <label className="label-luxury">Brand Name</label>
            <input value={settings.brand_name || ''} onChange={(e) => set('brand_name', e.target.value)} className="input-luxury" />
          </div>
          <div>
            <label className="label-luxury">Brand Tagline (shown in footer)</label>
            <textarea value={settings.brand_tagline || ''} onChange={(e) => set('brand_tagline', e.target.value)} rows={2} className="input-luxury resize-none" />
          </div>
          <div>
            <label className="label-luxury">Copyright Text</label>
            <input value={settings.footer_copyright || ''} onChange={(e) => set('footer_copyright', e.target.value)} className="input-luxury" placeholder="Vela Intimates. All rights reserved." />
          </div>

          <h2 className="text-sm font-semibold text-gray-700 pt-2">Footer Sections</h2>
          <div className="space-y-3">
            {[
              { key: 'show_newsletter', label: 'Show Newsletter Section' },
              { key: 'show_whatsapp', label: 'Show WhatsApp Support' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{label}</span>
                <button
                  type="button"
                  onClick={() => toggle(key)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${settings[key] === 'true' ? 'bg-blush-500' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings[key] === 'true' ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Social & Contact Tab */}
      {activeTab === 'social' && (
        <div className="admin-card space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Social Media</h2>
          <div>
            <label className="label-luxury">Instagram Handle</label>
            <input value={settings.instagram_handle || ''} onChange={(e) => set('instagram_handle', e.target.value)} className="input-luxury" placeholder="@velaintimate" />
          </div>
          <div className="flex items-center justify-between mb-1">
            <label className="label-luxury mb-0">Instagram Profile URL</label>
            <button type="button" onClick={() => toggle('show_instagram')} className={`w-10 h-6 rounded-full transition-colors relative ${settings.show_instagram === 'true' ? 'bg-blush-500' : 'bg-gray-200'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.show_instagram === 'true' ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <input value={settings.instagram_url || ''} onChange={(e) => set('instagram_url', e.target.value)} className="input-luxury" placeholder="https://instagram.com/..." />

          <div className="flex items-center justify-between mb-1">
            <label className="label-luxury mb-0">Facebook</label>
            <button type="button" onClick={() => toggle('show_facebook')} className={`w-10 h-6 rounded-full transition-colors relative ${settings.show_facebook === 'true' ? 'bg-blush-500' : 'bg-gray-200'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.show_facebook === 'true' ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <input value={settings.facebook_url || ''} onChange={(e) => set('facebook_url', e.target.value)} className="input-luxury" placeholder="https://facebook.com/..." />

          <h2 className="text-sm font-semibold text-gray-700 pt-2">Contact</h2>
          <div>
            <label className="label-luxury">Contact Email</label>
            <input value={settings.contact_email || ''} onChange={(e) => set('contact_email', e.target.value)} className="input-luxury" placeholder="hello@velaintimates.com" />
          </div>
          <div>
            <label className="label-luxury">WhatsApp Number</label>
            <input value={settings.footer_whatsapp || settings.whatsapp_number || ''} onChange={(e) => set('footer_whatsapp', e.target.value)} className="input-luxury" placeholder="+1 (234) 567-890" />
          </div>
        </div>
      )}

      {/* Footer Links Tab */}
      {activeTab === 'footer' && (
        <div className="space-y-5">
          {/* Shop Links */}
          <div className="admin-card">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Shop Links</h2>
            <div className="space-y-2">
              {shopLinks.map((link, i) => (
                <div key={i} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateLink('footer_shop_links', i, 'visible', !link.visible)}
                    className="flex-shrink-0 text-gray-400 hover:text-blush-500 transition-colors"
                    title={link.visible ? 'Hide' : 'Show'}
                  >
                    {link.visible ? <Eye size={16} /> : <EyeOff size={16} className="opacity-40" />}
                  </button>
                  <input
                    value={link.label}
                    onChange={(e) => updateLink('footer_shop_links', i, 'label', e.target.value)}
                    className="input-luxury flex-1 py-1.5 text-xs"
                    placeholder="Label"
                  />
                  <input
                    value={link.href}
                    onChange={(e) => updateLink('footer_shop_links', i, 'href', e.target.value)}
                    className="input-luxury flex-1 py-1.5 text-xs font-mono"
                    placeholder="/shop"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Help Links */}
          <div className="admin-card">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Help Links</h2>
            <div className="space-y-2">
              {helpLinks.map((link, i) => (
                <div key={i} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateLink('footer_help_links', i, 'visible', !link.visible)}
                    className="flex-shrink-0 text-gray-400 hover:text-blush-500 transition-colors"
                    title={link.visible ? 'Hide' : 'Show'}
                  >
                    {link.visible ? <Eye size={16} /> : <EyeOff size={16} className="opacity-40" />}
                  </button>
                  <input
                    value={link.label}
                    onChange={(e) => updateLink('footer_help_links', i, 'label', e.target.value)}
                    className="input-luxury flex-1 py-1.5 text-xs"
                    placeholder="Label"
                  />
                  <input
                    value={link.href}
                    onChange={(e) => updateLink('footer_help_links', i, 'href', e.target.value)}
                    className="input-luxury flex-1 py-1.5 text-xs font-mono"
                    placeholder="/help"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-rose px-6 py-2.5 text-xs flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={14} />
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
