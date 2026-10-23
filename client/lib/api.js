import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const SESSION_KEY = 'session'

export const getSession = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY))
  } catch {
    return null
  }
}

export const saveSession = (session) => localStorage.setItem(SESSION_KEY, JSON.stringify(session))
export const clearSession = () => localStorage.removeItem(SESSION_KEY)

export const api = axios.create({ baseURL: `${API_URL}/api` })

api.interceptors.request.use((config) => {
  const session = getSession()
  if (session?.token) config.headers.Authorization = `Bearer ${session.token}`
  return config
})

export const errorMessage = (error, fallback = 'Something went wrong. Please try again.') =>
  error.response?.data?.message || (error.response ? fallback : 'Cannot reach the server. Is it running?')

export const price = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
