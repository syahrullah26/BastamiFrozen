<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupplierPaymentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'supplier_id'   => $this->supplier_id,
            'amount'        => (float) $this->amount,
            'payment_date'  => $this->payment_date,
            'notes'         => $this->notes,
            'supplier'      => new SupplierResource($this->whenLoaded('Supplier')),
            'expense'       => new ExpenseResource($this->whenLoaded('Expense')),
            'created_at'    => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at'    => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
