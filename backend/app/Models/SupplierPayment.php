<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupplierPayment extends Model
{
    use HasFactory;
    protected $table = 'supplier_payments';
    protected $fillable = [
        'supplier_id',
        'amount',
        'payment_date',
        'notes',
    ];

    public function Supplier()
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }

    public function Expense()
    {
        return $this->hasOne(Expense::class);
    }
}
