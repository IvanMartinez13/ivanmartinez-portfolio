<?php

namespace App\Http\Requests\Admin;

use App\Models\PortfolioPage;
use App\Services\Pages\BlockRegistry;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SavePortfolioPageRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var PortfolioPage|null $page */
        $page = $this->route('page');

        return $page ? $this->user()?->can('update', $page) ?? false : $this->user()?->can('create', PortfolioPage::class) ?? false;
    }

    public function rules(BlockRegistry $registry): array
    {
        /** @var PortfolioPage|null $page */
        $page = $this->route('page');
        $reserved = ['admin', 'projects', 'login', 'logout', 'register', 'forgot-password', 'reset-password', 'settings', 'storage', 'build', 'api', 'up'];
        if (! $page || $page->key !== 'home') {
            $reserved[] = 'home';
        }

        return [
            'title' => ['required', 'string', 'max:160'],
            'slug' => ['required', 'string', 'max:100', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::notIn($reserved), Rule::unique('portfolio_pages', 'slug')->ignore($page?->id)],
            'seo_title' => ['nullable', 'string', 'max:160'],
            'seo_description' => ['nullable', 'string', 'max:500'],
            'blocks' => ['required', 'array', 'max:60'],
            'blocks.*' => ['required', 'array:id,type,position,visible,variant,spacing,appearance,nav_label,content'],
            'blocks.*.id' => ['required', 'string', 'max:80', 'distinct'],
            'blocks.*.type' => ['required', 'string', Rule::in(array_keys($registry->all()))],
            'blocks.*.position' => ['required', 'integer', 'min:0', 'max:10000'],
            'blocks.*.visible' => ['required', 'boolean'],
            'blocks.*.variant' => ['required', Rule::in(['default', 'subtle', 'bordered'])],
            'blocks.*.spacing' => ['required', Rule::in(['none', 'compact', 'default', 'relaxed'])],
            'blocks.*.appearance' => ['nullable', 'array:background,contrast,alignment,content_width,graphic'],
            'blocks.*.appearance.background' => ['nullable', Rule::in(['default', 'light', 'surface', 'navy', 'primary', 'turquoise'])],
            'blocks.*.appearance.contrast' => ['nullable', Rule::in(['auto', 'light', 'dark'])],
            'blocks.*.appearance.alignment' => ['nullable', Rule::in(['left', 'center', 'right'])],
            'blocks.*.appearance.content_width' => ['nullable', Rule::in(['narrow', 'standard', 'wide', 'full'])],
            'blocks.*.appearance.graphic' => ['nullable', Rule::in(['none', 'grid', 'lines', 'orbital'])],
            'blocks.*.nav_label' => ['nullable', 'string', 'max:80'],
            'blocks.*.content' => ['required', 'array'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $registry = app(BlockRegistry::class);
        $blocks = $this->input('blocks');
        if (! is_array($blocks) && is_string($this->input('blocks_json'))) {
            $blocks = json_decode($this->input('blocks_json'), true);
        }
        if (! is_array($blocks)) {
            $this->merge(['blocks' => null]);

            return;
        }
        foreach ($blocks as $index => $block) {
            if (! is_array($block) || ! is_string($block['type'] ?? null) || ! is_array($block['content'] ?? null)) {
                continue;
            }
            if (! isset($registry->all()[$block['type']])) {
                continue;
            }
            $blocks[$index]['content'] = $registry->validateContent($block['type'], $block['content']);
        }
        $this->merge(['blocks' => $blocks]);
    }
}
