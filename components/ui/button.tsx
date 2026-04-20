import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  // 고령 사용자: 최소 48px 터치 타겟, 18px 텍스트, 명확한 포커스
  "inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-lg text-[1.125rem] font-bold transition-all disabled:pointer-events-none disabled:opacity-70 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-6 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-ring focus-visible:ring-4 focus-visible:ring-offset-3 focus-visible:ring-offset-background aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive select-none",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/85 active:bg-primary/75',
        destructive:
          'bg-destructive text-white hover:bg-destructive/85 active:bg-destructive/75 focus-visible:ring-destructive/30 dark:focus-visible:ring-destructive/40 dark:bg-destructive/80',
        outline:
          'border-2 border-primary bg-background text-primary shadow-sm hover:bg-primary hover:text-primary-foreground active:bg-primary/90 dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/70 active:bg-secondary/60',
        ghost:
          'hover:bg-muted hover:text-foreground active:bg-muted/80 dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline focus-visible:underline min-h-0 min-w-0 p-0 text-[1rem]',
      },
      size: {
        // 고령 사용자: 최소 48px 높이, 충분한 패딩
        default: 'h-14 px-6 py-3 has-[>svg]:px-5',
        sm: 'h-12 rounded-lg gap-2 px-5 text-[1rem] has-[>svg]:px-4',
        lg: 'h-16 rounded-xl px-10 text-[1.25rem] has-[>svg]:px-6',
        icon: 'size-14',
        'icon-sm': 'size-12',
        'icon-lg': 'size-16',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
