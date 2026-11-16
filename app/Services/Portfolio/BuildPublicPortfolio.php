<?php

namespace App\Services\Portfolio;

use App\Models\PortfolioPage;
use App\Models\PortfolioSetting;
use App\Models\ProfessionalProfile;
use App\Models\Project;

class BuildPublicPortfolio
{
    /** @return array<string, mixed> */
    public function home(bool $preview = false): array
    {
        $pageQuery = PortfolioPage::query()->where('key', 'home');
        if (! $preview) {
            $pageQuery->published();
        }
        $page = $pageQuery->with('sections')->firstOrFail();

        $profile = ProfessionalProfile::query()->where('key', 'primary')->firstOrFail();
        $settings = PortfolioSetting::query()->where('key', 'primary')->firstOrFail();
        $sections = $page->sections->keyBy('key');

        $visibleSections = $page->sections
            ->filter(fn ($section): bool => $section->is_visible)
            ->sortBy('position')
            ->values();

        $aboutParagraphs = preg_split('/\R\s*\R/u', trim($profile->biography)) ?: [];
        $links = $profile->links ?? [];

        return [
            'identity' => [
                'name' => $profile->public_name,
                'monogram' => $this->monogram($profile->public_name),
                'role' => $profile->headline,
                'specialty' => $profile->specialty,
                'location' => $profile->location,
                'photoUrl' => $profile->photo_url,
            ],
            'hero' => [
                'eyebrow' => $profile->specialty,
                'headline' => $sections->get('hero')->content['headline'] ?? '',
                'description' => $profile->short_description,
                'experience' => $this->experienceLabel($profile->experience_years),
                'experienceYears' => $profile->experience_years === null
                    ? null
                    : (float) $profile->experience_years,
                'availability' => $profile->availability_label,
            ],
            'navigation' => $visibleSections
                ->filter(fn ($section): bool => filled($section->nav_label))
                ->map(fn ($section): array => [
                    'label' => $section->nav_label,
                    'href' => '#'.($section->key === 'hero' ? 'main-content' : $section->key),
                ])
                ->values()
                ->all(),
            'sections' => $page->sections
                ->map(fn ($section): array => [
                    'key' => $section->key,
                    'visible' => $section->is_visible,
                    'order' => $section->position,
                    'content' => $section->content ?? [],
                ])
                ->all(),
            'projects' => $this->featuredProjects(),
            'about' => [
                'eyebrow' => $sections->get('about')->content['eyebrow'] ?? '',
                'title' => $sections->get('about')->content['title'] ?? '',
                'paragraphs' => array_values(array_filter($aboutParagraphs, 'filled')),
            ],
            'technologyGroups' => $sections->get('stack')->content['groups'] ?? [],
            'contact' => [
                'eyebrow' => $sections->get('contact')->content['eyebrow'] ?? '',
                'title' => $sections->get('contact')->content['title'] ?? '',
                'description' => $sections->get('contact')->content['description'] ?? '',
                'email' => $profile->contact_email,
                'linkedin' => $links['linkedin'] ?? null,
                'github' => $links['github'] ?? null,
                'website' => $links['website'] ?? null,
                'cvUrl' => $links['cv'] ?? null,
            ],
            'footer' => [
                'copyright' => $profile->public_name,
                'note' => $settings->footer_note ?? '',
            ],
            'settings' => [
                'siteTitle' => $settings->site_title,
                'metaDescription' => $settings->default_meta_description,
                'locale' => $settings->locale,
            ],
        ];
    }

