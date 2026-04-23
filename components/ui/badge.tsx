import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  // KRDS v1.0.0 뱃지 스타일: 4px radius, 8px 단위 padding
  'inline-flex items-center justify-center rounded gap-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        // KRDS Primary Filled - #157161
        default:
          'border-transparent bg-primary text-primary-foreground',
        // KRDS Secondary/Subtle - 연한 배경
        secondary:
          'border-transparent bg-secondary text-secondary-foreground',
        // KRDS Destructive/Error - #D32F2F
        destructive:
          'border-transparent bg-destructive text-destructive-foreground',
        // KRDS Outline - 테두리만
        outline: 'border border-border bg-transparent text-foreground',
        // KRDS Success - #2E7D32
        success: 'border-transparent bg-success text-success-foreground',
        // KRDS Warning - #ED6C02
        warning: 'border-transparent bg-warning text-warning-foreground',
        // KRDS Info - #0288D1
        info: 'border-transparent bg-info text-info-foreground',
        // KRDS Primary Subtle - 연한 primary 배경
        'primary-subtle': 'border-transparent bg-accent text-primary',
        // KRDS Success Subtle
        'success-subtle': 'border-transparent bg-green-50 text-success',
        // KRDS Warning Subtle
        'warning-subtle': 'border-transparent bg-orange-50 text-warning',
        // KRDS Destructive Subtle
        'destructive-subtle': 'border-transparent bg-red-50 text-destructive',
      },
      size: {
        // KRDS 뱃지 크기 (8px 단위)
        sm: 'h-5 px-1.5 text-xs', // 20px height
        default: 'h-6 px-2 text-xs', // 24px height
        lg: 'h-7 px-2.5 text-sm', // 28px height
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
