<?php

namespace App\Http\Requests\Product;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CreateRequest extends FormRequest
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
            'name' => 'required | max:255 | string',
            'stock' => 'required | integer |min:0 ',

            'units' => 'required | array | min: 1',
            'units.*.unit_name' => 'required | max:255 | string',
            'units.*.conversion_factor' => 'required | integer |min:0 ',
            'units.*.price' => 'required | numeric |min:0 ',
        ];
    }
}
