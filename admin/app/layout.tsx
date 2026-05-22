import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'

const geist = Geist({ variable: '--font-geist', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Quizdram Admin',
  description: 'Quizdram içerik yönetim paneli',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-zinc-50 text-zinc-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
