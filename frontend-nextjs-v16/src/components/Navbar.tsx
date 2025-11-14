'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';

export default function Navbar() {
  const pathname = usePathname();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  // Don't show navbar on admin or waiting room pages
  if (pathname === '/admin' || pathname === '/') return null;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/shop" className="text-2xl font-bold text-blue-600">
              🛒 E-Shop
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link
                href="/shop"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/shop'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Boutique
              </Link>
              <Link
                href="/orders"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/orders'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Mes Commandes
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <Link
              href="/cart"
              className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
