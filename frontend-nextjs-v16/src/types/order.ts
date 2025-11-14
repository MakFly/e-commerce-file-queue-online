/**
 * Order Types
 *
 * Types relatifs aux commandes
 */

import type { BaseEntity } from './common';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type PaymentMethod = 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer';

export type OrderItem = {
  id: number;
  product_id: number;
  product_name: string;
  product_price?: number;
  quantity: number;
  price: number;
  subtotal?: number;
};

export type Order = BaseEntity & {
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  payment_method: string | PaymentMethod;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  status: OrderStatus | string;
  payment_status?: string;
  order_status?: string;
  notes?: string | null;
  session_id?: string | null;
  items: OrderItem[];
};

export type CreateOrderData = {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  payment_method: PaymentMethod;
  card_number?: string;
  card_expiry?: string;
  card_cvv?: string;
  items: {
    product_id: number;
    quantity: number;
  }[];
  notes?: string;
};

export type PaymentData = {
  payment_method: string;
  card_number?: string;
  card_expiry?: string;
  card_cvv?: string;
};
