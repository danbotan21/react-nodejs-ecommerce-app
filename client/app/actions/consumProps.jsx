'use client'

import { createContext, useEffect, useState } from 'react'

export const PropsContext = createContext()

export default function PropsProvider({ children }) {
  const [products, setProducts] = useState([])
  const [wishproduct, setWishProduct] = useState([])

  const [cartProducts, setCartProducts] = useState([])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const stored = window.localStorage.getItem('cartProducts')
    if (!stored) return

    try {
      setCartProducts(JSON.parse(stored))
    } catch {
      setCartProducts([])
    }
  }, [])

  return (
    <PropsContext.Provider
      value={{
        products,
        setProducts,
        wishproduct,
        setWishProduct,
        cartProducts,
        setCartProducts,
      }}
    >
      {children}
    </PropsContext.Provider>
  )
}
