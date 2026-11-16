<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfessionalProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canAccessAdmin() === true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'public_name' => ['required', 'string', 'max:160'],
            'headline' => ['required', 'string', 'max:160'],
            'specialty' => ['required', 'string', 'max:200'],
            'short_description' => ['required', 'string', 'max:500'],
            'biography' => ['required', 'string', 'max:6000'],
            'location' => ['nullable', 'string', 'max:160'],
            'availability_label' => ['required', 'string', 'max:160'],
            'experience_years' => ['nullable', 'numeric', 'min:0', 'max:80'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'photo_url' => ['nullable', 'url:http,https', 'max:2048'],
            'links' => ['required', 'array'],
            'links.linkedin' => ['nullable', 'url:https', 'max:2048'],
            'links.github' => ['nullable', 'url:https', 'max:2048'],
            'links.website' => ['nullable', 'url:https', 'max:2048'],
            'links.cv' => ['nullable', 'url:https', 'max:2048'],
        ];
    }
}
