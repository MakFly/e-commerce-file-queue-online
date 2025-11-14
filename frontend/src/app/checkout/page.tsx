'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useQueue } from '@/hooks/useQueue';
import { ecommerceApi, CreateOrderData } from '@/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getCartTotal, clearCart } = useCart();
  const { sessionId } = useQueue();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
    shipping_city: '',
    shipping_postal_code: '',
    shipping_country: 'France',
    payment_method: 'credit_card' as 'credit_card' | 'paypal' | 'bank_transfer',
    card_number: '',
    card_expiry: '',
    card_cvv: '',
    notes: '',
  });

  const subtotal = getCartTotal();
  const shipping = subtotal >= 100 ? 0 : subtotal >= 50 ? 5.99 : 9.99;
  const tax = subtotal * 0.20;
  const total = subtotal + shipping + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData: CreateOrderData = {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        shipping_address: formData.shipping_address,
        shipping_city: formData.shipping_city,
        shipping_postal_code: formData.shipping_postal_code,
        shipping_country: formData.shipping_country,
        payment_method: formData.payment_method,
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
        notes: formData.notes || undefined,
      };

      const response = await ecommerceApi.createOrder(orderData, sessionId);

      if (response.success) {
        // Process payment
        await ecommerceApi.processPayment(
          response.order.id,
          {
            payment_method: formData.payment_method,
            card_number: formData.card_number,
            card_expiry: formData.card_expiry,
            card_cvv: formData.card_cvv,
          },
          sessionId
        );

        clearCart();
        router.push(`/confirmation?order=${response.order.order_number}`);
      }
    } catch (error: any) {
      alert('Erreur lors de la commande: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    router.push('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Finaliser la commande</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Informations client</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  placeholder="Nom complet *"
                  className="px-4 py-2 border rounded-lg"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                />
                <input
                  type="email"
                  required
                  placeholder="Email *"
                  className="px-4 py-2 border rounded-lg"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                />
                <input
                  type="tel"
                  required
                  placeholder="Téléphone *"
                  className="px-4 py-2 border rounded-lg"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                />
              </div>
            </div>

            {/* Shipping */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Adresse de livraison</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="Adresse *"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.shipping_address}
                  onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Ville *"
                    className="px-4 py-2 border rounded-lg"
                    value={formData.shipping_city}
                    onChange={(e) => setFormData({ ...formData, shipping_city: e.target.value })}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Code postal *"
                    className="px-4 py-2 border rounded-lg"
                    value={formData.shipping_postal_code}
                    onChange={(e) => setFormData({ ...formData, shipping_postal_code: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Paiement</h2>
              <div className="space-y-4">
                <select
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as any })}
                >
                  <option value="credit_card">Carte bancaire</option>
                  <option value="paypal">PayPal</option>
                  <option value="bank_transfer">Virement bancaire</option>
                </select>

                {formData.payment_method === 'credit_card' && (
                  <>
                    <input
                      type="text"
                      required
                      placeholder="Numéro de carte"
                      maxLength={16}
                      className="w-full px-4 py-2 border rounded-lg"
                      value={formData.card_number}
                      onChange={(e) => setFormData({ ...formData, card_number: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        required
                        placeholder="MM/AA"
                        className="px-4 py-2 border rounded-lg"
                        value={formData.card_expiry}
                        onChange={(e) => setFormData({ ...formData, card_expiry: e.target.value })}
                      />
                      <input
                        type="text"
                        required
                        placeholder="CVV"
                        maxLength={3}
                        className="px-4 py-2 border rounded-lg"
                        value={formData.card_cvv}
                        onChange={(e) => setFormData({ ...formData, card_cvv: e.target.value })}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-4">Récapitulatif</h2>
              <div className="space-y-3 mb-4">
                {cart.map(item => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span>{item.product.name} x{item.quantity}</span>
                    <span>€{(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Livraison</span>
                  <span>{shipping === 0 ? 'Gratuite' : `€${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>TVA (20%)</span>
                  <span>€{tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                {loading ? 'Traitement...' : 'Confirmer et payer'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