    /** Public shell data for project routes, independent of the home page publication state.
     * @return array<string, mixed>
     */
    public function chrome(): array
    {
        $profile = ProfessionalProfile::query()->where('key', 'primary')->firstOrFail();
        $settings = PortfolioSetting::query()->where('key', 'primary')->firstOrFail();
        $page = PortfolioPage::query()->published()->where('key', 'home')->with('sections')->first();
        $links = $profile->links ?? [];

        return [
            'identity' => [
                'monogram' => $this->monogram($profile->public_name),
                'name' => $profile->public_name,
            ],
            'navigation' => collect($page?->published_blocks ?? [])
                ->filter(fn (array $block): bool => ($block['visible'] ?? true) && filled($block['nav_label'] ?? null))
                ->sortBy('position')
                ->map(fn (array $block): array => ['label' => $block['nav_label'], 'href' => '/#'.$block['id']])
                ->values()->all() ?? [],
            'contact' => [
                'cvUrl' => $links['cv'] ?? null,
                'email' => $profile->contact_email,
                'linkedin' => $links['linkedin'] ?? null,
                'github' => $links['github'] ?? null,
                'website' => $links['website'] ?? null,
            ],
            'footer' => [
                'copyright' => $profile->public_name,
                'note' => $settings->footer_note ?? '',
            ],
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function featuredProjects(): array
    {
        return Project::query()->public()->where('is_featured', true)
            ->with(['technologies' => fn ($query) => $query->where('technologies.is_visible', true)])
            ->orderBy('sort_order')->orderBy('name')->limit(4)->get()
            ->map(fn (Project $project): array => $this->projectCard($project))
            ->values()->all();
    }

    /** @return array<string, mixed> */
    public function projectCard(Project $project): array
    {
        return [
            'name' => $project->name,
            'slug' => $project->slug,
            'category' => $project->category,
            'description' => $project->summary,
            'monogram' => $this->monogram($project->name),
            'imageUrl' => $project->main_image_url,
            'imageAlt' => $project->main_image_alt,
            'technologies' => $project->technologies->pluck('name')->values()->all(),
            'isFeatured' => $project->is_featured,
        ];
    }

    /** @return array<string, mixed> */
    public function dashboard(): array
    {
        $page = PortfolioPage::query()->where('key', 'home')->with('sections')->firstOrFail();

        return [
            'pageTitle' => $page->title,
            'pageStatus' => $page->status,
            'visibleSections' => $page->sections->where('is_visible', true)->count(),
            'totalSections' => $page->sections->count(),
            'updatedAt' => $page->updated_at?->toIso8601String(),
        ];
    }

    /** @return array<string, mixed> */
    public function editor(): array
    {
        $page = PortfolioPage::query()->where('key', 'home')->with('sections')->firstOrFail();

        return [
            'page' => [
                'title' => $page->title,
                'status' => $page->status,
            ],
            'profileSummary' => ProfessionalProfile::query()
                ->where('key', 'primary')
                ->value('short_description') ?? '',
            'sections' => $page->sections->map(fn ($section): array => [
                'id' => $section->id,
                'key' => $section->key,
                'type' => $section->type,
                'navLabel' => $section->nav_label,
                'position' => $section->position,
                'visible' => $section->is_visible,
                'variant' => $section->variant,
                'content' => $this->editorContent($section->content ?? []),
            ])->all(),
        ];
    }

    /** @param array<string, mixed> $content
     * @return array<string, mixed>
     */
    private function editorContent(array $content): array
    {
        unset($content['items'], $content['groups'], $content['note']);

        return $content;
    }

    private function experienceLabel(mixed $years): string
    {
        if ($years === null) {
            return 'Experiencia profesional';
        }

        $formatted = rtrim(rtrim(number_format((float) $years, 1, '.', ''), '0'), '.');

        return "≈ {$formatted} años de experiencia";
    }

    private function monogram(string $name): string
    {
        $parts = preg_split('/\s+/u', trim($name), -1, PREG_SPLIT_NO_EMPTY) ?: [];
        $initials = collect($parts)->take(2)->map(fn (string $part): string => mb_strtoupper(mb_substr($part, 0, 1)))->implode('');

        return ($initials !== '' ? $initials : 'IM').'.';
    }
}
