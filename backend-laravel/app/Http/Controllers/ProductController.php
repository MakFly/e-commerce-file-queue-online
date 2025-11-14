<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Get all products
     */
    public function index(Request $request)
    {
        $query = Product::where('active', true);

        // Filter by category
        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        // Search
        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Sort
        $sortBy = $request->get('sort', 'name');
        $sortOrder = $request->get('order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $products = $query->get();

        return response()->json([
            'products' => $products,
            'total' => $products->count(),
        ]);
    }

    /**
     * Get a single product
     */
    public function show($id)
    {
        $product = Product::findOrFail($id);

        return response()->json($product);
    }

    /**
     * Get product categories
     */
    public function categories()
    {
        $categories = Product::where('active', true)
            ->select('category')
            ->distinct()
            ->pluck('category');

        return response()->json($categories);
    }

    /**
     * Check product stock
     */
    public function checkStock(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $stockStatus = [];
        $allAvailable = true;

        foreach ($request->items as $item) {
            $product = Product::find($item['product_id']);
            $available = $product->stock >= $item['quantity'];

            if (!$available) {
                $allAvailable = false;
            }

            $stockStatus[] = [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'requested' => $item['quantity'],
                'available' => $product->stock,
                'is_available' => $available,
            ];
        }

        return response()->json([
            'all_available' => $allAvailable,
            'items' => $stockStatus,
        ]);
    }
}
