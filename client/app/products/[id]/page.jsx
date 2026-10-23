'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { notFound, useParams } from 'next/navigation'
import { ArrowLeft, Check, Heart, Minus, Plus, ShoppingCart } from 'lucide-react'
import Stars from '@/components/Stars'
import { useStore } from '@/lib/store'
import { api, errorMessage, price } from '@/lib/api'

function ReviewForm({ productId, onSaved }) {
  const [form, setForm] = useState({ rating: 0, title: '', content: '' })
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await api.post(`/products/${productId}/reviews`, form)
      setForm({ rating: 0, title: '', content: '' })
      onSaved()
    } catch (err) {
      setError(errorMessage(err))
    }
    setSaving(false)
  }

  return (
    <form onSubmit={submit} className='space-y-3 rounded-3xl border border-zinc-200 bg-white p-5'>
      <p className='font-semibold text-zinc-900'>Write a review</p>
      <Stars value={form.rating} size={24} onChange={(rating) => setForm({ ...form, rating })} />
      <input className='field' placeholder='Title' value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={100} />
      <textarea className='field' rows={3} placeholder='What did you like or dislike?' value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} maxLength={2000} />
      {error && <p className='text-sm text-rose-600'>{error}</p>}
      <button className='btn-primary' disabled={saving}>
        Post review
      </button>
    </form>
  )
}

export default function ProductPage() {
  const { id } = useParams()
  const { user, addToCart, isWished, toggleWish } = useStore()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [missing, setMissing] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const load = () => {
    api.get(`/products/${id}`).then(({ data }) => setProduct(data), () => setMissing(true))
    api.get(`/products/${id}/reviews`).then(({ data }) => setReviews(data), () => {})
  }
  useEffect(load, [id])

  if (missing) notFound()
  if (!product) return <div className='mx-auto my-10 h-96 max-w-6xl animate-pulse rounded-3xl bg-zinc-200/70' />

  const add = () => {
    addToCart(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className='mx-auto max-w-6xl px-4 py-8 sm:px-6'>
      <Link href='/' className='inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900'>
        <ArrowLeft size={16} /> All products
      </Link>

      <div className='mt-6 grid gap-8 md:grid-cols-2 md:gap-12'>
        <div className='flex aspect-square items-center justify-center rounded-3xl border border-zinc-200 bg-white p-10'>
          <img src={product.image} alt={product.title} className='h-full w-full object-contain' />
        </div>

        <div className='flex flex-col'>
          <p className='text-sm font-semibold uppercase tracking-wide text-violet-600'>{product.category}</p>
          <h1 className='mt-2 text-3xl font-bold text-zinc-900 sm:text-4xl'>{product.title}</h1>
          <div className='mt-3 flex items-center gap-2 text-sm text-zinc-500'>
            <Stars value={product.rating} />
            {product.reviewCount > 0 ? `${product.rating} · ${product.reviewCount} reviews` : 'No reviews yet'}
          </div>
          <p className='mt-6 text-3xl font-bold text-zinc-900'>{price(product.price)}</p>
          <p className='mt-6 leading-relaxed text-zinc-600'>{product.description}</p>

          <div className='mt-8 flex flex-wrap items-center gap-3'>
            <div className='flex items-center rounded-xl border border-zinc-200 bg-white'>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className='p-3 text-zinc-500 hover:text-zinc-900' title='Less'>
                <Minus size={16} />
              </button>
              <span className='w-8 text-center font-semibold'>{quantity}</span>
              <button onClick={() => setQuantity(Math.min(10, quantity + 1))} className='p-3 text-zinc-500 hover:text-zinc-900' title='More'>
                <Plus size={16} />
              </button>
            </div>
            <button onClick={add} className={`btn-primary flex-1 py-3 ${added ? 'bg-emerald-600 hover:bg-emerald-600' : ''}`}>
              {added ? <Check size={18} /> : <ShoppingCart size={18} />}
              {added ? 'Added to cart' : 'Add to cart'}
            </button>
            <button onClick={() => toggleWish(product._id)} className='btn-outline py-3' title='Wishlist'>
              <Heart size={18} className={isWished(product._id) ? 'fill-rose-500 text-rose-500' : ''} />
            </button>
          </div>
        </div>
      </div>

      <section className='mt-14'>
        <h2 className='text-2xl font-bold text-zinc-900'>Reviews</h2>
        <div className='mt-6 grid gap-8 md:grid-cols-[1fr_360px]'>
          <ul className='space-y-4'>
            {reviews.length === 0 && <li className='text-zinc-500'>Be the first to review this product.</li>}
            {reviews.map((review) => (
              <li key={review._id} className='rounded-3xl border border-zinc-200 bg-white p-5'>
                <div className='flex items-center justify-between gap-3'>
                  <Stars value={review.rating} />
                  <span className='text-xs text-zinc-400'>{new Date(review.createdAt).toLocaleDateString('en-GB')}</span>
                </div>
                <p className='mt-2 font-semibold text-zinc-900'>{review.title}</p>
                <p className='mt-1 text-zinc-600'>{review.content}</p>
                <p className='mt-3 text-sm font-medium text-zinc-500'>{review.user?.name ?? 'Former customer'}</p>
              </li>
            ))}
          </ul>
          <div>
            {user ? (
              <ReviewForm productId={product._id} onSaved={load} />
            ) : (
              <p className='rounded-3xl border border-zinc-200 bg-white p-5 text-zinc-600'>
                <Link href='/login' className='font-semibold text-violet-600 hover:underline'>Log in</Link> to write a review.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
