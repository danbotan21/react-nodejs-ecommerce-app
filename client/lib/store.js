'use client'
import { createContext, useContext } from 'react'

export const StoreContext = createContext(null)

// { user, login, logout, cart, addToCart, setQuantity, removeFromCart, clearCart,
//   cartCount, wishlist, isWished, toggleWish }
export const useStore = () => useContext(StoreContext)
