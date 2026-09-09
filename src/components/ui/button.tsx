import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold border-2 border-border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-[3px_3px_0px_0px_hsl(var(--neo-shadow))] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_hsl(var(--neo-shadow))] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_hsl(var(--neo-shadow))]',
        destructive:
          'bg-destructive text-destructive-foreground shadow-[3px_3px_0px_0px_hsl(var(--neo-shadow))] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_hsl(var(--neo-shadow))] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_hsl(var(--neo-shadow))]',
        outline:
          'bg-background text-foreground shadow-[3px_3px_0px_0px_hsl(var(--neo-shadow))] hover:bg-muted hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_hsl(var(--neo-shadow))] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_hsl(var(--neo-shadow))]',
        secondary:
          'bg-secondary text-secondary-foreground shadow-[3px_3px_0px_0px_hsl(var(--neo-shadow))] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_hsl(var(--neo-shadow))] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_hsl(var(--neo-shadow))]',
        ghost:
          'border-transparent hover:border-border hover:bg-muted/80 hover:shadow-[2px_2px_0px_0px_hsl(var(--neo-shadow))]',
        link: 'border-transparent text-primary underline-offset-4 hover:underline',
        brand:
          'bg-primary text-primary-foreground shadow-[3px_3px_0px_0px_hsl(var(--neo-shadow))] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_hsl(var(--neo-shadow))] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_hsl(var(--neo-shadow))]',
        'brand-outline':
          'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 shadow-[3px_3px_0px_0px_hsl(var(--neo-shadow))] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_hsl(var(--neo-shadow))] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_hsl(var(--neo-shadow))]',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 px-3.5 text-xs',
        lg: 'h-12 px-8 text-base',
        xl: 'h-14 px-10 text-base font-extrabold',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled ?? loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
