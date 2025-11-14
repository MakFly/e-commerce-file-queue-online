<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'customer_name',
        'customer_email',
        'customer_phone',
        'shipping_address',
        'shipping_city',
        'shipping_postal_code',
        'shipping_country',
        'subtotal',
        'shipping_cost',
        'tax',
        'total',
        'payment_method',
        'payment_status',
        'order_status',
        'notes',
        'session_id',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'tax' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public static function generateOrderNumber()
    {
        return 'ORD-' . strtoupper(uniqid()) . '-' . date('Ymd');
    }

    public function markAsPaid()
    {
        $this->update(['payment_status' => 'paid']);
    }

    public function markAsProcessing()
    {
        $this->update(['order_status' => 'processing']);
    }

    public function markAsShipped()
    {
        $this->update(['order_status' => 'shipped']);
    }

    public function markAsDelivered()
    {
        $this->update(['order_status' => 'delivered']);
    }
}
