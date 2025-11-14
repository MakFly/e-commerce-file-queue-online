<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Create a new order
     */
    public function store(Request $request)
    {
        $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email',
            'customer_phone' => 'required|string',
            'shipping_address' => 'required|string',
            'shipping_city' => 'required|string',
            'shipping_postal_code' => 'required|string',
            'shipping_country' => 'required|string',
            'payment_method' => 'required|string|in:credit_card,paypal,bank_transfer',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string',
        ]);

        try {
            return DB::transaction(function () use ($request) {
                // Calculate totals
                $subtotal = 0;
                $items = [];

                foreach ($request->items as $item) {
                    $product = Product::findOrFail($item['product_id']);

                    // Check stock
                    if ($product->stock < $item['quantity']) {
                        throw new \Exception("Produit '{$product->name}' en rupture de stock");
                    }

                    $itemSubtotal = $product->price * $item['quantity'];
                    $subtotal += $itemSubtotal;

                    $items[] = [
                        'product' => $product,
                        'quantity' => $item['quantity'],
                        'subtotal' => $itemSubtotal,
                    ];
                }

                // Calculate shipping and tax
                $shippingCost = $this->calculateShipping($subtotal);
                $tax = $subtotal * 0.20; // 20% VAT
                $total = $subtotal + $shippingCost + $tax;

                // Create order
                $order = Order::create([
                    'order_number' => Order::generateOrderNumber(),
                    'customer_name' => $request->customer_name,
                    'customer_email' => $request->customer_email,
                    'customer_phone' => $request->customer_phone,
                    'shipping_address' => $request->shipping_address,
                    'shipping_city' => $request->shipping_city,
                    'shipping_postal_code' => $request->shipping_postal_code,
                    'shipping_country' => $request->shipping_country,
                    'subtotal' => $subtotal,
                    'shipping_cost' => $shippingCost,
                    'tax' => $tax,
                    'total' => $total,
                    'payment_method' => $request->payment_method,
                    'payment_status' => 'pending',
                    'order_status' => 'pending',
                    'notes' => $request->notes,
                    'session_id' => $request->header('X-Session-Id'),
                ]);

                // Create order items and decrement stock
                foreach ($items as $item) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $item['product']->id,
                        'product_name' => $item['product']->name,
                        'product_price' => $item['product']->price,
                        'quantity' => $item['quantity'],
                        'subtotal' => $item['subtotal'],
                    ]);

                    $item['product']->decrementStock($item['quantity']);
                }

                // Load items for response
                $order->load('items');

                return response()->json([
                    'success' => true,
                    'message' => 'Commande créée avec succès',
                    'order' => $order,
                ], 201);
            });
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de la commande',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get order by ID
     */
    public function show($id)
    {
        $order = Order::with('items.product')->findOrFail($id);

        return response()->json($order);
    }

    /**
     * Get order by order number
     */
    public function getByOrderNumber($orderNumber)
    {
        $order = Order::with('items.product')
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        return response()->json($order);
    }

    /**
     * Process payment (mock)
     */
    public function processPayment(Request $request, $id)
    {
        $request->validate([
            'payment_method' => 'required|string',
            'card_number' => 'required_if:payment_method,credit_card',
            'card_expiry' => 'required_if:payment_method,credit_card',
            'card_cvv' => 'required_if:payment_method,credit_card',
        ]);

        $order = Order::findOrFail($id);

        // Mock payment processing
        // In a real application, you would integrate with a payment gateway
        sleep(2); // Simulate processing time

        $order->update([
            'payment_status' => 'paid',
            'order_status' => 'processing',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Paiement traité avec succès',
            'order' => $order,
        ]);
    }

    /**
     * Get user orders by session ID
     */
    public function getUserOrders(Request $request)
    {
        $sessionId = $request->header('X-Session-Id');

        $orders = Order::with('items')
            ->where('session_id', $sessionId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'orders' => $orders,
            'total' => $orders->count(),
        ]);
    }

    /**
     * Calculate shipping cost
     */
    private function calculateShipping($subtotal)
    {
        if ($subtotal >= 100) {
            return 0; // Free shipping over €100
        } elseif ($subtotal >= 50) {
            return 5.99;
        } else {
            return 9.99;
        }
    }
}
