<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
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
            'name' => $this->name,
            'location' => $this->location,
            'phone' => $this->phone,
            'remaining_bill' => $this->remaining_bills,
            'sale' => SaleResource::collection($this->whenLoaded('sale')),
            'customer_payment' => CustomerPaymentResource::collection($this->whenLoaded('customerPayment')),
        ];
    }
}
