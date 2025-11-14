<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\QueueController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Queue management routes
Route::prefix('queue')->group(function () {
    Route::get('/status', [QueueController::class, 'status']);
    Route::post('/heartbeat', [QueueController::class, 'heartbeat']);
    Route::post('/release', [QueueController::class, 'release']);
    Route::get('/stats', [QueueController::class, 'stats']);
    Route::post('/cleanup', [QueueController::class, 'cleanup']);
});

// E-commerce routes (protected with queue check)
Route::middleware(['queue.check'])->group(function () {
    // Products
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{id}', [ProductController::class, 'show']);
    Route::get('/categories', [ProductController::class, 'categories']);
    Route::post('/products/check-stock', [ProductController::class, 'checkStock']);

    // Orders
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::get('/orders/number/{orderNumber}', [OrderController::class, 'getByOrderNumber']);
    Route::post('/orders/{id}/payment', [OrderController::class, 'processPayment']);
    Route::get('/my-orders', [OrderController::class, 'getUserOrders']);

    // User info
    Route::get('/user', function (Request $request) {
        return response()->json([
            'session_id' => $request->header('X-Session-Id'),
            'message' => 'You have access to the application'
        ]);
    });
});

// Health check
Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

// Admin routes
Route::prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/stats', [AdminController::class, 'stats']);
    Route::get('/history', [AdminController::class, 'history']);
    Route::post('/kick-user', [AdminController::class, 'kickUser']);
    Route::post('/clear-queue', [AdminController::class, 'clearQueue']);
    Route::post('/update-config', [AdminController::class, 'updateConfig']);
    Route::get('/redis-info', [AdminController::class, 'redisInfo']);
});
