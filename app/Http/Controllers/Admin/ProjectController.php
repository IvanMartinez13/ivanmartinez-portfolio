<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveProjectRequest;
use App\Models\Project;
use App\Models\ProjectMedia;
use App\Models\Technology;
use App\Services\Portfolio\BuildProjectPage;
use App\Services\Portfolio\BuildPublicPortfolio;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class ProjectController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Project::class);
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'category' => ['nullable', 'string', 'max:100'],
            'development_status' => ['nullable', Rule::in(array_keys(config('projects.development_statuses')))],
            'publication_status' => ['nullable', Rule::in(['draft', 'published'])],
            'featured' => ['nullable', 'boolean'],
        ]);

        $projects = Project::query()
            ->withCount(['technologies', 'caseStudySections'])
            ->when($filters['search'] ?? null, fn (Builder $query, string $search) => $query->where(function (Builder $nested) use ($search): void {
                $nested->where('name', 'ilike', "%{$search}%")
                    ->orWhere('summary', 'ilike', "%{$search}%")
                    ->orWhere('client_company', 'ilike', "%{$search}%");
            }))
            ->when($filters['category'] ?? null, fn (Builder $query, string $category) => $query->where('category', $category))
            ->when($filters['development_status'] ?? null, fn (Builder $query, string $status) => $query->where('development_status', $status))
            ->when($filters['publication_status'] ?? null, fn (Builder $query, string $status) => $query->where('publication_status', $status))
            ->when(array_key_exists('featured', $filters), fn (Builder $query) => $query->where('is_featured', $filters['featured']))
            ->orderBy('sort_order')->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/projects/index', [
            'projects' => $projects,
            'filters' => $filters,
            'categories' => Project::query()->select('category')->distinct()->orderBy('category')->pluck('category'),
            'developmentStatuses' => config('projects.development_statuses'),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Project::class);

        return Inertia::render('admin/projects/form', [
            'project' => $this->formData(new Project([
                'development_status' => 'unspecified',
                'publication_status' => 'draft',
                'is_featured' => false,
                'is_visible' => true,
                'sort_order' => 0,
            ])),
            'technologies' => $this->technologiesForForm(),
            'developmentStatuses' => config('projects.development_statuses'),
            'publicationStatuses' => config('projects.publication_statuses'),
            'caseStudyTemplates' => $this->caseStudyTemplates(),
        ]);
    }

    public function store(SaveProjectRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $project = DB::transaction(function () use ($request, $data): Project {
            $project = Project::query()->create($this->projectAttributes($data));
            $this->saveProjectRelations($project, $data);
            $this->saveUploads($request, $project, $data);

            return $project;
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $project->publication_status === 'published'
                ? 'Proyecto publicado.'
                : 'Proyecto creado como borrador.',
        ]);

        return to_route('admin.projects.edit', $project);
    }

    public function edit(Project $project): Response
    {
        $this->authorize('update', $project);

        return Inertia::render('admin/projects/form', [
            'project' => $this->formData($project->load(['technologies', 'caseStudySections', 'media'])),
            'technologies' => $this->technologiesForForm(),
            'developmentStatuses' => config('projects.development_statuses'),
            'publicationStatuses' => config('projects.publication_statuses'),
            'caseStudyTemplates' => $this->caseStudyTemplates(),
        ]);
    }

    public function update(SaveProjectRequest $request, Project $project): RedirectResponse
    {
        $data = $request->validated();
        DB::transaction(function () use ($request, $project, $data): void {
            $project->fill($this->projectAttributes($data, $project));
            $project->save();
            $this->saveProjectRelations($project, $data);
            $this->saveUploads($request, $project, $data);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Proyecto actualizado.']);

        return to_route('admin.projects.edit', $project);
    }

    public function destroy(Project $project): RedirectResponse
    {
        $this->authorize('delete', $project);
        $paths = array_filter(array_merge(
            [$project->main_image_path],
            $project->media()->whereNotNull('storage_path')->pluck('storage_path')->all(),
        ));
        $project->delete();
        Storage::disk('public')->delete($paths);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Proyecto eliminado.']);

        return to_route('admin.projects.index');
    }

    public function duplicate(Project $project): RedirectResponse
    {
        $this->authorize('create', Project::class);
        $copy = DB::transaction(function () use ($project): Project {
            $copy = $project->replicate();
            $copy->name = $project->name.' (copia)';
            $copy->slug = $this->uniqueSlug($project->slug.'-copia');
            $copy->publication_status = 'draft';
            $copy->published_at = null;
            $copy->is_featured = false;
            $copy->is_visible = false;
            $copy->sort_order = $project->sort_order + 1;
            $copy->main_image_path = null;
            $copy->save();

            if ($project->main_image_path && Storage::disk('public')->exists($project->main_image_path)) {
                $target = 'projects/'.$copy->id.'/main-copy.'.$this->safeExtension($project->main_image_path);
                if (! Storage::disk('public')->copy($project->main_image_path, $target)) {
                    throw new RuntimeException('Unable to copy project main image.');
                }
                $copy->main_image_path = $target;
                $copy->save();
            }

            foreach ($project->technologies()->pluck('technologies.id') as $technologyId) {
                $copy->technologies()->attach($technologyId);
            }
            foreach ($project->caseStudySections as $section) {
                $copy->caseStudySections()->create(Arr::only($section->toArray(), ['key', 'title', 'body', 'position', 'is_visible']));
            }
            foreach ($project->media as $media) {
                $attributes = Arr::only($media->toArray(), ['kind', 'external_url', 'alt_text', 'caption', 'position']);
                if ($media->storage_path && Storage::disk('public')->exists($media->storage_path)) {
                    $target = 'projects/'.$copy->id.'/gallery-'.Str::uuid().'.'.$this->safeExtension($media->storage_path);
                    if (! Storage::disk('public')->copy($media->storage_path, $target)) {
                        throw new RuntimeException('Unable to copy project gallery image.');
                    }
                    $attributes['storage_path'] = $target;
                }
                $copy->media()->create($attributes);
            }

            return $copy;
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Copia creada como borrador.']);

        return to_route('admin.projects.edit', $copy);
    }

    public function preview(Project $project, BuildProjectPage $builder): Response
    {
        $this->authorize('view', $project);

        return Inertia::render('projects/show', [
            'project' => $builder->build($project, true),
            'portfolio' => app(BuildPublicPortfolio::class)->chrome(),
            'preview' => true,
        ]);
    }

    public function destroyMedia(Project $project, ProjectMedia $media): RedirectResponse
    {
        $this->authorize('update', $project);
        abort_unless($media->project_id === $project->id, 404);
        if ($media->storage_path) {
            Storage::disk('public')->delete($media->storage_path);
        }
        $media->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Elemento multimedia eliminado.']);

        return to_route('admin.projects.edit', $project);
    }

    /** @return array<string, mixed> */
    private function projectAttributes(array $data, ?Project $project = null): array
    {
        $attributes = Arr::except($data, [
            'technology_ids', 'case_study_sections', 'main_image', 'main_image_alt', 'gallery_image',
            'gallery_alt', 'gallery_caption', 'video_url', 'video_caption', 'remove_main_image',
            'media',
        ]);
        $attributes['published_at'] = $data['publication_status'] === 'published'
            ? ($project?->published_at ?? now())
            : null;

        return $attributes;
    }

    /** @param array<string, mixed> $data */
    private function saveProjectRelations(Project $project, array $data): void
    {
        $project->technologies()->sync($data['technology_ids'] ?? []);
        foreach ($data['case_study_sections'] as $sectionData) {
            $project->caseStudySections()->updateOrCreate(
                ['key' => $sectionData['key']],
                Arr::only($sectionData, ['title', 'body', 'position', 'is_visible']),
            );
        }
        foreach ($data['media'] ?? [] as $mediaData) {
            $project->media()->whereKey($mediaData['id'])->update([
                'position' => $mediaData['position'],
                'is_visible' => $mediaData['is_visible'],
            ]);
        }
    }

    /** @param array<string, mixed> $data */
    private function saveUploads(SaveProjectRequest $request, Project $project, array $data): void
    {
        if ($request->hasFile('main_image')) {
            $previousPath = $project->main_image_path;
            $newPath = $request->file('main_image')->store('projects/'.$project->id.'/main', 'public');
            if (! $newPath) {
                throw new RuntimeException('Unable to store project main image.');
            }
            $project->main_image_path = $newPath;
            $project->main_image_alt = $data['main_image_alt'];
            $project->save();
            if ($previousPath) {
                Storage::disk('public')->delete($previousPath);
            }
        } elseif ($data['remove_main_image'] ?? false) {
            if ($project->main_image_path) {
                Storage::disk('public')->delete($project->main_image_path);
            }
            $project->main_image_path = null;
            $project->main_image_alt = null;
            $project->save();
        } elseif (array_key_exists('main_image_alt', $data)) {
            $project->main_image_alt = $data['main_image_alt'];
            $project->save();
        }

        if ($request->hasFile('gallery_image')) {
            $project->media()->create([
                'kind' => 'image',
                'storage_path' => $request->file('gallery_image')->store('projects/'.$project->id.'/gallery', 'public'),
                'alt_text' => $data['gallery_alt'],
                'caption' => $data['gallery_caption'] ?? null,
                'position' => (int) ($project->media()->max('position') ?? 0) + 10,
            ]);
        }

        if (filled($data['video_url'] ?? null)) {
            $project->media()->create([
                'kind' => 'video',
                'external_url' => $data['video_url'],
                'caption' => $data['video_caption'] ?? null,
                'position' => (int) ($project->media()->max('position') ?? 0) + 10,
            ]);
        }
    }

    /** @return array<string, mixed> */
    private function formData(Project $project): array
    {
        $sections = $project->relationLoaded('caseStudySections')
            ? $project->caseStudySections->keyBy('key')
            : collect();

        return [
            'id' => $project->exists ? $project->id : null,
            'name' => $project->name ?? '',
            'slug' => $project->slug ?? '',
            'summary' => $project->summary ?? '',
            'description' => $project->description ?? '',
            'category' => $project->category ?? '',
            'project_type' => $project->project_type ?? '',
            'role' => $project->role ?? '',
            'client_company' => $project->client_company ?? '',
            'started_at' => $project->started_at?->format('Y-m-d') ?? '',
            'completed_at' => $project->completed_at?->format('Y-m-d') ?? '',
            'development_status' => $project->development_status ?? 'unspecified',
            'publication_status' => $project->publication_status ?? 'draft',
            'is_featured' => $project->is_featured ?? false,
            'is_visible' => $project->is_visible ?? true,
            'sort_order' => $project->sort_order ?? 0,
            'visual_color' => $project->visual_color ?? '',
            'public_url' => $project->public_url ?? '',
            'repository_url' => $project->repository_url ?? '',
            'seo_title' => $project->seo_title ?? '',
            'seo_description' => $project->seo_description ?? '',
            'main_image_url' => $project->main_image_url,
            'main_image_alt' => $project->main_image_alt ?? '',
            'technology_ids' => $project->relationLoaded('technologies') ? $project->technologies->pluck('id')->all() : [],
            'media' => $project->relationLoaded('media') ? $project->media->map(fn (ProjectMedia $media): array => [
                'id' => $media->id,
                'kind' => $media->kind,
                'url' => $media->url,
                'alt_text' => $media->alt_text,
                'caption' => $media->caption,
                'position' => $media->position,
                'is_visible' => $media->is_visible,
            ])->values()->all() : [],
            'case_study_sections' => collect(config('projects.case_study_sections'))->map(function (array $template, string $key) use ($sections): array {
                $section = $sections->get($key);

                return [
                    'key' => $key,
                    'title' => $section?->title ?? $template['title'],
                    'body' => $section?->body ?? '',
                    'position' => $section?->position ?? $template['position'],
                    'is_visible' => $section?->is_visible ?? false,
                ];
            })->values()->all(),
        ];
    }

    /** @return array<int, array{id: int, name: string, category: string}> */
    private function technologiesForForm(): array
    {
        return Technology::query()->orderBy('category')->orderBy('position')->orderBy('name')
            ->get(['id', 'name', 'category'])->toArray();
    }

    /** @return array<string, string> */
    private function caseStudyTemplates(): array
    {
        return collect(config('projects.case_study_sections'))->map(fn (array $section): string => $section['title'])->all();
    }

    private function uniqueSlug(string $base): string
    {
        $slug = Str::slug($base);
        $candidate = $slug;
        $suffix = 2;
        while (Project::query()->where('slug', $candidate)->exists()) {
            $candidate = $slug.'-'.$suffix++;
        }

        return $candidate;
    }

    private function safeExtension(string $path): string
    {
        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));

        return in_array($extension, ['jpg', 'jpeg', 'png', 'webp'], true) ? $extension : 'jpg';
    }
}
