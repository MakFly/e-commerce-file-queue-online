'use server';

/**
 * Order Server Actions
 *
 * Server-side actions for order creation and management
 * These run on the server and can be called directly from client components
 */

import { revalidatePath } from 'next/cache';
import { apiClient, handleApiError, type CreateOrderData, type Order } from '@/lib/api-client';
import { checkoutSchema } from '@/lib/validations/checkout';

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; errors?: Record<string, string[]> };

/**
 * Create a new order
 */
export async function createOrderAction(
  formData: CreateOrderData,
  sessionId: string
): Promise<ActionResult<Order>> {
  try {
    // Validate form data
    const validatedData = checkoutSchema.parse(formData);

    // Create order via API
    const response = await apiClient.createOrder(validatedData, sessionId);

    // Revalidate orders page
    revalidatePath('/orders');
    revalidatePath('/cart');

    return {
      success: true,
      data: response.order,
    };
  } catch (error: any) {
    const apiError = handleApiError(error);

    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      const zodError = error as any;
      const fieldErrors: Record<string, string[]> = {};

      zodError.errors?.forEach((err: any) => {
        const field = err.path.join('.');
        if (!fieldErrors[field]) {
          fieldErrors[field] = [];
        }
        fieldErrors[field].push(err.message);
      });

      return {
        success: false,
        error: 'Validation failed',
        errors: fieldErrors,
      };
    }

    return {
      success: false,
      error: apiError.message,
      errors: apiError.errors,
    };
  }
}

/**
 * Get user orders
 */
export async function getUserOrdersAction(
  sessionId: string
): Promise<ActionResult<Order[]>> {
  try {
    const response = await apiClient.getOrders(sessionId);

    return {
      success: true,
      data: response.orders,
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
 * Get order by ID
 */
export async function getOrderByIdAction(
  orderId: number,
  sessionId: string
): Promise<ActionResult<Order>> {
  try {
    const response = await apiClient.getOrder(orderId, sessionId);

    return {
      success: true,
      data: response.order,
    };
  } catch (error) {
    const apiError = handleApiError(error);

    return {
      success: false,
      error: apiError.message,
    };
  }
}
