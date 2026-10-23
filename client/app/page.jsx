'use client'
import { useEffect, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import { api, errorMessage } from '@/lib/api'

const PRICES = {
  any: {},
  under500: { maxPrice: 500 },
  '500to1500': { minPrice: 500, maxPrice: 1500 },
  over1500: { minPrice: 1500 },
}

export default function Shop() {
  const [categories, setCategories] = useState([])
  const [category, setCategory] = useState('all')
  const [priceRange, setPriceRange] = useState('any')
  const [sort, setSort] = useState('newest')
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/products/categories').then(({ data }) => setCategories(data), () => {})
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      api
        .get('/products', { params: { category, sort, search, ...PRICES[priceRange] } })
        .then(({ data }) => {
          setProducts(data)
          setError(null)
        })
        .catch((err) => setError(errorMessage(err)))
    }, 200)
    return () => clearTimeout(timer)
  }, [category, priceRange, sort, search])

  const chip = (value, label) => (
    <button
      key={value}
      onClick={() => setCategory(value)}
      className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
        category === value ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 ring-1 ring-zinc-200 hover:ring-zinc-300'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6'>
      <section className='overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-violet-600 to-fuchsia-500 px-6 py-10 text-white sm:px-12 sm:py-14'>
        <p className='text-sm font-semibold uppercase tracking-widest text-violet-200'>New season</p>
        <h1 className='mt-2 max-w-xl text-4xl font-bold leading-tight sm:text-5xl'>Gear up for work and play</h1>
        <p className='mt-3 max-w-lg text-violet-100'>
          Laptops, phones, gaming gear and more. Secure checkout with Stripe.
        </p>
      </section>

      <section className='mt-8 flex flex-col gap-4'>
        <div className='flex gap-2 overflow-x-auto pb-1'>
          {chip('all', 'All products')}
          {categories.map((name) => chip(name, name))}
        </div>

        <div className='flex flex-col gap-3 sm:flex-row'>
          <label className='relative flex-1'>
            <Search size={18} className='absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400' />
            <input className='field pl-11' placeholder='Search products' value={search} onChange={(e) => setSearch(e.target.value)} />
          </label>
          <label className='relative'>
            <SlidersHorizontal size={16} className='absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400' />
            <select className='field pl-10 sm:w-48' value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
              <option value='any'>Any price</option>
              <option value='under500'>Under $500</option>
              <option value='500to1500'>$500 to $1,500</option>
              <option value='over1500'>Over $1,500</option>
            </select>
          </label>
          <select className='field sm:w-48' value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value='newest'>Newest</option>
            <option value='price-asc'>Price: low to high</option>
            <option value='price-desc'>Price: high to low</option>
            <option value='rating'>Best rated</option>
          </select>
        </div>
      </section>

      {error && <p className='mt-6 rounded-2xl bg-rose-50 p-4 text-rose-700'>{error}</p>}

      <section className='mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4'>
        {!products && !error && [1, 2, 3, 4].map((n) => <div key={n} className='aspect-[3/4] animate-pulse rounded-3xl bg-zinc-200/70' />)}
        {products?.map((product) => <ProductCard key={product._id} product={product} />)}
      </section>

      {products?.length === 0 && (
        <p className='py-16 text-center text-zinc-500'>No products match these filters.</p>
      )}
    </div>
  )
}
