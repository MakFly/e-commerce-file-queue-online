'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQueue } from '@/hooks/useQueue';
import { ecommerceApi, Order } from '@/lib/api';

export default function OrdersPage() {
  const { sessionId } = useQueue();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      fetchOrders();
    }
  }, [sessionId]);

  const fetchOrders = async () => {
    try {
      const data = await ecommerceApi.getUserOrders(sessionId);
      setOrders(data.orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'En attente',
      processing: 'En traitement',
      shipped: 'Expédiée',
      delivered: 'Livrée',
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Mes Commandes</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold mb-4">Aucune commande</h2>
            <p className="text-gray-600 mb-6">Vous n'avez pas encore passé de commande</p>
            <Link href="/shop" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Commencer mes achats
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Commande</p>
                    <p className="font-mono font-bold">{order.order_number}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(order.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(order.order_status)}`}>
                    {getStatusLabel(order.order_status)}
                  </span>
                </div>

                <div className="border-t pt-4">
                  <div className="space-y-2 mb-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.product_name} <span className="text-gray-600">x{item.quantity}</span>
                        </span>
                        <span>€{item.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-2xl font-bold">€{order.total.toFixed(2)}</p>
                    </div>
                    <Link
                      href={`/confirmation?order=${order.order_number}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Voir les détails
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
