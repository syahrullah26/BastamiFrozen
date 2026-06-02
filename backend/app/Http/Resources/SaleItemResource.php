<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SaleItemResource extends JsonResource
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
            'sale_id' => $this->sale_id,
            'product_id' => $this->product_id,
            'product_unit_id' => $this->product_unit_id,
            'product_name' => $this->whenLoaded('Product', fn() => $this->Product->name),

            'product' => new ProductResource($this->whenLoaded('Product')),
            'product_unit' => new ProductUnitResource($this->whenLoaded('ProductUnit')),

            'quantity' => (int) $this->quantity,
            'unit' => $this->whenLoaded('ProductUnit', fn() => $this->ProductUnit->unit_name),
            'conversion_factor' => $this->whenLoaded('ProductUnit', fn() => $this->ProductUnit->conversion_factor),
            'stock_Out' => (float) $this->quantity * $this->ProductUnit->conversion_factor,
            'price' => (float) $this->price,
            'subtotal' => (float) $this->subtotal,
            'cost_price_at_sale' => (float) $this->cost_price_at_sale,

            'gross_profit' => (float) ($this->subtotal - (($this->quantity * $this->ProductUnit->conversion_factor) * $this->cost_price_at_sale)),

        ];
    }
}
