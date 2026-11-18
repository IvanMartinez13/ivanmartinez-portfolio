<?php

use App\Models\PortfolioAppearance;
use App\Models\PortfolioPage;
use App\Models\User;
use App\Services\Appearance\AppearancePresets;
use Database\Seeders\PortfolioSeeder;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    $this->seed(PortfolioSeeder::class);
});

function appearanceAdmin($testCase): User
{
    $user = User::factory()->create(['email_verified_at' => now()])->forceFill(['is_admin' => true]);
    $testCase->actingAs($user);

    return $user;
}

function appearancePageBlock(array $appearance): array
{
    return [
        'id' => (string) Str::uuid(), 'type' => 'rich_text', 'position' => 0, 'visible' => true,
        'variant' => 'default', 'spacing' => 'default', 'appearance' => $appearance,
        'nav_label' => null, 'content' => ['title' => 'Bloque intacto', 'html' => '<p>Contenido existente.</p>'],
    ];
}

test('appearance administration is restricted to verified administrators', function (): void {
    $this->get(route('admin.appearance.edit'))->assertRedirect(route('login'));
    $this->actingAs(User::factory()->create(['email_verified_at' => now()]));
    $this->get(route('admin.appearance.edit'))->assertForbidden();
    $this->put(route('admin.appearance.update'), [])->assertForbidden();
});

test('editorial premium is the published default and the admin can view supported presets and controls', function (): void {
    appearanceAdmin($this);

    $this->get(route('admin.appearance.edit'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('admin/appearance')->has('presets', 2)->has('options.fonts.Geist')->has('options.containers.wide'));

    $appearance = PortfolioAppearance::query()->where('key', 'primary')->firstOrFail();
    expect($appearance->draft_config['preset'])->toBe('editorial-premium')
        ->and($appearance->published_config['preset'])->toBe('editorial-premium')
        ->and(DB::connection()->getDriverName())->toBe('pgsql')
        ->and(DB::connection()->getDatabaseName())->toBe('db_testing');
});

test('appearance edits stay in draft until publish and public pages receive the published tokens', function (): void {
    appearanceAdmin($this);
    $appearance = PortfolioAppearance::query()->where('key', 'primary')->firstOrFail();
    $originalPublished = $appearance->published_config;
    $draft = app(AppearancePresets::class)->config('minimal-light');
    $draft['colors']['primary'] = '#3050A0';

    $this->put(route('admin.appearance.update'), ['config' => $draft])->assertRedirect(route('admin.appearance.edit'));
    expect($appearance->fresh()->draft_config['colors']['primary'])->toBe('#3050A0')
        ->and($appearance->fresh()->published_config)->toBe($originalPublished);
    $this->get('/')->assertOk()->assertInertia(fn (Assert $page) => $page->where('portfolio.appearance.preset', 'editorial-premium'));

    $this->post(route('admin.appearance.publish'))->assertRedirect(route('admin.appearance.edit'));
    expect($appearance->fresh()->published_config['colors']['primary'])->toBe('#3050A0')
        ->and($appearance->fresh()->revisions()->count())->toBe(1);
    $this->get('/')->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('portfolio.appearance.preset', 'minimal-light')
        ->where('portfolio.appearance.cssVariables.--portfolio-primary', '#3050A0')
        ->where('builderBlocks.0.content.legacy_key', 'hero'));
});

test('appearance preview uses the draft and restoring a published revision restores it only as a draft', function (): void {
    appearanceAdmin($this);
    $appearance = PortfolioAppearance::query()->where('key', 'primary')->firstOrFail();
    $oldPublished = $appearance->published_config;
    $draft = app(AppearancePresets::class)->config('minimal-light');
    $this->put(route('admin.appearance.update'), ['config' => $draft])->assertRedirect();

    $this->get(route('admin.appearance.preview'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('welcome')->where('appearancePreview', true)->where('portfolio.appearance.preset', 'minimal-light'));
    $this->post(route('admin.appearance.publish'))->assertRedirect();
    $revision = $appearance->fresh()->revisions()->firstOrFail();
    $this->put(route('admin.appearance.update'), ['config' => $draft])->assertRedirect();
    $this->post(route('admin.appearance.revisions.restore', $revision))->assertRedirect();

    expect($appearance->fresh()->draft_config)->toBe($oldPublished)
        ->and($appearance->fresh()->published_config['preset'])->toBe('minimal-light');
});

test('appearance validation rejects arbitrary CSS and accepts only the supported preset set', function (): void {
    appearanceAdmin($this);
    $config = app(AppearancePresets::class)->defaults();
    $config['colors']['primary'] = 'url(javascript:alert(1))';
    $this->put(route('admin.appearance.update'), ['config' => $config])->assertSessionHasErrors('config.colors.primary');

    $config = app(AppearancePresets::class)->defaults();
    $config['headerVariant'] = 'custom-css';
    $this->put(route('admin.appearance.update'), ['config' => $config])->assertSessionHasErrors('config.headerVariant');
});

test('blocks retain validated visual options while legacy content remains unchanged', function (): void {
    appearanceAdmin($this);
    $this->post(route('admin.pages.store'), [
        'title' => 'Tema por bloque', 'slug' => 'tema-por-bloque', 'seo_title' => '', 'seo_description' => '',
        'blocks' => [appearancePageBlock(['background' => 'navy', 'contrast' => 'light', 'alignment' => 'center', 'content_width' => 'wide', 'graphic' => 'orbital'])],
    ])->assertRedirect();
    $page = PortfolioPage::query()->where('slug', 'tema-por-bloque')->firstOrFail();
    $this->post(route('admin.pages.publish', $page))->assertRedirect();

    $this->get('/tema-por-bloque')->assertOk()->assertInertia(fn (Assert $response) => $response
        ->where('blocks.0.appearance.background', 'navy')
        ->where('blocks.0.appearance.graphic', 'orbital')
        ->where('blocks.0.content.html', '<p>Contenido existente.</p>'));

    $invalid = appearancePageBlock(['background' => 'javascript', 'graphic' => 'remote-image']);
    $this->post(route('admin.pages.store'), ['title' => 'Apariencia inválida', 'slug' => 'apariencia-invalida', 'blocks' => [$invalid]])
        ->assertSessionHasErrors(['blocks.0.appearance.background', 'blocks.0.appearance.graphic']);
});
