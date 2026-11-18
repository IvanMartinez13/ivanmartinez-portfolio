<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class SaveResumeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canAccessAdmin() === true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $sections = ['experience', 'skills', 'education', 'certifications', 'languages', 'projects'];

        return [
            'config' => ['required', 'array'],
            'config.section_order' => ['required', 'array', 'size:6'],
            'config.section_order.*' => ['required', 'string', Rule::in($sections), 'distinct'],
            'config.visible_sections' => ['required', 'array'],
            'config.visible_sections.*' => ['required', 'string', Rule::in($sections), 'distinct'],
            'config.experience_ids' => ['present', 'array'],
            'config.experience_ids.*' => ['integer', 'distinct', 'exists:resume_experiences,id'],
            'config.project_ids' => ['present', 'array'],
            'config.project_ids.*' => ['integer', 'distinct', 'exists:projects,id'],
            'config.technology_ids' => ['present', 'array'],
            'config.technology_ids.*' => ['integer', 'distinct', 'exists:technologies,id'],
            'config.language' => ['required', Rule::in(['es', 'en'])],
            'config.visible_links' => ['present', 'array'],
            'config.visible_links.*' => ['string', Rule::in(['linkedin', 'github', 'website']), 'distinct'],
            'config.show_email' => ['required', 'boolean'],
            'config.theme' => ['required', Rule::in(['editorial', 'minimal'])],
            'config.target_length' => ['required', Rule::in(['one-page', 'two-pages', 'auto'])],
            'config.include_photo' => ['required', 'boolean'],
            'config.resume_profile' => ['sometimes', 'array'],
            'config.resume_profile.name' => ['required_with:config.resume_profile', 'string', 'max:160'],
            'config.resume_profile.headline' => ['required_with:config.resume_profile', 'string', 'max:160'],
            'config.resume_profile.specialty' => ['required_with:config.resume_profile', 'string', 'max:200'],
            'config.resume_profile.summary' => ['required_with:config.resume_profile', 'string', 'max:500'],
            'config.resume_profile.location' => ['nullable', 'string', 'max:160'],
            'config.resume_profile.email' => ['nullable', 'email', 'max:255'],
            'config.resume_profile.links' => ['sometimes', 'array'],
            'config.resume_profile.links.linkedin' => ['nullable', 'url:https', 'max:2048'],
            'config.resume_profile.links.github' => ['nullable', 'url:https', 'max:2048'],
            'config.resume_profile.links.website' => ['nullable', 'url:https', 'max:2048'],
            'config.resume_profile.links.cv' => ['nullable', 'url:https', 'max:2048'],
            'config.resume_profile.photo_url' => ['nullable', 'url:http,https', 'max:2048'],
            'config.professional_competencies' => ['sometimes', 'array', 'max:20'],
            'config.professional_competencies.*.category' => ['required', 'string', 'max:100'],
            'config.professional_competencies.*.items' => ['required', 'array', 'max:30'],
            'config.professional_competencies.*.items.*' => ['required', 'string', 'max:180'],

            'experiences' => ['present', 'array', 'max:100'],
            'experiences.*.id' => ['nullable', 'integer', 'distinct', 'exists:resume_experiences,id'],
            'experiences.*.job_title' => ['required', 'string', 'max:180'],
            'experiences.*.company' => ['required', 'string', 'max:180'],
            'experiences.*.location' => ['nullable', 'string', 'max:160'],
            'experiences.*.started_at' => ['nullable', 'date'],
            'experiences.*.ended_at' => ['nullable', 'date'],
            'experiences.*.started_year' => ['nullable', 'integer', 'between:1900,2100'],
            'experiences.*.ended_year' => ['nullable', 'integer', 'between:1900,2100'],
            'experiences.*.is_current' => ['required', 'boolean'],
            'experiences.*.description' => ['nullable', 'string', 'max:3000'],
            'experiences.*.responsibilities' => ['present', 'array', 'max:30'],
            'experiences.*.responsibilities.*' => ['required', 'string', 'max:1000'],
            'experiences.*.achievements' => ['present', 'array', 'max:30'],
            'experiences.*.achievements.*' => ['required', 'string', 'max:1000'],
            'experiences.*.sort_order' => ['required', 'integer', 'min:0', 'max:65000'],
            'experiences.*.is_visible' => ['required', 'boolean'],
            'experiences.*.technology_ids' => ['present', 'array', 'max:100'],
            'experiences.*.technology_ids.*' => ['integer', 'distinct', 'exists:technologies,id'],
            'experiences.*.project_ids' => ['present', 'array', 'max:100'],
            'experiences.*.project_ids.*' => ['integer', 'distinct', 'exists:projects,id'],

            'education' => ['present', 'array', 'max:100'],
            'education.*.id' => ['nullable', 'integer', 'distinct', 'exists:resume_education,id'],
            'education.*.qualification' => ['required', 'string', 'max:200'],
            'education.*.institution' => ['required', 'string', 'max:180'],
            'education.*.started_at' => ['nullable', 'date'],
            'education.*.ended_at' => ['nullable', 'date'],
            'education.*.started_year' => ['nullable', 'integer', 'between:1900,2100'],
            'education.*.ended_year' => ['nullable', 'integer', 'between:1900,2100'],
            'education.*.description' => ['nullable', 'string', 'max:3000'],
            'education.*.sort_order' => ['required', 'integer', 'min:0', 'max:65000'],
            'education.*.is_visible' => ['required', 'boolean'],

            'certifications' => ['present', 'array', 'max:100'],
            'certifications.*.id' => ['nullable', 'integer', 'distinct', 'exists:resume_certifications,id'],
            'certifications.*.name' => ['required', 'string', 'max:200'],
            'certifications.*.issuer' => ['required', 'string', 'max:180'],
            'certifications.*.issued_at' => ['nullable', 'date'],
            'certifications.*.credential_url' => ['nullable', 'url:https', 'max:2048'],
            'certifications.*.sort_order' => ['required', 'integer', 'min:0', 'max:65000'],
            'certifications.*.is_visible' => ['required', 'boolean'],

            'languages' => ['present', 'array', 'max:100'],
            'languages.*.id' => ['nullable', 'integer', 'distinct', 'exists:resume_languages,id'],
            'languages.*.language' => ['required', 'string', 'max:100'],
            'languages.*.declared_level' => ['required', 'string', 'max:100'],
            'languages.*.certification_name' => ['nullable', 'string', 'max:180'],
            'languages.*.certification_url' => ['nullable', 'url:https', 'max:2048'],
            'languages.*.sort_order' => ['required', 'integer', 'min:0', 'max:65000'],
            'languages.*.is_visible' => ['required', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            foreach ($this->input('experiences', []) as $index => $experience) {
                if (! ($experience['is_current'] ?? false) && filled($experience['started_at'] ?? null) && filled($experience['ended_at'] ?? null)
                    && $experience['ended_at'] < $experience['started_at']) {
                    $validator->errors()->add("experiences.{$index}.ended_at", 'La fecha de finalización debe ser igual o posterior a la fecha de inicio.');
                }
                if (filled($experience['started_year'] ?? null) && filled($experience['ended_year'] ?? null) && $experience['ended_year'] < $experience['started_year']) {
                    $validator->errors()->add("experiences.{$index}.ended_year", 'El año de finalización debe ser igual o posterior al año de inicio.');
                }
                if ((filled($experience['started_year'] ?? null) && filled($experience['started_at'] ?? null)) || (filled($experience['ended_year'] ?? null) && filled($experience['ended_at'] ?? null))) {
                    $validator->errors()->add("experiences.{$index}.started_year", 'Usa el año o una fecha completa para cada extremo del periodo, no ambos.');
                }
            }
            foreach ($this->input('education', []) as $index => $education) {
                if (filled($education['started_at'] ?? null) && filled($education['ended_at'] ?? null) && $education['ended_at'] < $education['started_at']) {
                    $validator->errors()->add("education.{$index}.ended_at", 'La fecha de finalización debe ser igual o posterior a la fecha de inicio.');
                }
                if (filled($education['started_year'] ?? null) && filled($education['ended_year'] ?? null) && $education['ended_year'] < $education['started_year']) {
                    $validator->errors()->add("education.{$index}.ended_year", 'El año de finalización debe ser igual o posterior al año de inicio.');
                }
                if ((filled($education['started_year'] ?? null) && filled($education['started_at'] ?? null)) || (filled($education['ended_year'] ?? null) && filled($education['ended_at'] ?? null))) {
                    $validator->errors()->add("education.{$index}.started_year", 'Usa el año o una fecha completa para cada extremo del periodo, no ambos.');
                }
            }
        });
    }
}
