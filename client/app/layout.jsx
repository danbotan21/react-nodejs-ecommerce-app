import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'TechNest',
  description: 'An online tech store built with Next.js, Express, MongoDB and Stripe.',
}

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <Providers>
          <div className='flex min-h-screen flex-col'>
            <Navbar />
            <main className='flex-1'>{children}</main>
            <footer className='border-t border-zinc-200 py-6 text-center text-sm text-zinc-500'>
              TechNest · demo store built with Next.js, Express, MongoDB and Stripe
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  )
}
