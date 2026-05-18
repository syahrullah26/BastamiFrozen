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
            'informations' => [
                'location' => $this->location,
                'phone' => $this->phone,
            ],
            'sale' => SaleResource::collection($this->whenLoaded('sale')),
            'customerPayment' => CustomerPaymentResource::collection($this->whenLoaded('customerPayment')),
        ];
    }
}
