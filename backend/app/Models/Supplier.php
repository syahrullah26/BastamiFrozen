<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory;

    protected $table = 'suppliers';

    protected $fillable = [
        'name',
        'phone',
        'address',
    ];

    public function Purchase()
    {
        return $this->hasMany(Purchase::class);
    }

    public function SupplierPayment()
    {
        return $this->hasMany(SupplierPayment::class);
    }
}
