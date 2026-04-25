import { cn } from '@/lib/utils'

export default function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-20', className)}>
      <div className="w-8 h-8 border-2 border-cream-300 border-t-blush-500 rounded-full animate-spin" />
    </div>
  )
}

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-cream-100 z-50">
      <div className="text-center">
        <p className="font-display text-2xl text-charcoal mb-4">Vela Intimates</p>
        <div className="w-8 h-8 border-2 border-cream-300 border-t-blush-500 rounded-full animate-spin mx-auto" />
      </div>
    </div>
  )
}
