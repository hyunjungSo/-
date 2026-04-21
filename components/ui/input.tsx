import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // KRDS 입력필드 스타일: 높이 48px, 폰트 16px, 보더 1px
        'flex h-12 w-full rounded-md border border-gray-300 bg-background px-4 py-3 text-base ring-offset-background transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#7a7a7a] hover:border-gray-400 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
