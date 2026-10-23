'use client'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import AuthCard from '@/components/AuthCard'
import { useStore } from '@/lib/store'
import { api, errorMessage } from '@/lib/api'

const DEMO = { email: 'demo@shop.app', password: 'ShopDemo123!' }

function LoginForm() {
  const { login } = useStore()
  const router = useRouter()
  const next = useSearchParams().get('next') || '/'
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const update = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))

  const submit = async (event, credentials = form) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const { data } = await api.post('/auth/login', credentials)
      login(data)
      router.replace(next)
    } catch (err) {
      setError(errorMessage(err))
      setBusy(false)
    }
  }

  return (
    <AuthCard title='Welcome back' subtitle='Log in to check out, review products and keep a wishlist.'>
      <form onSubmit={submit} className='space-y-4'>
        <div>
          <label className='label' htmlFor='email'>Email</label>
          <input id='email' name='email' type='email' className='field' value={form.email} onChange={update} required />
        </div>
        <div>
          <label className='label' htmlFor='password'>Password</label>
          <input id='password' name='password' type='password' className='field' value={form.password} onChange={update} required />
        </div>
        {error && <p className='rounded-xl bg-rose-50 p-3 text-sm text-rose-700'>{error}</p>}
        <button type='submit' disabled={busy} className='btn-primary w-full py-3'>Log in</button>
        <button type='button' disabled={busy} onClick={(e) => submit(e, DEMO)} className='btn-outline w-full'>
          Use the demo account
        </button>
      </form>
      <p className='mt-6 text-center text-sm text-zinc-600'>
        New here?{' '}
        <Link href='/sign-up' className='font-semibold text-violet-600 hover:underline'>Create an account</Link>
      </p>
    </AuthCard>
  )
}

export default function Login() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
