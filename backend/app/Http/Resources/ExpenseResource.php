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
            'type' => $this->type,
            'amount' => $this->amount,
            'expense_date' => $this->expense_date,
            'notes' => $this->notes,
            'attendance' => new AttendanceResource($this->whenLoaded('Attendance')),
            'supplier_payment' => new SupplierPaymentResource($this->whenLoaded('SupplierPayment')),
        ];
    }
}
