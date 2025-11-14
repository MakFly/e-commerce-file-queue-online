/**
 * Product Validation Schema
 *
 * Zod schemas for product-related validation
 */

import { z } from 'zod';

// Product Schema
export const productSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  category: z.string().min(1).max(100),
  image_url: z.string().url().optional().or(z.literal('')),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Product Filter Schema
export const productFilterSchema = z.object({
  category: z.string().optional(),
  min_price: z.number().positive().optional(),
  max_price: z.number().positive().optional(),
  search: z.string().optional(),
});

// Add to Cart Schema
export const addToCartSchema = z.object({
  product_id: z.number().int().positive('Product ID must be positive'),
  quantity: z
    .number()
    .int()
    .positive('Quantity must be at least 1')
    .max(100, 'Quantity cannot exceed 100'),
});

// Type inference
export type Product = z.infer<typeof productSchema>;
export type ProductFilter = z.infer<typeof productFilterSchema>;
export type AddToCart = z.infer<typeof addToCartSchema>;
