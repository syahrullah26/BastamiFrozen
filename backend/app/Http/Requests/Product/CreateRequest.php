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

    protected function prepareForValidation()
    {
        if ($this->has('units') && is_string($this->units)) {
            $this->merge([
                'units' => json_decode($this->units, true),
            ]);
        }
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
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:8192',
            'stock' => 'required | integer |min:0 ',

            'units' => 'required | array | min: 1',
            'units.*.unit_name' => 'required | max:255 | string',
            'units.*.conversion_factor' => 'required | integer |min:0 ',
            'units.*.price' => 'required | numeric |min:0 ',
        ];
    }
}
