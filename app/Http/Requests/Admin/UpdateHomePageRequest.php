<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateHomePageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canAccessAdmin() === true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:160'],
            'status' => ['required', Rule::in(['draft', 'published'])],
            'profileSummary' => ['required', 'string', 'max:500'],
            'sections' => ['required', 'array', 'size:6'],
            'sections.*.id' => ['required', 'integer', 'exists:portfolio_sections,id'],
            'sections.*.key' => ['required', Rule::in(['hero', 'projects', 'experience', 'about', 'stack', 'contact'])],
            'sections.*.navLabel' => ['nullable', 'string', 'max:80'],
            'sections.*.position' => ['required', 'integer', 'min:0', 'max:1000', 'distinct'],
            'sections.*.visible' => ['required', 'boolean'],
            'sections.*.content' => ['required', 'array'],
            'sections.*.content.eyebrow' => ['sometimes', 'nullable', 'string', 'max:120'],
            'sections.*.content.headline' => ['sometimes', 'nullable', 'string', 'max:240'],
            'sections.*.content.title' => ['sometimes', 'nullable', 'string', 'max:200'],
            'sections.*.content.description' => ['sometimes', 'nullable', 'string', 'max:700'],
        ];
    }
}
