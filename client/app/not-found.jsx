import Link from 'next/link'

export default function NotFound() {
  return (
    <div className='mx-auto max-w-md px-4 py-24 text-center'>
      <p className='text-7xl font-bold text-violet-600'>404</p>
      <h1 className='mt-4 text-2xl font-semibold text-zinc-900'>We could not find that page</h1>
      <p className='mt-2 text-zinc-600'>The product may have been removed or the link is wrong.</p>
      <Link href='/' className='btn-primary mt-8'>Back to the shop</Link>
    </div>
  )
}
