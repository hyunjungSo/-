import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // 고령 사용자: 18px 텍스트, 넓은 줄간격, 명확한 포커스
        'border-input border-2 placeholder:text-[#666666] focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-32 w-full rounded-lg bg-transparent px-5 py-4 text-[1.125rem] leading-[1.8] shadow-sm transition-[color,box-shadow] outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-70',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
