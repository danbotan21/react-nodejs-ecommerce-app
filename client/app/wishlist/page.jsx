'use client'
import { Heart } from 'lucide-react'
import EmptyState from '@/components/EmptyState'
import ProductCard from '@/components/ProductCard'
import { useStore } from '@/lib/store'

export default function Wishlist() {
  const { ready, user, wishlist } = useStore()

  if (!ready) return null

  return (
    <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6'>
      <h1 className='text-3xl font-bold text-zinc-900'>Wishlist</h1>
      <div className='mt-6'>
        {!user ? (
          <EmptyState icon={<Heart />} title='Save products for later' text='Log in to keep a wishlist on any device.' action='Log in' href='/login' />
        ) : wishlist.length === 0 ? (
          <EmptyState icon={<Heart />} title='Your wishlist is empty' text='Tap the heart on a product to save it here.' />
        ) : (
          <div className='grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4'>
            {wishlist.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
