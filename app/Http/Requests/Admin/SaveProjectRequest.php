<?php

namespace App\Http\Requests\Admin;

use App\Models\Project;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class SaveProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        $project = $this->route('project');

        return $project instanceof Project
            ? $this->user()?->can('update', $project) === true
            : $this->user()?->can('create', Project::class) === true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $project = $this->route('project');
        $sectionKeys = array_keys(config('projects.case_study_sections', []));

        return [
            'name' => ['required', 'string', 'max:180'],
            'slug' => ['required', 'string', 'max:200', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('projects', 'slug')->ignore($project?->id)],
            'summary' => ['required', 'string', 'max:500'],
            'description' => ['nullable', 'string', 'max:20000'],
            'category' => ['required', 'string', 'max:100'],
            'project_type' => ['required', 'string', 'max:100'],
            'role' => ['required', 'string', 'max:180'],
            'client_company' => ['nullable', 'string', 'max:180'],
            'started_at' => ['nullable', 'date'],
            'completed_at' => ['nullable', 'date', 'after_or_equal:started_at'],
            'development_status' => ['required', Rule::in(array_keys(config('projects.development_statuses', [])))],
            'publication_status' => ['required', Rule::in(['draft', 'published'])],
            'is_featured' => ['required', 'boolean'],
            'is_visible' => ['required', 'boolean'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:1000'],
            'public_url' => ['nullable', 'url:https', 'max:2048'],
            'repository_url' => ['nullable', 'url:https', 'max:2048'],
            'seo_title' => ['nullable', 'string', 'max:180'],
            'seo_description' => ['nullable', 'string', 'max:250'],
            'main_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:8192'],
            'main_image_alt' => ['nullable', 'string', 'max:200', Rule::requiredIf(fn () => $this->hasFile('main_image'))],
            'remove_main_image' => ['nullable', 'boolean'],
            'gallery_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:8192'],
            'gallery_alt' => ['nullable', 'string', 'max:200', Rule::requiredIf(fn () => $this->hasFile('gallery_image'))],
            'gallery_caption' => ['nullable', 'string', 'max:250'],
            'video_url' => ['nullable', 'url:https', 'max:2048'],
            'video_caption' => ['nullable', 'string', 'max:250'],
            'technology_ids' => ['nullable', 'array', 'max:40'],
            'technology_ids.*' => ['integer', 'distinct', 'exists:technologies,id'],
            'media' => ['nullable', 'array', 'max:30'],
            'media.*.id' => ['required', 'integer', 'exists:project_media,id'],
            'media.*.position' => ['required', 'integer', 'min:0', 'max:1000', 'distinct'],
            'media.*.is_visible' => ['required', 'boolean'],
            'case_study_sections' => ['required', 'array', 'size:'.count($sectionKeys)],
            'case_study_sections.*.key' => ['required', Rule::in($sectionKeys)],
            'case_study_sections.*.title' => ['required', 'string', 'max:180'],
            'case_study_sections.*.body' => ['nullable', 'string', 'max:8000'],
            'case_study_sections.*.position' => ['required', 'integer', 'min:0', 'max:1000', 'distinct'],
            'case_study_sections.*.is_visible' => ['required', 'boolean'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            if ($this->filled('video_url')) {
                $host = strtolower((string) parse_url((string) $this->input('video_url'), PHP_URL_HOST));
                $allowed = ['youtube.com', 'www.youtube.com', 'youtu.be', 'www.youtu.be', 'vimeo.com', 'www.vimeo.com', 'player.vimeo.com'];
                if (! in_array($host, $allowed, true)) {
                    $validator->errors()->add('video_url', 'Usa un enlace de vídeo de YouTube o Vimeo.');
                }
            }

            if ($this->input('publication_status') === 'published' && blank($this->input('summary'))) {
                $validator->errors()->add('summary', 'Añade un resumen antes de publicar.');
            }

            if ($this->input('publication_status') === 'published' && (
                str_starts_with((string) $this->input('summary'), 'Borrador inicial:')
                || in_array($this->input('category'), ['Pendiente de completar', ''], true)
                || in_array($this->input('project_type'), ['Pendiente de completar', ''], true)
                || in_array($this->input('role'), ['Pendiente de completar', ''], true)
            )) {
                $validator->errors()->add('publication_status', 'Completa los datos provisionales del proyecto antes de publicarlo.');
            }
        }];
    }
}
