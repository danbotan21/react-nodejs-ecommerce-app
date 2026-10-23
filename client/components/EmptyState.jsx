import Link from 'next/link'

export default function EmptyState({ icon, title, text, action = 'Browse products', href = '/' }) {
  return (
    <div className='rounded-3xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center'>
      <span className='mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600'>{icon}</span>
      <h2 className='mt-4 text-lg font-semibold text-zinc-900'>{title}</h2>
      <p className='mt-1 text-zinc-500'>{text}</p>
      <Link href={href} className='btn-primary mt-6'>
        {action}
      </Link>
    </div>
  )
}
