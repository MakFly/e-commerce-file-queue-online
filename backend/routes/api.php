<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\QueueController;

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

// Protected routes (with queue check)
Route::middleware(['queue.check'])->group(function () {
    Route::get('/products', function () {
        return response()->json([
            'products' => [
                ['id' => 1, 'name' => 'Product 1', 'price' => 99.99],
                ['id' => 2, 'name' => 'Product 2', 'price' => 149.99],
                ['id' => 3, 'name' => 'Product 3', 'price' => 199.99],
            ]
        ]);
    });

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
