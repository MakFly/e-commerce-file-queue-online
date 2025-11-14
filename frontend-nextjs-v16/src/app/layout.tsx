import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AdminButton from '@/components/AdminButton'
import Navbar from '@/components/Navbar'
import { CartProvider } from '@/contexts/CartContext'
import { QueryProvider } from '@/providers/query-provider'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'E-Commerce Store - Queue System',
  description: 'E-commerce store with traffic queue management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <CartProvider>
            <Navbar />
            {children}
            <AdminButton />
            <Toaster position="top-right" richColors />
          </CartProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
