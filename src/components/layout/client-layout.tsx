
'use client'

import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'

const AppLayout = dynamic(
  () => import('@/components/layout/app-layout'),
  { ssr: false }
)

export function ClientLayout({ children }: { children: ReactNode }) {
  return <AppLayout>{children}</AppLayout>
}
