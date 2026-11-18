<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateAppearanceRequest;
use App\Models\PortfolioAppearance;
use App\Models\PortfolioAppearanceRevision;
use App\Models\PortfolioPage;
use App\Services\Appearance\AppearancePresets;
use App\Services\Pages\BuildPageBlocks;
use App\Services\Portfolio\BuildPublicPortfolio;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AppearanceController extends Controller
{
    public function edit(AppearancePresets $presets): Response
    {
        $appearance = PortfolioAppearance::query()->where('key', 'primary')->firstOrFail();

        return Inertia::render('admin/appearance', [
            'appearance' => [
                'draftConfig' => $appearance->draft_config,
                'publishedConfig' => $appearance->published_config,
                'publishedAt' => $appearance->published_at?->toIso8601String(),
            ],
            'presets' => collect($presets->all())->map(fn (array $preset, string $key): array => [
                'key' => $key, 'label' => $preset['label'], 'description' => $preset['description'],
            ])->values(),
            'options' => $presets->options(),
            'revisions' => $appearance->revisions()->limit(12)->get(['id', 'version', 'preset', 'created_at']),
        ]);
    }

    public function update(UpdateAppearanceRequest $request): RedirectResponse
    {
        PortfolioAppearance::query()->where('key', 'primary')->firstOrFail()->fill([
            'draft_config' => $request->validated('config'),
            'updated_by' => $request->user()->id,
        ])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Borrador de apariencia guardado. La web pública no cambia hasta publicar.']);

        return to_route('admin.appearance.edit');
    }

    public function restorePreset(string $preset, AppearancePresets $presets): RedirectResponse
    {
        $config = $presets->config($preset);
        PortfolioAppearance::query()->where('key', 'primary')->firstOrFail()->fill([
            'draft_config' => $config,
            'updated_by' => request()->user()->id,
        ])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Preset cargado en el borrador. Publica para aplicarlo.']);

        return to_route('admin.appearance.edit');
    }

    public function publish(): RedirectResponse
    {
        DB::transaction(function (): void {
            $appearance = PortfolioAppearance::query()->where('key', 'primary')->lockForUpdate()->firstOrFail();
            $version = (int) ($appearance->revisions()->max('version') ?? 0) + 1;

            PortfolioAppearanceRevision::query()->create([
                'portfolio_appearance_id' => $appearance->id,
                'version' => $version,
                'preset' => $appearance->published_config['preset'] ?? 'editorial-premium',
                'config' => $appearance->published_config,
                'created_by' => request()->user()?->id,
            ]);

            $appearance->published_config = $appearance->draft_config;
            $appearance->published_at = now();
            $appearance->updated_by = request()->user()?->id;
            $appearance->save();
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Nueva apariencia publicada.']);

        return to_route('admin.appearance.edit');
    }

    public function restoreRevision(PortfolioAppearanceRevision $revision): RedirectResponse
    {
        $appearance = PortfolioAppearance::query()->where('key', 'primary')->firstOrFail();
        abort_unless($revision->portfolio_appearance_id === $appearance->id, 404);

        $appearance->fill(['draft_config' => $revision->config, 'updated_by' => request()->user()->id])->save();
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Versión anterior recuperada como borrador.']);

        return to_route('admin.appearance.edit');
    }

    public function preview(AppearancePresets $presets, BuildPublicPortfolio $portfolioBuilder, BuildPageBlocks $blockBuilder): Response
    {
        $appearance = PortfolioAppearance::query()->where('key', 'primary')->firstOrFail();
        $page = PortfolioPage::query()->published()->where('key', 'home')->firstOrFail();
        $portfolio = $portfolioBuilder->home();
        $portfolio['appearance'] = $presets->publicConfig($appearance->draft_config ?: $presets->defaults());
        $blocks = $blockBuilder->renderData($page->published_blocks ?? [], false, $portfolio);
        $portfolio['navigation'] = collect($blocks)->filter(fn (array $block): bool => filled($block['nav_label'] ?? null))
            ->map(fn (array $block): array => ['label' => $block['nav_label'], 'href' => '#'.$block['id']])->values()->all();

        return Inertia::render('welcome', [
            'portfolio' => $portfolio,
            'builderBlocks' => $blocks,
            'pagePreview' => false,
            'appearancePreview' => true,
            'pageSeo' => ['title' => $page->published_seo_title, 'description' => $page->published_seo_description],
        ]);
    }
}
