<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Technology;
use App\Services\Portfolio\BuildProjectPage;
use App\Services\Portfolio\BuildPublicPortfolio;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicProjectController extends Controller
{
    public function index(Request $request, BuildProjectPage $projectPage, BuildPublicPortfolio $portfolio): Response
    {
        $filters = $request->validate([
            'category' => ['nullable', 'string', 'max:100'],
            'technology' => ['nullable', 'string', 'max:120', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'],
        ]);

        $query = Project::query()->public()->with([
            'technologies' => fn ($query) => $query->where('technologies.is_visible', true),
        ]);
        if (filled($filters['category'] ?? null)) {
            $query->where('category', $filters['category']);
        }
        if (filled($filters['technology'] ?? null)) {
            $query->whereHas('technologies', fn (Builder $technologyQuery) => $technologyQuery
                ->where('technologies.slug', $filters['technology'])
                ->where('technologies.is_visible', true));
        }

        $projects = $query->orderByDesc('is_featured')->orderBy('sort_order')->orderBy('name')
            ->paginate(12)->withQueryString()
            ->through(fn (Project $project): array => $portfolio->projectCard($project));

        return Inertia::render('projects/index', [
            'projects' => $projects,
            'categories' => Project::query()->public()->select('category')->distinct()->orderBy('category')->pluck('category')->values()->all(),
            'technologies' => Technology::query()->visible()->whereHas('projects', fn (Builder $projectQuery) => $projectQuery->public())
                ->orderBy('category')->orderBy('position')->orderBy('name')->get(['name', 'slug', 'category']),
            'filters' => $filters,
            'portfolio' => $portfolio->chrome(),
        ]);
    }

    public function show(string $slug, BuildProjectPage $projectPage, BuildPublicPortfolio $portfolio): Response
    {
        $project = Project::query()->public()->with([
            'technologies' => fn ($query) => $query->where('technologies.is_visible', true),
            'caseStudySections' => fn ($query) => $query->where('is_visible', true)->whereNotNull('body')->where('body', '<>', ''),
            'media',
        ])->where('slug', $slug)->firstOrFail();

        $related = Project::query()->public()->whereKeyNot($project->id)
            ->with(['technologies' => fn ($query) => $query->where('technologies.is_visible', true)])
            ->orderByDesc('is_featured')->orderBy('sort_order')->orderBy('name')->limit(3)->get()
            ->map(fn (Project $relatedProject): array => $portfolio->projectCard($relatedProject))
            ->values()->all();

        return Inertia::render('projects/show', [
            'project' => $projectPage->build($project),
            'relatedProjects' => $related,
            'portfolio' => $portfolio->chrome(),
            'preview' => false,
        ]);
    }
}
