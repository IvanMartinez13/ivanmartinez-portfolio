<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreContactMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120', 'not_regex:/[\r\n]/'],
            'email' => ['required', 'email:rfc', 'max:254'],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
        ];
    }
}
