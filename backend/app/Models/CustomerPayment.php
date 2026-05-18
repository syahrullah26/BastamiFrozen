<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomerPayment extends Model
{
    use HasFactory;

    protected $table = 'customer_payments';

    protected $fillable = [
        'customer_id',
        'amount',
        'payment_date',
        'notes',
    ];

    public function Customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }
}
