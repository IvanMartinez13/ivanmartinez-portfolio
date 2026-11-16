<?php

namespace App\Http\Requests\Admin;

use App\Models\Technology;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveTechnologyRequest extends FormRequest
{
    public function authorize(): bool
    {
        $technology = $this->route('technology');

        return $technology instanceof Technology
            ? $this->user()?->can('update', $technology) === true
            : $this->user()?->can('create', Technology::class) === true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $technology = $this->route('technology');

        return [
            'name' => ['required', 'string', 'max:100'],
            'slug' => ['required', 'string', 'max:120', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('technologies', 'slug')->ignore($technology?->id)],
            'category' => ['required', 'string', 'max:100'],
            'icon' => ['nullable', 'string', 'max:120'],
            'position' => ['required', 'integer', 'min:0', 'max:1000'],
            'is_visible' => ['required', 'boolean'],
        ];
    }
}
