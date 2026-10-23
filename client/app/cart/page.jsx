'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Lock, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import EmptyState from '@/components/EmptyState'
import { useStore } from '@/lib/store'
import { api, errorMessage, price } from '@/lib/api'

export default function Cart() {
  const router = useRouter()
  const { ready, user, cart, setQuantity, removeFromCart } = useStore()
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [payments, setPayments] = useState(null)

  useEffect(() => {
    api.get('/config').then(({ data }) => setPayments(data.payments), () => {})
  }, [])

  if (!ready) return null
  if (cart.length === 0) {
    return (
      <div className='mx-auto max-w-3xl px-4 py-12'>
        <EmptyState icon={<ShoppingCart />} title='Your cart is empty' text='Add a few products and they will show up here.' />
      </div>
    )
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const checkout = async () => {
    if (!user) return router.push('/login?next=/cart')
    setBusy(true)
    setError(null)
    try {
      const items = cart.map(({ productId, quantity }) => ({ productId, quantity }))
      const { data } = await api.post('/orders/checkout', { items })
      window.location.href = data.url
    } catch (err) {
      setError(errorMessage(err))
      setBusy(false)
    }
  }

  return (
    <div className='mx-auto max-w-6xl px-4 py-8 sm:px-6'>
      <h1 className='text-3xl font-bold text-zinc-900'>Your cart</h1>

      <div className='mt-6 grid gap-8 lg:grid-cols-[1fr_360px]'>
        <ul className='divide-y divide-zinc-200 rounded-3xl border border-zinc-200 bg-white'>
          {cart.map((item) => (
            <li key={item.productId} className='flex items-center gap-4 p-4 sm:p-5'>
              <Link href={`/products/${item.productId}`} className='flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-zinc-50 p-2'>
                <img src={item.image} alt={item.title} className='h-full w-full object-contain' />
              </Link>
              <div className='min-w-0 flex-1'>
                <Link href={`/products/${item.productId}`} className='font-semibold text-zinc-900 hover:text-violet-700'>
                  {item.title}
                </Link>
                <p className='text-sm text-zinc-500'>{price(item.price)} each</p>
                <div className='mt-2 flex items-center gap-3'>
                  <div className='flex items-center rounded-lg border border-zinc-200'>
                    <button onClick={() => setQuantity(item.productId, item.quantity - 1)} className='p-1.5 text-zinc-500 hover:text-zinc-900' title='Less'>
                      <Minus size={14} />
                    </button>
                    <span className='w-7 text-center text-sm font-semibold'>{item.quantity}</span>
                    <button onClick={() => setQuantity(item.productId, item.quantity + 1)} className='p-1.5 text-zinc-500 hover:text-zinc-900' title='More'>
                      <Plus size={14} />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item.productId)} className='text-zinc-400 hover:text-rose-600' title='Remove'>
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
              <p className='font-semibold text-zinc-900'>{price(item.price * item.quantity)}</p>
            </li>
          ))}
        </ul>

        <aside className='h-fit rounded-3xl border border-zinc-200 bg-white p-6'>
          <h2 className='font-semibold text-zinc-900'>Order summary</h2>
          <dl className='mt-4 space-y-2 text-sm'>
            <div className='flex justify-between text-zinc-600'>
              <dt>Subtotal</dt>
              <dd>{price(total)}</dd>
            </div>
            <div className='flex justify-between text-zinc-600'>
              <dt>Shipping</dt>
              <dd className='text-emerald-600'>Free</dd>
            </div>
            <div className='flex justify-between border-t border-zinc-200 pt-3 text-base font-bold text-zinc-900'>
              <dt>Total</dt>
              <dd>{price(total)}</dd>
            </div>
          </dl>
          {error && <p className='mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700'>{error}</p>}
          <button onClick={checkout} disabled={busy} className='btn-primary mt-6 w-full py-3'>
            <Lock size={16} />
            {busy ? 'Redirecting...' : user ? 'Checkout' : 'Log in to checkout'}
          </button>
          <p className='mt-3 text-center text-xs text-zinc-500'>
            {payments === 'stripe'
              ? 'Stripe test mode: pay with card 4242 4242 4242 4242, any future date and any CVC.'
              : 'Demo mode: no payment is taken, the order is confirmed right away.'}
          </p>
        </aside>
      </div>
    </div>
  )
}
