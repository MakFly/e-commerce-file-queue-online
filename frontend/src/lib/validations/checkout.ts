/**
 * Checkout Form Validation Schema
 *
 * Zod schemas for checkout form validation with type inference
 */

import { z } from 'zod';

// Customer Information Schema
export const customerInfoSchema = z.object({
  customer_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  customer_email: z
    .string()
    .email('Invalid email address')
    .min(5, 'Email is required')
    .max(255, 'Email must be less than 255 characters'),
  customer_phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be less than 15 digits'),
});

// Shipping Address Schema
export const shippingAddressSchema = z.object({
  shipping_address: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(255, 'Address must be less than 255 characters'),
  shipping_city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must be less than 100 characters'),
  shipping_postal_code: z
    .string()
    .regex(/^[0-9]{5}(-[0-9]{4})?$/, 'Invalid postal code (e.g., 75001 or 75001-1234)')
    .min(5, 'Postal code is required')
    .max(10, 'Postal code must be less than 10 characters'),
  shipping_country: z
    .string()
    .min(2, 'Country must be at least 2 characters')
    .max(100, 'Country must be less than 100 characters')
    .default('France'),
});

// Payment Information Schema
export const paymentInfoSchema = z.object({
  payment_method: z.enum(['credit_card', 'debit_card', 'paypal'], {
    required_error: 'Payment method is required',
  }),
  card_number: z
    .string()
    .regex(/^[0-9]{16}$/, 'Card number must be 16 digits')
    .optional()
    .or(z.literal('')),
  card_expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/[0-9]{2}$/, 'Expiry must be in MM/YY format')
    .optional()
    .or(z.literal('')),
  card_cvv: z
    .string()
    .regex(/^[0-9]{3,4}$/, 'CVV must be 3 or 4 digits')
    .optional()
    .or(z.literal('')),
});

// Order Item Schema
export const orderItemSchema = z.object({
  product_id: z.number().int().positive('Product ID must be positive'),
  quantity: z.number().int().positive('Quantity must be at least 1').max(100, 'Quantity cannot exceed 100'),
});

// Complete Checkout Schema
export const checkoutSchema = customerInfoSchema
  .merge(shippingAddressSchema)
  .merge(paymentInfoSchema)
  .extend({
    items: z.array(orderItemSchema).min(1, 'Cart must have at least one item'),
  })
  .refine(
    (data) => {
      // If payment method is credit_card or debit_card, card details are required
      if (data.payment_method === 'credit_card' || data.payment_method === 'debit_card') {
        return !!data.card_number && !!data.card_expiry && !!data.card_cvv;
      }
      return true;
    },
    {
      message: 'Card details are required for card payments',
      path: ['card_number'],
    }
  );

// Type inference
export type CustomerInfo = z.infer<typeof customerInfoSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type PaymentInfo = z.infer<typeof paymentInfoSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
