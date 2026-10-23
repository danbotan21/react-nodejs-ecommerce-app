'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { StoreContext } from '@/lib/store'
import { api, clearSession, getSession, saveSession } from '@/lib/api'

const CART_KEY = 'cart'

// Session, cart (kept in the browser) and wishlist (kept on the server, per user)
export default function Providers({ children }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [ready, setReady] = useState(false)

  // localStorage only exists in the browser, so read it after the first render
  useEffect(() => {
    setUser(getSession()?.user ?? null)
    try {
      setCart(JSON.parse(localStorage.getItem(CART_KEY)) ?? [])
    } catch {
      setCart([])
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready) localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }, [cart, ready])

  useEffect(() => {
    if (!user) return setWishlist([])
    api.get('/wishlist').then(
      ({ data }) => setWishlist(data),
      (error) => {
        if (error.response?.status === 401) {
          clearSession()
          setUser(null)
        }
      }
    )
  }, [user])

  const login = (session) => {
    saveSession(session)
    setUser(session.user)
  }

  const logout = () => {
    clearSession()
    setUser(null)
    router.push('/')
  }

  const addToCart = useCallback((product, quantity = 1) => {
    setCart((prev) => {
      const line = prev.find((item) => item.productId === product._id)
      if (line) {
        return prev.map((item) =>
          item === line ? { ...item, quantity: Math.min(10, item.quantity + quantity) } : item
        )
      }
      const { _id, title, image, price } = product
      return [...prev, { productId: _id, title, image, price, quantity: Math.min(10, quantity) }]
    })
  }, [])

  const setQuantity = (productId, quantity) =>
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: Math.max(1, Math.min(10, quantity)) } : item
      )
    )

  const removeFromCart = (productId) => setCart((prev) => prev.filter((item) => item.productId !== productId))
  const clearCart = useCallback(() => setCart([]), [])

  const isWished = (productId) => wishlist.some((product) => product._id === productId)

  const toggleWish = async (productId) => {
    if (!user) return router.push('/login')
    const { data } = isWished(productId)
      ? await api.delete(`/wishlist/${productId}`)
      : await api.put(`/wishlist/${productId}`)
    setWishlist(data)
  }

  const value = {
    ready,
    user,
    login,
    logout,
    cart,
    cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    addToCart,
    setQuantity,
    removeFromCart,
    clearCart,
    wishlist,
    isWished,
    toggleWish,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
