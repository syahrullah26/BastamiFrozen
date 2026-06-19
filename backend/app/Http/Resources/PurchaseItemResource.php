<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'purchase_id'       => $this->purchase_id,
            'product_id'        => $this->product_id,
            'product_unit_id'   => $this->product_unit_id,

            'product_name'      => $this->whenLoaded('Product', fn() => $this->Product->name),
            'product_image'     => $this->whenLoaded('Product', fn() => $this->Product->image),
            'product_unit_name' => $this->whenLoaded('ProductUnit', fn() => $this->ProductUnit->unit_name),

            'quantity'          => (int) $this->quantity,
            'price'             => (float) $this->price,
            'subtotal'          => (float) $this->subtotal,

            'cost_price'        => (int) $this->price * $this->ProductUnit->conversion_factor,
            'remaining_qty'     => (int) $this->remaining_qty,
            'batch_status'      => $this->remaining_qty <= 0 ? 'habis' : 'tersedia',
            'product'           => new ProductResource($this->whenLoaded('Product')),
        ];
    }
}
