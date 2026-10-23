'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Check, Heart, ShoppingCart } from 'lucide-react'
import Stars from './Stars'
import { useStore } from '@/lib/store'
import { price } from '@/lib/api'

export default function ProductCard({ product }) {
  const { addToCart, isWished, toggleWish } = useStore()
  const [added, setAdded] = useState(false)
  const wished = isWished(product._id)

  const add = () => {
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <div className='group relative flex flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white transition hover:shadow-lg'>
      <button
        onClick={() => toggleWish(product._id)}
        title={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        className='absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 shadow-sm transition hover:scale-110'
      >
        <Heart size={18} className={wished ? 'fill-rose-500 text-rose-500' : 'text-zinc-400'} />
      </button>

      <Link href={`/products/${product._id}`} className='flex aspect-square items-center justify-center bg-zinc-50 p-6'>
        <img src={product.image} alt={product.title} className='h-full w-full object-contain transition duration-300 group-hover:scale-105' />
      </Link>

      <div className='flex flex-1 flex-col p-4'>
        <p className='text-xs font-semibold uppercase tracking-wide text-violet-600'>{product.category}</p>
        <Link href={`/products/${product._id}`} className='mt-1 font-semibold text-zinc-900 hover:text-violet-700'>
          {product.title}
        </Link>
        <div className='mt-1.5 flex items-center gap-1.5 text-xs text-zinc-500'>
          <Stars value={product.rating} size={14} />
          {product.reviewCount > 0 ? `(${product.reviewCount})` : 'No reviews yet'}
        </div>
        <div className='mt-auto flex items-center justify-between pt-4'>
          <span className='text-lg font-bold text-zinc-900'>{price(product.price)}</span>
          <button onClick={add} className={`btn-primary px-3 py-2 text-sm ${added ? 'bg-emerald-600 hover:bg-emerald-600' : ''}`}>
            {added ? <Check size={16} /> : <ShoppingCart size={16} />}
            {added ? 'Added' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}
