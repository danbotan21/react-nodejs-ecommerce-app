'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AuthCard from '@/components/AuthCard'
import { useStore } from '@/lib/store'
import { api, errorMessage } from '@/lib/api'

const fields = [
  { name: 'name', label: 'Name', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'password', label: 'Password', type: 'password', hint: 'At least 8 characters' },
  { name: 'confirmPassword', label: 'Confirm password', type: 'password' },
]

export default function SignUp() {
  const { login } = useStore()
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const update = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    if (form.password !== form.confirmPassword) return setError('The passwords do not match.')
    setBusy(true)
    setError(null)
    try {
      const { data } = await api.post('/auth/sign-up', form)
      login(data)
      router.replace('/')
    } catch (err) {
      setError(errorMessage(err))
      setBusy(false)
    }
  }

  return (
    <AuthCard title='Create an account' subtitle='It takes less than a minute.'>
      <form onSubmit={submit} className='space-y-4'>
        {fields.map(({ name, label, type, hint }) => (
          <div key={name}>
            <label className='label' htmlFor={name}>{label}</label>
            <input id={name} name={name} type={type} className='field' value={form[name]} onChange={update} required minLength={type === 'password' ? 8 : undefined} />
            {hint && <p className='mt-1 text-xs text-zinc-500'>{hint}</p>}
          </div>
        ))}
        {error && <p className='rounded-xl bg-rose-50 p-3 text-sm text-rose-700'>{error}</p>}
        <button type='submit' disabled={busy} className='btn-primary w-full py-3'>Sign up</button>
      </form>
      <p className='mt-6 text-center text-sm text-zinc-600'>
        Already have an account?{' '}
        <Link href='/login' className='font-semibold text-violet-600 hover:underline'>Log in</Link>
      </p>
    </AuthCard>
  )
}
