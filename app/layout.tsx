import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'UY JOY — Sotish va Sotib olish',
  description:
    "Qashqadaryo viloyati bo'ylab ko'chmas mulk platformasi. UY JOY orqali xavfsiz, tez va qulay tarzda uy sotib oling yoki sotib yuboring.",
  keywords: ['uy', 'kvartira', 'ko\'chmas mulk', 'sotish', 'ijaraga olish', 'uy joy', 'qashqadaryo'],
  openGraph: {
    title: 'UY JOY — Sotish va Sotib olish',
    description: 'Qashqadaryo viloyatidagi eng premium ko\'chmas mulk platformasi.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="uz"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-dvh flex flex-col bg-black">{children}</body>
    </html>
  )
}
