import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  // KRDS 버튼 디자인 시스템 준수
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        // KRDS Primary: 채운 스타일 - 가장 높은 강조, 주요 행동 유도
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
        // KRDS Secondary: 채운 스타일 - 중간 수준 강조, 검색/조회 등 보조 액션
        secondary: 'bg-[#222222] text-white hover:bg-[#333333] active:bg-[#111111]',
        // KRDS Outline: 윤곽선 스타일 - 중간 수준 강조
        outline: 'border-2 border-primary bg-transparent text-primary hover:bg-primary/5 active:bg-primary/10',
        // KRDS Tertiary: 낮은 강조 수준
        tertiary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300',
        // KRDS Text: 텍스트 버튼 - 가장 낮은 강조
        ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200',
        // 위험 동작용
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80',
        // 링크 스타일
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        // KRDS 사이즈: x-small, small, medium, large, x-large
        xs: 'h-7 px-2 text-xs rounded',
        sm: 'h-8 px-3 text-sm rounded-md',
        default: 'h-10 px-4 text-sm rounded-md',
        lg: 'h-12 px-6 text-base rounded-md',
        xl: 'h-14 px-8 text-lg rounded-md',
        // 아이콘 버튼
        icon: 'h-10 w-10',
        'icon-xs': 'h-7 w-7',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
        'icon-xl': 'h-14 w-14',
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
