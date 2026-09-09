import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-lg border-2 border-border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_hsl(var(--neo-shadow))] transition-transform select-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'bg-background text-foreground',
        success: 'bg-[#23F074] text-black border-border',
        warning: 'bg-[#FFE600] text-black border-border',
        info: 'bg-[#00F0FF] text-black border-border',
        brand: 'bg-primary text-white border-border',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
