<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseItem extends Model
{
    use HasFactory;
    protected $table = 'purchase_items';
    protected $fillable = [
        'purchase_id',
        'product_id',
        'product_unit_id',
        'quantity',
        'price',
        'remaining_qty',
        'subtotal',
    ];

    public function Purchase()
    {
        return $this->belongsTo(Purchase::class, 'purchase_id');
    }
    public function Product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
    public function ProductUnit()
    {
        return $this->belongsTo(ProductUnit::class, 'product_unit_id');
    }
}
