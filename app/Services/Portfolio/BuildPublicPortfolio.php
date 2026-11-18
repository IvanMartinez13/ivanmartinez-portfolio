<?php

namespace App\Services\Portfolio;

use App\Models\PortfolioAppearance;
use App\Models\PortfolioPage;
use App\Models\PortfolioSetting;
use App\Models\ProfessionalProfile;
use App\Models\Project;
use App\Models\ResumePublication;
use App\Services\Appearance\AppearancePresets;
use App\Support\PublicLocation;

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
        $resumeNavigation = $this->resumeNavigation($preview ? ($page->draft_blocks ?? []) : ($page->published_blocks ?? []));
        $contact = $this->publicContact($profile->contact_email, $links);

        return [
            'identity' => [
                'name' => $profile->public_name,
                'monogram' => $this->monogram($profile->public_name),
                'role' => $profile->headline,
                'specialty' => $profile->specialty,
                'location' => PublicLocation::cityAndRegion($profile->location),
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
            'resume' => $resumeNavigation,
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
                ...$contact,
            ],
            'footer' => [
                'copyright' => $profile->public_name,
                'note' => $this->publicFooterNote($settings->footer_note ?? ''),
            ],
            'settings' => [
                'siteTitle' => $settings->site_title,
                'metaDescription' => $settings->default_meta_description,
                'locale' => $settings->locale,
            ],
            'appearance' => app(AppearancePresets::class)->publicConfig(PortfolioAppearance::query()->where('key', 'primary')->first()?->published_config),
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
        $resumeNavigation = $this->resumeNavigation($page?->published_blocks ?? []);
        $contact = $this->publicContact($profile->contact_email, $links);

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
            'resume' => $resumeNavigation,
            'contact' => [
                ...$contact,
            ],
            'footer' => [
                'copyright' => $profile->public_name,
                'note' => $this->publicFooterNote($settings->footer_note ?? ''),
            ],
            'appearance' => app(AppearancePresets::class)->publicConfig(PortfolioAppearance::query()->where('key', 'primary')->first()?->published_config),
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

    private function publicFooterNote(string $note): string
    {
        $hasPublishedResume = ResumePublication::query()->exists();

        $preparationNotice = '/(?:\b(?:contenido|perfil|portfolio|curr[ií]culum|sitio).{0,32}\b(?:preparaci[oó]n|pendiente|provisional|pr[oó]ximamente)\b|\b(?:en preparaci[oó]n|en construcci[oó]n|pr[oó]ximamente|pendiente de publicar|versi[oó]n provisional)\b)/iu';
        if ($hasPublishedResume && preg_match($preparationNotice, $note)) {
            return '';
        }

        return $note;
    }

    /** @param array<string, mixed> $links
     * @return array{email: ?string, linkedin: ?string, github: ?string, website: ?string}
     */
    private function publicContact(?string $email, array $links): array
    {
        $publication = ResumePublication::query()->orderByDesc('version')->first();
        $config = is_array($publication?->snapshot['config'] ?? null) ? $publication->snapshot['config'] : [];
        $visibleLinks = is_array($config['visible_links'] ?? null) ? $config['visible_links'] : [];

        return [
            'email' => ($config['show_email'] ?? false) ? $email : null,
            'linkedin' => in_array('linkedin', $visibleLinks, true) ? ($links['linkedin'] ?? null) : null,
            'github' => in_array('github', $visibleLinks, true) ? ($links['github'] ?? null) : null,
            'website' => in_array('website', $visibleLinks, true) ? ($links['website'] ?? null) : null,
        ];
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
            'visualColor' => $project->visual_color,
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

    /** @param array<int, array<string, mixed>> $blocks
     * @return array{published: bool, showNavigation: bool, navigationLabel: string}
     */
    private function resumeNavigation(array $blocks): array
    {
        $hero = collect($blocks)->first(fn (array $block): bool => ($block['type'] ?? null) === 'hero');
        $content = is_array($hero['content'] ?? null) ? $hero['content'] : [];
        $label = trim((string) ($content['resume_navigation_label'] ?? ''));

        return [
            'published' => ResumePublication::query()->exists(),
            'showNavigation' => ($content['show_navigation_link'] ?? true) !== false,
            'navigationLabel' => $label !== '' ? mb_substr($label, 0, 80) : 'Mi CV',
        ];
    }
}
