/**
 * Product Types
 *
 * Types relatifs aux produits
 */

import type { BaseEntity } from './common';

export type Product = BaseEntity & {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image_url?: string | null;
  image?: string | null;
  active?: boolean;
};

export type ProductFilter = {
  category?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  min_price?: number;
  max_price?: number;
};

export type AddToCart = {
  product_id: number;
  quantity: number;
};

export type CartItem = {
  product: Product;
  quantity: number;
};
