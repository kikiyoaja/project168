import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '../components/ui/toaster'
import { ClientLayout } from '../components/layout/client-layout'

export const metadata: Metadata = {
  title: 'Ziyyanmart',
  description: 'Aplikasi kasir modern',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body className="font-body antialiased">
        <ClientLayout>
          {children}
        </ClientLayout>
        <Toaster />
      </body>
    </html>
  )
}
