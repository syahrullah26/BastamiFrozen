<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    use HasFactory;
    protected $table = 'sales';

    protected $fillable = [
        'customer_id',
        'invoice_number',
        'total_amount',
        'remaining_bill',
        'transaction_date',
        'status',
    ];

    public function Customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }
    public function SaleItem()
    {
        return $this->hasMany(SaleItem::class);
    }
}
