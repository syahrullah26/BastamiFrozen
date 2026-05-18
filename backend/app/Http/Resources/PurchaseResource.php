<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseResource extends JsonResource
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
            'purchase_number' => $this->purchase_number,
            'supplier_id' => $this->supplier_id,
            'date' => $this->date,
            'total_amount' => $this->total_amount,
            'supplier' => new SupplierResource($this->whenLoaded('Supplier')),
            'items' => PurchaseItemResource::collection($this->whenLoaded('PurchaseItem')),

        ];
    }
}
