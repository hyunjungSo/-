import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  // KRDS 뱃지 스타일: 작은 라운드, 적절한 패딩
  'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        // KRDS filled 스타일
        default:
          'border-transparent bg-primary text-white',
        // KRDS secondary 스타일
        secondary:
          'border-transparent bg-gray-100 text-gray-700',
        // KRDS destructive 스타일
        destructive:
          'border-transparent bg-destructive text-white',
        // KRDS outline 스타일
        outline: 'border border-gray-300 bg-transparent text-gray-700',
        // KRDS success 스타일
        success: 'border-transparent bg-green-600 text-white',
        // KRDS warning 스타일
        warning: 'border-transparent bg-amber-500 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
