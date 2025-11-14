'use client';

/**
 * Checkout Form Component
 *
 * Modern form using React Hook Form + Zod validation + Server Actions
 * This is an example of best practices for Next.js 14+ forms
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutSchema, type CheckoutFormData } from '@/lib/validations/checkout';
import { createOrderAction } from '@/app/actions/order';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface CheckoutFormProps {
  sessionId: string;
  items: {
    product_id: number;
    quantity: number;
  }[];
  onSuccess?: (orderNumber: string) => void;
}

export function CheckoutForm({ sessionId, items, onSuccess }: CheckoutFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shipping_country: 'France',
      payment_method: 'credit_card',
      items,
    },
  });

  const paymentMethod = watch('payment_method');

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);

    try {
      const result = await createOrderAction(data, sessionId);

      if (result.success) {
        toast.success('Order placed successfully!', {
          description: `Order #${result.data.order_number}`,
        });

        if (onSuccess) {
          onSuccess(result.data.order_number);
        }

        // Redirect to confirmation page
        router.push(`/confirmation?order=${result.data.order_number}`);
      } else {
        toast.error('Failed to create order', {
          description: result.error,
        });

        // Handle field-specific errors
        if (result.errors) {
          console.error('Validation errors:', result.errors);
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred', {
        description: 'Please try again later.',
      });
      console.error('Checkout error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="customer_name">Full Name</Label>
            <Input
              id="customer_name"
              {...register('customer_name')}
              placeholder="John Doe"
              className={errors.customer_name ? 'border-red-500' : ''}
            />
            {errors.customer_name && (
              <p className="text-sm text-red-500 mt-1">{errors.customer_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="customer_email">Email</Label>
            <Input
              id="customer_email"
              type="email"
              {...register('customer_email')}
              placeholder="john@example.com"
              className={errors.customer_email ? 'border-red-500' : ''}
            />
            {errors.customer_email && (
              <p className="text-sm text-red-500 mt-1">{errors.customer_email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="customer_phone">Phone</Label>
            <Input
              id="customer_phone"
              {...register('customer_phone')}
              placeholder="+33612345678"
              className={errors.customer_phone ? 'border-red-500' : ''}
            />
            {errors.customer_phone && (
              <p className="text-sm text-red-500 mt-1">{errors.customer_phone.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="shipping_address">Address</Label>
            <Input
              id="shipping_address"
              {...register('shipping_address')}
              placeholder="123 Main Street"
              className={errors.shipping_address ? 'border-red-500' : ''}
            />
            {errors.shipping_address && (
              <p className="text-sm text-red-500 mt-1">{errors.shipping_address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shipping_city">City</Label>
              <Input
                id="shipping_city"
                {...register('shipping_city')}
                placeholder="Paris"
                className={errors.shipping_city ? 'border-red-500' : ''}
              />
              {errors.shipping_city && (
                <p className="text-sm text-red-500 mt-1">{errors.shipping_city.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="shipping_postal_code">Postal Code</Label>
              <Input
                id="shipping_postal_code"
                {...register('shipping_postal_code')}
                placeholder="75001"
                className={errors.shipping_postal_code ? 'border-red-500' : ''}
              />
              {errors.shipping_postal_code && (
                <p className="text-sm text-red-500 mt-1">{errors.shipping_postal_code.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="shipping_country">Country</Label>
            <Input
              id="shipping_country"
              {...register('shipping_country')}
              defaultValue="France"
              className={errors.shipping_country ? 'border-red-500' : ''}
            />
            {errors.shipping_country && (
              <p className="text-sm text-red-500 mt-1">{errors.shipping_country.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="payment_method">Payment Method</Label>
            <Select
              defaultValue="credit_card"
              onValueChange={(value) => setValue('payment_method', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="debit_card">Debit Card</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
              </SelectContent>
            </Select>
            {errors.payment_method && (
              <p className="text-sm text-red-500 mt-1">{errors.payment_method.message}</p>
            )}
          </div>

          {(paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && (
            <>
              <div>
                <Label htmlFor="card_number">Card Number</Label>
                <Input
                  id="card_number"
                  {...register('card_number')}
                  placeholder="1234567890123456"
                  maxLength={16}
                  className={errors.card_number ? 'border-red-500' : ''}
                />
                {errors.card_number && (
                  <p className="text-sm text-red-500 mt-1">{errors.card_number.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="card_expiry">Expiry (MM/YY)</Label>
                  <Input
                    id="card_expiry"
                    {...register('card_expiry')}
                    placeholder="12/25"
                    className={errors.card_expiry ? 'border-red-500' : ''}
                  />
                  {errors.card_expiry && (
                    <p className="text-sm text-red-500 mt-1">{errors.card_expiry.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="card_cvv">CVV</Label>
                  <Input
                    id="card_cvv"
                    {...register('card_cvv')}
                    placeholder="123"
                    maxLength={4}
                    className={errors.card_cvv ? 'border-red-500' : ''}
                  />
                  {errors.card_cvv && (
                    <p className="text-sm text-red-500 mt-1">{errors.card_cvv.message}</p>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? 'Processing...' : 'Place Order'}
      </Button>
    </form>
  );
}
