'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useQueue } from '@/hooks/useQueue';
import { ecommerceApi, Order } from '@/lib/api';

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const { sessionId } = useQueue();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderNumber && sessionId) {
      fetchOrder();
    }
  }, [orderNumber, sessionId]);

  const fetchOrder = async () => {
    try {
      const data = await ecommerceApi.getOrderByNumber(orderNumber!, sessionId);
      setOrder(data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Commande introuvable</h2>
          <Link href="/shop" className="text-blue-600 hover:underline">
            Retour à la boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">Commande confirmée !</h1>
            <p className="text-gray-600">Merci pour votre commande</p>
          </div>

          <div className="border-t border-b py-6 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Numéro de commande</p>
                <p className="font-mono font-bold">{order.order_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{order.customer_email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="font-bold text-lg">€{order.total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="font-bold mb-4">Articles commandés</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                  </div>
                  <p className="font-medium">€{item.subtotal.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              📧 Un email de confirmation a été envoyé à <strong>{order.customer_email}</strong>
            </p>
          </div>

          <div className="flex gap-4">
            <Link
              href="/orders"
              className="flex-1 py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 font-medium"
            >
              Voir mes commandes
            </Link>
            <Link
              href="/shop"
              className="flex-1 py-3 bg-gray-200 text-gray-700 text-center rounded-lg hover:bg-gray-300 font-medium"
            >
              Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
