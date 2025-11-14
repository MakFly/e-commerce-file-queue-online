'use client';

import { useState, useEffect } from 'react';
import { useQueue } from '@/hooks/useQueue';
import { ecommerceApi, Product } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import QueueWaitingRoom from '@/components/QueueWaitingRoom';

export default function ShopPage() {
  const { sessionId, queueStatus, isLoading: queueLoading } = useQueue();
  const { addToCart, isInCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    if (sessionId && queueStatus?.status === 'active') {
      fetchProducts();
      fetchCategories();
    }
  }, [sessionId, queueStatus]);

  const fetchProducts = async () => {
    try {
      const data = await ecommerceApi.getProducts(
        { category: selectedCategory !== 'all' ? selectedCategory : undefined },
        sessionId
      );
      setProducts(data.products);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const cats = await ecommerceApi.getCategories(sessionId);
      setCategories(['all', ...cats]);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  if (queueLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div></div>;
  }

  if (queueStatus?.status === 'waiting') {
    return <QueueWaitingRoom queueStatus={queueStatus} onRetry={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Boutique</h1>

        <div className="mb-6 flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setLoading(true); fetchProducts(); }}
              className={`px-4 py-2 rounded-lg ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {cat === 'all' ? 'Tous' : cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                  <span className="text-white text-4xl">📦</span>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-blue-600">€{product.price.toFixed(2)}</span>
                    <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.stock > 0 ? `Stock: ${product.stock}` : 'Rupture'}
                    </span>
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0 || isInCart(product.id)}
                    className={`w-full py-2 rounded-lg font-medium transition-colors ${
                      product.stock === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : isInCart(product.id)
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {product.stock === 0 ? 'Rupture de stock' : isInCart(product.id) ? 'Dans le panier ✓' : 'Ajouter au panier'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
