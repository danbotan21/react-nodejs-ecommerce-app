import { ShoppingBag } from 'lucide-react'

export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className='flex justify-center px-4 py-12 sm:py-20'>
      <div className='w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm'>
        <span className='flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600'>
          <ShoppingBag size={24} />
        </span>
        <h1 className='mt-5 text-2xl font-bold text-zinc-900'>{title}</h1>
        <p className='mt-1 text-zinc-600'>{subtitle}</p>
        <div className='mt-7'>{children}</div>
      </div>
    </div>
  )
}
