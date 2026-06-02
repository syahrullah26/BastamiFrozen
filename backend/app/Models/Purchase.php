<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Purchase extends Model
{
    use HasFactory;
    protected $table = 'purchases';
    protected $fillable = [
        'supplier_id',
        'invoice_number',
        'total_amount',
        'remaining_bill',
        'transaction_date',
        'status',
    ];

    public function Supplier()
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }
    public function PurchaseItem()
    {
        return $this->hasMany(PurchaseItem::class, 'purchase_id', 'id');
    }
}
