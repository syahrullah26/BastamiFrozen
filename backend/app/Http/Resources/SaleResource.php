<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SaleResource extends JsonResource
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
            'customer_id' => $this->customer_id,
            'customer_name' => $this->whenLoaded('Customer', fn() => $this->Customer->name),
            'invoice_number' => $this->invoice_number,

            'amount' => [
                'total_amount' => $this->total_amount,
                'remaining_bill' => $this->remaining_bill,
            ],
            'transaction_date' => $this->transaction_date,
            'status' => $this->status,
            'items' => SaleItemResource::collection($this->whenLoaded('SaleItem')),
            'customer' => new CustomerResource($this->whenLoaded('Customer')),
        ];
    }
}
