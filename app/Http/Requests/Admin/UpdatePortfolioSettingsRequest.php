<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePortfolioSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canAccessAdmin() === true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'site_title' => ['required', 'string', 'max:160'],
            'default_meta_description' => ['required', 'string', 'max:250'],
            'locale' => ['required', 'regex:/^[a-z]{2}(-[A-Z]{2})?$/'],
            'timezone' => ['required', 'timezone'],
            'footer_note' => ['nullable', 'string', 'max:200'],
        ];
    }
}
