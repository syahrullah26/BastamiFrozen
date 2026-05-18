<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;
    protected $table = 'products';
    protected $fillable = [
        'name',
        'stock',
    ];

    public function ProductUnit()
    {
        return $this->hasMany(ProductUnit::class);
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
