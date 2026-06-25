import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { LenisProvider } from "@/components/utils/lenis-provider"
import './globals.css'

const _geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const _geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: 'MoneyMind — Quản lý chi tiêu thông minh',
  description:
    'MoneyMind giúp bạn theo dõi thu nhập, chi tiêu và quản lý ngân sách hàng tháng bằng AI.',

  icons: {
    icon: '/expense.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className="bg-background">
      <body className="font-sans antialiased">
        <LenisProvider>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </LenisProvider>
      </body>
    </html>
  )
}
