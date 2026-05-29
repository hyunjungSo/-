'use client'

import * as React from 'react'

import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

/**
 * FormLabel
 * 폼 필드(인풋/셀렉트/텍스트에리아)에 붙는 라벨의 font-size와 font-weight를
 * 일관되게 적용하기 위한 공통 컴포넌트.
 *
 * - font-size: text-sm
 * - font-weight: font-medium
 *
 * 색상/간격/레이아웃 등 나머지 스타일은 className으로 그대로 전달한다.
 */
function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="form-label"
      className={cn('text-sm font-medium', className)}
      {...props}
    />
  )
}

export { FormLabel }
