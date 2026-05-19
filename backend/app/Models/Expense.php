<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use HasFactory;
    protected $table = 'expenses';
    protected $fillable = [
        'type',
        'amount',
        'expense_date',
        'notes',
        'attendance_id',
        'supplier_payment_id'
    ];

    public function Attendance()
    {
        return $this->belongsTo(Attendance::class, 'attendace_id');
    }
    public function SupplierPayment()
    {
        return $this->belongsTo(SupplierPayment::class, 'supplier_payment_id');
    }
}
