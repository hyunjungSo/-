import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // 고령 사용자: 최소 48px 높이, 18px 텍스트, 명확한 포커스
        'file:text-foreground placeholder:text-[#666666] selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-14 w-full min-w-0 rounded-lg border-2 bg-transparent px-5 py-3 text-[1.125rem] shadow-sm transition-[color,box-shadow] outline-none file:inline-flex file:h-10 file:border-0 file:bg-transparent file:text-[1rem] file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-70',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-4',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
