<?php

namespace App\Services\Pages;

use App\Models\PortfolioPage;
use App\Models\ProfessionalProfile;
use App\Models\Project;
use App\Models\ResumePublication;
use App\Models\Technology;
use App\Services\Portfolio\BuildPublicPortfolio;
use App\Services\Resume\BuildResume;

class BuildPageBlocks
{
    /** @return array<string, mixed> */
    public function page(PortfolioPage $page, bool $preview = false): array
    {
        $blocks = $preview ? ($page->draft_blocks ?? []) : ($page->published_blocks ?? []);

        return [
            'page' => [
                'title' => $preview ? $page->title : $page->published_title,
                'slug' => $preview ? $page->slug : $page->published_slug,
                'seoTitle' => ($preview ? $page->seo_title : $page->published_seo_title) ?: ($preview ? $page->title : $page->published_title),
                'seoDescription' => $preview ? $page->seo_description : $page->published_seo_description,
            ],
            'blocks' => $this->renderData($blocks, $preview),
            'portfolio' => app(BuildPublicPortfolio::class)->chrome(),
            'preview' => $preview,
        ];
    }

    /** @param array<int, array<string, mixed>> $blocks
     * @return array<int, array<string, mixed>>
     */
    public function renderData(array $blocks, bool $preview = false, ?array $homePortfolio = null): array
    {
        $visible = collect($blocks)->filter(fn (array $block): bool => $preview || ($block['visible'] ?? true))
            ->sortBy('position')->values();

        $portfolio = $homePortfolio;
        foreach ($visible as $block) {
            if (($block['content']['legacy_key'] ?? null) && $portfolio === null) {
                $portfolio = app(BuildPublicPortfolio::class)->home($preview);
                break;
            }
        }

        return $visible->map(function (array $block) use ($portfolio, $preview): array {
            $content = $block['content'] ?? [];
            $legacyKey = $content['legacy_key'] ?? null;
            if ($legacyKey && $portfolio) {
                $section = collect($portfolio['sections'])->firstWhere('key', $legacyKey);
                if ($section) {
                    $content = array_merge($section['content'], $content);
                }
            }
            $block['content'] = $content;
            $block['nav_label'] = $block['nav_label'] ?? null;
            if ($block['type'] === 'timeline' && $legacyKey === 'experience' && ($preview || ResumePublication::query()->exists())) {
                $resumeData = app(BuildResume::class)->homepageData($preview, (int) ($content['limit'] ?? 5));
                if ($resumeData['available']) {
                    $block['type'] = 'resume_experience';
                    $description = (string) ($content['description'] ?? '');
                    if (preg_match('/\b(provisional|pendiente(?:s)?\s+(?:de\s+)?(?:validar|validación|completar))\b/iu', $description)) {
                        $block['content']['description'] = '';
                    }
                    $block['data'] = $resumeData;

                    return $block;
                }
            }
            $block['data'] = match ($block['type']) {
                'featured_projects', 'project_grid' => Project::query()->public()->when($block['type'] === 'featured_projects', fn ($query) => $query->where('is_featured', true))
                    ->with(['technologies' => fn ($query) => $query->where('technologies.is_visible', true)])
                    ->orderByDesc('is_featured')->orderBy('sort_order')->orderBy('name')->limit((int) ($content['limit'] ?? 4))->get()
                    ->map(fn (Project $project): array => app(BuildPublicPortfolio::class)->projectCard($project))->all(),
                'profile' => $portfolio ? ['identity' => $portfolio['identity'], 'about' => $portfolio['about']] : $this->profileData(),
                'timeline' => ['items' => $content['items'] ?? []],
                'resume_experience' => app(BuildResume::class)->homepageData($preview, (int) ($content['limit'] ?? 5)),
                'technologies' => ['items' => filled($content['groups'] ?? null)
                    ? $content['groups']
                    : Technology::query()->visible()->orderBy('category')->orderBy('position')->orderBy('name')->get(['name', 'category'])->groupBy('category')->map(fn ($items, $category) => ['category' => $category, 'items' => $items->pluck('name')->all()])->values()->all()],
                'hero' => [
                    'identity' => $portfolio['identity'] ?? ProfessionalProfile::query()->where('key', 'primary')->first(['public_name', 'headline', 'specialty', 'photo_url'])?->only(['public_name', 'headline', 'specialty', 'photo_url']),
                    'description' => $portfolio['hero']['description'] ?? ProfessionalProfile::query()->where('key', 'primary')->value('short_description') ?? '',
                    'experienceYears' => $portfolio['hero']['experienceYears'] ?? ProfessionalProfile::query()->where('key', 'primary')->value('experience_years'),
                    'availability' => $portfolio['hero']['availability'] ?? ProfessionalProfile::query()->where('key', 'primary')->value('availability_label'),
                    'resumePublished' => ResumePublication::query()->exists(),
                    'resumePreviewAvailable' => $preview && app(BuildResume::class)->homepageData(true)['available'],
                ],
                'contact_form' => ['email' => $portfolio['contact']['email'] ?? ProfessionalProfile::query()->where('key', 'primary')->value('contact_email')],
                default => [],
            };

            return $block;
        })->all();
    }

    /** @return array<string, mixed> */
    private function profileData(): array
    {
        $profile = ProfessionalProfile::query()->where('key', 'primary')->first();
        $paragraphs = preg_split('/\R\s*\R/u', trim((string) $profile?->biography)) ?: [];

        return [
            'identity' => $profile ? [
                'name' => $profile->public_name,
                'public_name' => $profile->public_name,
                'headline' => $profile->headline,
                'specialty' => $profile->specialty,
                'photoUrl' => $profile->photo_url,
                'location' => $profile->location,
            ] : [],
            'about' => ['title' => 'Sobre mí', 'paragraphs' => array_values(array_filter($paragraphs, 'filled'))],
        ];
    }
}
