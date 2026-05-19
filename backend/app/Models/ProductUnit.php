<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductUnit extends Model
{
    use HasFactory;

    protected $table = 'product_units';

    protected $fillable = [
        'product_id',
        'unit_name',
        'conversion_factor',
        'price',
    ];

    public function Product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function PurchaseItem()
    {
        return $this->hasMany(PurchaseItem::class);
    }
    public function SaleItem()
    {
        return $this->hasMany(SaleItem::class);
    }
}
