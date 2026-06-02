<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExpenseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'amount' => $this->amount,
            'expense_date' => $this->expense_date,
            'notes' => $this->notes,
            'attendance_id' => $this->attendance_id,
            'supplier_payment_id' => $this->supplier_payment_id,
            'attendance' => new AttendanceResource($this->whenLoaded('Attendance')),
            'supplier_payment' => new SupplierPaymentResource($this->whenLoaded('SupplierPayment')),
        ];
    }
}
