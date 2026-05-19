<?php

namespace App\Http\Requests\Purchase;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'supplier_id'      => 'required|exists:suppliers,id',
            'transaction_date' => 'required|date',
            'status'   => 'required|in:paid,unpaid',

            'items'                    => 'required|array|min:1',
            'items.*.product_id'       => 'required|exists:products,id',
            'items.*.product_unit_id'  => 'required|exists:product_units,id',
            'items.*.quantity'         => 'required|integer|min:1',
            'items.*.price'            => 'required|numeric|min:0',
        ];
    }
}
