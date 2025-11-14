'use server';

/**
 * Product Server Actions
 *
 * Server-side actions for product fetching
 */

import { apiClient, handleApiError, type Product } from '@/lib/api-client';

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Get all products
 */
export async function getProductsAction(params?: {
  category?: string;
  sessionId?: string;
}): Promise<ActionResult<Product[]>> {
  try {
    const response = await apiClient.getProducts(params);

    return {
      success: true,
      data: response.products,
    };
  } catch (error) {
    const apiError = handleApiError(error);

    return {
      success: false,
      error: apiError.message,
    };
  }
}

/**
 * Get product by ID
 */
export async function getProductByIdAction(
  id: number,
  sessionId?: string
): Promise<ActionResult<Product>> {
  try {
    const response = await apiClient.getProduct(id, sessionId);

    return {
      success: true,
      data: response.product,
    };
  } catch (error) {
    const apiError = handleApiError(error);

    return {
      success: false,
      error: apiError.message,
    };
  }
}
