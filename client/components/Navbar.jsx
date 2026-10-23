'use client'
import Link from 'next/link'
import { Heart, LogOut, Package, ShoppingBag, ShoppingCart } from 'lucide-react'
import { useStore } from '@/lib/store'

function IconLink({ href, label, count, children }) {
  return (
    <Link href={href} title={label} className='relative rounded-xl p-2.5 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900'>
      {children}
      {count > 0 && (
        <span className='absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-violet-600 px-1 text-xs font-semibold text-white'>
          {count}
        </span>
      )}
    </Link>
  )
}

export default function Navbar() {
  const { user, logout, cartCount, wishlist } = useStore()

  return (
    <header className='sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur'>
      <nav className='mx-auto flex max-w-7xl items-center gap-1 px-4 py-3 sm:px-6'>
        <Link href='/' className='mr-auto flex items-center gap-2'>
          <span className='flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white'>
            <ShoppingBag size={19} />
          </span>
          <span className='text-lg font-bold text-zinc-900'>TechNest</span>
        </Link>

        <IconLink href='/wishlist' label='Wishlist' count={wishlist.length}>
          <Heart size={21} />
        </IconLink>
        <IconLink href='/cart' label='Cart' count={cartCount}>
          <ShoppingCart size={21} />
        </IconLink>

        {user ? (
          <>
            <IconLink href='/orders' label='My orders'>
              <Package size={21} />
            </IconLink>
            <span title={user.name} className='ml-2 hidden h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700 sm:flex'>
              {user.name[0].toUpperCase()}
            </span>
            <button onClick={logout} title='Log out' className='rounded-xl p-2.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'>
              <LogOut size={20} />
            </button>
          </>
        ) : (
          <Link href='/login' className='btn-primary ml-2 px-4 py-2'>
            Log in
          </Link>
        )}
      </nav>
    </header>
  )
}
