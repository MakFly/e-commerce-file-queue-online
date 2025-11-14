'use client';

import { useState, useEffect } from 'react';
import { productApi } from '@/lib/api';

interface Product {
  id: number;
  name: string;
  price: number;
}

interface ProductListProps {
  sessionId: string;
}

export default function ProductList({ sessionId }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productApi.getProducts(sessionId);
        setProducts(data.products || []);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchProducts();
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Our Store
          </h1>
          <p className="text-lg text-gray-600">
            You have successfully entered the site!
          </p>
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-100 border border-green-300 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-green-800 font-medium">Active Session</span>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="h-48 bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                <svg
                  className="w-20 h-20 text-white opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">
                    ${product.price.toFixed(2)}
                  </span>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No products available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
