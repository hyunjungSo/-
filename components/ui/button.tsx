import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  // WCAG 준수 + 고령자 배려: 44px 터치 타겟, 16px 텍스트
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-base font-semibold transition-all disabled:pointer-events-none disabled:opacity-70 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-ring focus-visible:ring-[3px] focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive select-none",
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
        link: 'text-primary underline-offset-4 hover:underline focus-visible:underline min-h-0 min-w-0 p-0',
      },
      size: {
        // 적절한 크기: 44px 기본
        default: 'h-11 px-5 py-2.5 has-[>svg]:px-4',
        sm: 'h-10 rounded-lg gap-1.5 px-4 text-[0.9375rem] has-[>svg]:px-3',
        lg: 'h-12 rounded-lg px-6 has-[>svg]:px-5',
        icon: 'size-11',
        'icon-sm': 'size-10',
        'icon-lg': 'size-12',
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
