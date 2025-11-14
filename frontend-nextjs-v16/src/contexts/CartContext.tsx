'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem } from '@/lib/api';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  isInCart: (productId: number) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('shopping_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('shopping_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);

      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        );
      }

      return [...prevCart, { product, quantity: Math.min(quantity, product.stock) }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    setCart((prevCart) => {
      if (quantity <= 0) {
        return prevCart.filter((item) => item.product.id !== productId);
      }

      return prevCart.map((item) => {
        if (item.product.id === productId) {
          return { ...item, quantity: Math.min(quantity, item.product.stock) };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('shopping_cart');
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const isInCart = (productId: number) => {
    return cart.some((item) => item.product.id === productId);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
