<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\PortfolioPage;
use App\Models\Technology;
use App\Services\Portfolio\BuildPublicPortfolio;
use App\Services\Resume\BuildResume;
use Inertia\Inertia;
use Inertia\Response;

class DesignPreviewController extends Controller
{
    public function __invoke(BuildPublicPortfolio $portfolio, BuildResume $resume): Response
    {
        $publishedPortfolio = $portfolio->home();
        $homePage = PortfolioPage::query()->published()->where('key', 'home')->firstOrFail();
        $heroBlock = collect($homePage->published_blocks ?? [])->first(fn (array $block): bool => ($block['type'] ?? null) === 'hero');
        $heroContent = is_array($heroBlock['content'] ?? null) ? $heroBlock['content'] : [];
        $headline = trim((string) ($heroContent['headline'] ?? $heroContent['title'] ?? ''));
        $description = trim((string) ($heroContent['description'] ?? $heroContent['body'] ?? $publishedPortfolio['hero']['description'] ?? ''));
        if ($headline === '' || $headline === 'Software útil, bien pensado y preparado para crecer.') {
            $headline = 'De la idea al producto. Del código a la solución.';
        }
        if ($description === '' || $description === 'Diseño y desarrollo productos digitales y software empresarial con atención al detalle, desde la arquitectura hasta la experiencia de uso.') {
            $description = 'Diseño y desarrollo aplicaciones web y productos digitales. Especializado en Laravel, React y arquitecturas que resuelven problemas reales.';
        }
        $resumeData = $resume->homepageData(false, 3);
        $technologies = Technology::query()->visible()
            ->orderBy('category')->orderBy('position')->orderBy('name')
            ->get(['id', 'name', 'slug', 'category'])
            ->groupBy('category')
            ->map(fn ($items, string $category): array => [
                'category' => $category,
                'items' => $items->map(fn (Technology $technology): array => [
                    'id' => $technology->id,
                    'name' => $technology->name,
                    'slug' => $technology->slug,
                ])->values()->all(),
            ])->values()->all();

        if ($resumeData['available'] && $resumeData['technology_groups'] !== []) {
            $technologies = $resumeData['technology_groups'];
        }

        $projects = Project::query()->public()
            ->with(['technologies' => fn ($query) => $query->where('technologies.is_visible', true)])
            ->orderByDesc('is_featured')->orderBy('sort_order')->orderBy('name')->limit(4)->get()
            ->map(fn (Project $project): array => $portfolio->projectCard($project))
            ->values()->all();

        return Inertia::render('admin/design-preview', [
            'identity' => $publishedPortfolio['identity'],
            'headline' => $headline,
            'description' => $description,
            'about' => $publishedPortfolio['about'],
            'contact' => $publishedPortfolio['contact'],
            'resume' => [
                'published' => $publishedPortfolio['resume']['published'],
                'experiences' => $resumeData['available'] ? $resumeData['experiences'] : [],
            ],
            'technologies' => $technologies,
            'projects' => $projects,
        ]);
    }
}
