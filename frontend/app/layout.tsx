import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { LenisProvider } from "@/components/utils/lenis-provider"
import './globals.css'

const _geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const _geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: 'Expense Management',
  description:
    'Expense Management is an AI-powered insurance claim auto-adjudication system for healthcare.',

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
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased">
        <LenisProvider>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </LenisProvider>
      </body>
    </html>
  )
}
