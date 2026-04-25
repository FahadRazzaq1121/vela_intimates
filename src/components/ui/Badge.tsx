import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'sale' | 'new' | 'low' | 'out' | 'success' | 'warning' | 'error'
  className?: string
}

const variants = {
  default: 'bg-cream-200 text-charcoal',
  sale: 'bg-blush-500 text-white',
  new: 'bg-charcoal text-cream-50',
  low: 'bg-amber-100 text-amber-800',
  out: 'bg-red-100 text-red-700',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-800',
  error: 'bg-red-100 text-red-800',
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}
