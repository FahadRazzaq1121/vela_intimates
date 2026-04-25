import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'rose' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-medium tracking-widest uppercase transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation select-none'

    const variants = {
      primary: 'bg-charcoal text-cream-50 hover:bg-blush-600 focus:ring-2 focus:ring-blush-400 focus:ring-offset-2',
      secondary: 'border border-charcoal text-charcoal bg-transparent hover:bg-charcoal hover:text-cream-50 focus:ring-2 focus:ring-charcoal focus:ring-offset-2',
      rose: 'bg-blush-500 text-white hover:bg-blush-600 focus:ring-2 focus:ring-blush-400 focus:ring-offset-2',
      ghost: 'text-charcoal hover:text-blush-600 tracking-normal uppercase-none',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-400 focus:ring-offset-2',
    }

    const sizes = {
      sm: 'px-5 py-2 text-xs',
      md: 'px-8 py-3.5 text-sm',
      lg: 'px-10 py-4 text-sm',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Loading…</span>
          </>
        ) : children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
