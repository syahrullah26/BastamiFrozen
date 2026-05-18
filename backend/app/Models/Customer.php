<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;
    protected $table = 'customers';
    protected $fillable = [
        'name',
        'location',
        'phone',
    ];

    public function Sale()
    {
        return $this->hasMany(Sale::class);
    }

    public function CustomerPayment()
    {
        return $this->hasMany(CustomerPayment::class);
    }
}
