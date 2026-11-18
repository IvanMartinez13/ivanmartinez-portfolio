<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SavePortfolioPageRequest;
use App\Models\PortfolioPage;
use App\Models\PortfolioPageRevision;
use App\Services\Pages\BlockRegistry;
use App\Services\Pages\BuildPageBlocks;
use App\Services\Pages\SyncMediaReferences;
use App\Services\Portfolio\BuildPublicPortfolio;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioPageController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', PortfolioPage::class);

        return Inertia::render('admin/pages/index', [
            'pages' => PortfolioPage::query()->orderByRaw("CASE WHEN key = 'home' THEN 0 ELSE 1 END")->orderBy('title')->get(['id', 'key', 'title', 'slug', 'status', 'updated_at']),
        ]);
    }

    public function create(BlockRegistry $registry): Response
    {
        $this->authorize('create', PortfolioPage::class);

        return Inertia::render('admin/pages/editor', [
            'page' => ['id' => null, 'title' => '', 'slug' => '', 'seo_title' => '', 'seo_description' => '', 'status' => 'draft', 'blocks' => []],
            'blockTypes' => $this->blockTypes($registry),
            'versions' => [],
        ]);
    }

    public function store(SavePortfolioPageRequest $request, SyncMediaReferences $media): RedirectResponse
    {
        $data = $this->validatedData($request->validated());
        $page = PortfolioPage::query()->create([
            'key' => 'page-'.Str::uuid(), 'title' => $data['title'], 'slug' => $data['slug'], 'status' => 'draft',
            'seo_title' => $data['seo_title'] ?? null, 'seo_description' => $data['seo_description'] ?? null, 'draft_blocks' => $data['blocks'],
        ]);
        $media->sync($page, 'draft', $data['blocks']);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Borrador guardado.']);

        return to_route('admin.pages.edit', $page);
    }

    public function edit(PortfolioPage $page, BlockRegistry $registry): Response
    {
        $this->authorize('view', $page);

        return $this->editor($page, $registry);
    }

    public function update(SavePortfolioPageRequest $request, PortfolioPage $page, SyncMediaReferences $media): RedirectResponse
    {
        $data = $this->validatedData($request->validated());
        $page->fill([
            'title' => $data['title'], 'slug' => $data['slug'], 'seo_title' => $data['seo_title'] ?? null,
            'seo_description' => $data['seo_description'] ?? null, 'draft_blocks' => $data['blocks'],
        ])->save();
        $media->sync($page, 'draft', $data['blocks']);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Borrador guardado. La versión pública no cambia hasta publicar.']);

        return back();
    }

    public function duplicate(PortfolioPage $page, SyncMediaReferences $media): RedirectResponse
    {
        $this->authorize('create', PortfolioPage::class);
        $copy = $page->replicate();
        $copy->key = 'page-'.Str::uuid();
        $copy->title = $page->title.' (copia)';
        $copy->slug = $this->uniqueSlug($page->slug.'-copia');
        $copy->status = 'draft';
        $copy->published_at = null;
        $copy->published_blocks = null;
        $copy->published_title = null;
        $copy->published_slug = null;
        $copy->published_seo_title = null;
        $copy->published_seo_description = null;
        $copy->draft_blocks = collect($page->draft_blocks ?? [])->map(function (array $block): array {
            $block['id'] = (string) Str::uuid();

            return $block;
        })->all();
        $copy->save();
        $media->sync($copy, 'draft', $copy->draft_blocks ?? []);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Página duplicada como borrador.']);

        return to_route('admin.pages.edit', $copy);
    }

    public function destroy(PortfolioPage $page): RedirectResponse
    {
        $this->authorize('delete', $page);
        $page->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Página eliminada.']);

        return to_route('admin.pages.index');
    }

    public function publish(PortfolioPage $page, SyncMediaReferences $media): RedirectResponse
    {
        $this->authorize('publish', $page);
        if (PortfolioPage::query()->where('published_slug', $page->slug)->whereKeyNot($page->id)->exists()) {
            throw ValidationException::withMessages(['slug' => 'Otra página publicada utiliza este slug.']);
        }
        DB::transaction(function () use ($page, $media): void {
            $blocks = $page->draft_blocks ?? [];
            $version = (int) ($page->revisions()->max('version') ?? 0) + 1;
            $revision = PortfolioPageRevision::query()->create([
                'portfolio_page_id' => $page->id, 'version' => $version, 'title' => $page->title, 'slug' => $page->slug,
                'seo_title' => $page->seo_title, 'seo_description' => $page->seo_description, 'blocks' => $blocks,
                'created_by' => request()->user()?->id,
            ]);
            $page->published_blocks = $blocks;
            $page->published_title = $page->title;
            $page->published_slug = $page->slug;
            $page->published_seo_title = $page->seo_title;
            $page->published_seo_description = $page->seo_description;
            $page->status = 'published';
            $page->published_at = now();
            $page->save();
            $media->sync($page, 'published', $blocks);
            $media->sync($page, 'revision', $blocks, $revision);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Página publicada.']);

        return back();
    }

    public function unpublish(PortfolioPage $page): RedirectResponse
    {
        $this->authorize('publish', $page);
        $page->status = 'draft';
        $page->published_at = null;
        $page->published_slug = null;
        $page->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Publicación retirada. El contenido publicado se conserva para futuras restauraciones.']);

        return back();
    }

    public function preview(PortfolioPage $page, BuildPageBlocks $builder, Request $request): Response
    {
        $this->authorize('view', $page);

        if (! $request->boolean('frame')) {
            return Inertia::render('admin/pages/preview', [
                'title' => $page->title,
                'editUrl' => route('admin.pages.edit', $page),
                'previewUrl' => route('admin.pages.preview', $page).'?frame=1',
            ]);
        }

        return Inertia::render($page->key === 'home' ? 'welcome' : 'public/page', $page->key === 'home'
            ? $this->homePreviewData($page, $builder)
            : $builder->page($page, true));
    }

    /** @return array<string, mixed> */
    private function homePreviewData(PortfolioPage $page, BuildPageBlocks $builder): array
    {
        $portfolio = app(BuildPublicPortfolio::class)->home(true);
        $blocks = $builder->renderData($page->draft_blocks ?? [], true, $portfolio);
        $portfolio['navigation'] = collect($blocks)->filter(fn (array $block): bool => filled($block['nav_label'] ?? null))
            ->map(fn (array $block): array => ['label' => $block['nav_label'], 'href' => '#'.$block['id']])->values()->all();

        return ['portfolio' => $portfolio, 'builderBlocks' => $blocks, 'pagePreview' => true, 'pageSeo' => ['title' => $page->seo_title, 'description' => $page->seo_description]];
    }

    public function restore(PortfolioPage $page, PortfolioPageRevision $revision, SyncMediaReferences $media): RedirectResponse
    {
        $this->authorize('update', $page);
        abort_unless($revision->portfolio_page_id === $page->id, 404);
        if (PortfolioPage::query()->where('slug', $revision->slug)->whereKeyNot($page->id)->exists()) {
            throw ValidationException::withMessages(['slug' => 'Otra página está utilizando el slug de esta versión.']);
        }
        $page->fill([
            'title' => $revision->title, 'slug' => $revision->slug, 'seo_title' => $revision->seo_title,
            'seo_description' => $revision->seo_description, 'draft_blocks' => $revision->blocks,
        ])->save();
        $media->sync($page, 'draft', $revision->blocks ?? []);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Versión restaurada al borrador. Publica para aplicarla al sitio.']);

        return to_route('admin.pages.edit', $page);
    }

    private function editor(PortfolioPage $page, BlockRegistry $registry): Response
    {
        return Inertia::render('admin/pages/editor', [
            'page' => [
                'id' => $page->id, 'key' => $page->key, 'title' => $page->title, 'slug' => $page->slug,
                'seo_title' => $page->seo_title ?? '', 'seo_description' => $page->seo_description ?? '',
                'status' => $page->status, 'blocks' => $page->draft_blocks ?? [],
            ],
            'blockTypes' => $this->blockTypes($registry),
            'versions' => $page->revisions()->get(['id', 'version', 'title', 'slug', 'created_at']),
        ]);
    }

    /** @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    private function validatedData(array $data): array
    {
        $registry = app(BlockRegistry::class);
        $data['blocks'] = collect($data['blocks'])->map(function (array $block) use ($registry): array {
            $block['content'] = $registry->validateContent($block['type'], $block['content']);

            return $block;
        })->values()->all();

        return $data;
    }

    private function uniqueSlug(string $base): string
    {
        $slug = $base;
        $suffix = 2;
        while (PortfolioPage::query()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$suffix++;
        }

        return $slug;
    }

    /** @return array<string, array<string, mixed>> */
    private function blockTypes(BlockRegistry $registry): array
    {
        return collect($registry->all())->map(function (array $definition, string $type) use ($registry): array {
            $definition['defaults'] = $registry->defaults($type);

            return $definition;
        })->all();
    }
}
