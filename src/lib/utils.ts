import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + '…'
}

export function getDiscountPercent(price: number, salePrice: number): number {
  return Math.round(((price - salePrice) / price) * 100)
}

export function generateOrderNumber(): string {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(Math.random() * 9000) + 1000
  return `VI-${dateStr}-${random}`
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  packed: 'Packed',
  dispatched: 'Dispatched',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  packed: 'bg-purple-100 text-purple-800',
  dispatched: 'bg-cyan-100 text-cyan-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'Italy', 'Spain', 'Netherlands', 'Sweden', 'Norway',
  'Denmark', 'Finland', 'Switzerland', 'Austria', 'Belgium', 'Portugal',
  'Poland', 'Czech Republic', 'Hungary', 'Romania', 'Pakistan', 'India',
  'Bangladesh', 'Sri Lanka', 'UAE', 'Saudi Arabia', 'Qatar', 'Kuwait',
  'Bahrain', 'Oman', 'Jordan', 'Egypt', 'South Africa', 'Nigeria',
  'Kenya', 'Ghana', 'Singapore', 'Malaysia', 'Philippines', 'Indonesia',
  'Thailand', 'Vietnam', 'Japan', 'South Korea', 'China', 'New Zealand',
  'Brazil', 'Argentina', 'Mexico', 'Colombia', 'Chile', 'Peru',
]
