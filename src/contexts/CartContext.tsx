'use client'

import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react'
import { CartItem } from '@/types'
import toast from 'react-hot-toast'

interface CartState {
  items: CartItem[]
  isOpen: boolean
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }

interface CartContextValue extends CartState {
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  subtotal: number
  total: number
  itemCount: number
  getItemKey: (productId: string, size?: string | null, color?: string | null) => string
}

const CartContext = createContext<CartContextValue | null>(null)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'LOAD_CART':
      return { ...state, items: action.payload }

    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id === action.payload.id)
      if (existing) {
        const newQty = Math.min(existing.quantity + action.payload.quantity, existing.stock_quantity)
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.payload.id ? { ...i, quantity: newQty } : i
          ),
        }
      }
      return { ...state, items: [...state.items, action.payload] }
    }

    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.payload) }

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return { ...state, items: state.items.filter(i => i.id !== action.payload.id) }
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.payload.id
            ? { ...i, quantity: Math.min(action.payload.quantity, i.stock_quantity) }
            : i
        ),
      }
    }

    case 'CLEAR_CART':
      return { ...state, items: [] }

    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen }

    case 'OPEN_CART':
      return { ...state, isOpen: true }

    case 'CLOSE_CART':
      return { ...state, isOpen: false }

    default:
      return state
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false })

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vela-cart')
      if (saved) {
        const items = JSON.parse(saved) as CartItem[]
        dispatch({ type: 'LOAD_CART', payload: items })
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('vela-cart', JSON.stringify(state.items))
    } catch {}
  }, [state.items])

  const getItemKey = useCallback((productId: string, size?: string | null, color?: string | null) => {
    return `${productId}-${size || 'nosize'}-${color || 'nocolor'}`
  }, [])

  const addItem = useCallback((item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item })
    dispatch({ type: 'OPEN_CART' })
    toast.success(`${item.name} added to cart`, {
      style: { background: '#2C2C2C', color: '#FAF6F1' },
      iconTheme: { primary: '#B76E79', secondary: '#FAF6F1' },
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' })
  }, [])

  const toggleCart = useCallback(() => dispatch({ type: 'TOGGLE_CART' }), [])
  const openCart = useCallback(() => dispatch({ type: 'OPEN_CART' }), [])
  const closeCart = useCallback(() => dispatch({ type: 'CLOSE_CART' }), [])

  const subtotal = state.items.reduce((sum, item) => {
    const price = item.sale_price ?? item.price
    return sum + price * item.quantity
  }, 0)

  const total = subtotal
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{
      ...state,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      toggleCart,
      openCart,
      closeCart,
      subtotal,
      total,
      itemCount,
      getItemKey,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
