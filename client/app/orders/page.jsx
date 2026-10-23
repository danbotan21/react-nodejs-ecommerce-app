'use client'
import { useEffect, useState } from 'react'
import { Package } from 'lucide-react'
import EmptyState from '@/components/EmptyState'
import { useStore } from '@/lib/store'
import { api, price } from '@/lib/api'

export default function Orders() {
  const { ready, user } = useStore()
  const [orders, setOrders] = useState(null)

  useEffect(() => {
    if (user) api.get('/orders').then(({ data }) => setOrders(data), () => setOrders([]))
  }, [user])

  if (!ready) return null

  return (
    <div className='mx-auto max-w-4xl px-4 py-8 sm:px-6'>
      <h1 className='text-3xl font-bold text-zinc-900'>My orders</h1>
      <div className='mt-6 space-y-4'>
        {!user && <EmptyState icon={<Package />} title='Log in to see your orders' text='Your past orders are saved to your account.' action='Log in' href='/login' />}
        {orders?.length === 0 && <EmptyState icon={<Package />} title='No orders yet' text='When you buy something it will show up here.' />}
        {orders?.map((order) => (
          <article key={order._id} className='rounded-3xl border border-zinc-200 bg-white p-5'>
            <header className='flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-3'>
              <div>
                <p className='font-semibold text-zinc-900'>Order #{order._id.slice(-6).toUpperCase()}</p>
                <p className='text-sm text-zinc-500'>{new Date(order.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</p>
              </div>
              <span className='rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700'>Paid · {price(order.total)}</span>
            </header>
            <ul className='mt-3 space-y-2'>
              {order.items.map((item) => (
                <li key={item._id} className='flex items-center gap-3 text-sm'>
                  <img src={item.image} alt='' className='h-10 w-10 rounded-lg bg-zinc-50 object-contain p-1' />
                  <span className='flex-1 text-zinc-700'>{item.title}</span>
                  <span className='text-zinc-500'>{item.quantity} × {price(item.price)}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  )
}
