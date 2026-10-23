'use client'
import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { useStore } from '@/lib/store'
import { api, errorMessage, price } from '@/lib/api'

function Confirmation() {
  const params = useSearchParams()
  const { ready, clearCart } = useStore()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!ready) return
    api
      .post('/orders/confirm', { sessionId: params.get('session_id'), orderId: params.get('order') })
      .then(({ data }) => {
        setOrder(data)
        if (data.status === 'paid') clearCart()
      })
      .catch((err) => setError(errorMessage(err)))
  }, [ready, params, clearCart])

  if (error) return <p className='rounded-2xl bg-rose-50 p-4 text-rose-700'>{error}</p>
  if (!order) return <div className='h-72 animate-pulse rounded-3xl bg-zinc-200/70' />

  if (order.status !== 'paid') {
    return <p className='rounded-2xl bg-amber-50 p-4 text-amber-800'>We are still waiting for the payment to be confirmed. Refresh in a moment.</p>
  }

  return (
    <div className='rounded-3xl border border-zinc-200 bg-white p-8 text-center'>
      <CheckCircle2 size={56} className='mx-auto text-emerald-500' />
      <h1 className='mt-4 text-3xl font-bold text-zinc-900'>Thank you for your order!</h1>
      <p className='mt-2 text-zinc-600'>
        Order #{order._id.slice(-6).toUpperCase()} · {order.items.length} item{order.items.length > 1 ? 's' : ''} · {price(order.total)}
      </p>
      <div className='mt-8 flex justify-center gap-3'>
        <Link href='/orders' className='btn-outline'>See my orders</Link>
        <Link href='/' className='btn-primary'>Keep shopping</Link>
      </div>
    </div>
  )
}

export default function CheckoutSuccess() {
  return (
    <div className='mx-auto max-w-xl px-4 py-16'>
      <Suspense>
        <Confirmation />
      </Suspense>
    </div>
  )
}
