<?php

use App\Models\PortfolioPage;
use App\Models\PortfolioSection;
use App\Models\PortfolioSetting;
use App\Models\ProfessionalProfile;
use App\Models\User;
use Database\Seeders\PortfolioSeeder;
use Database\Seeders\ProjectSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(PortfolioSeeder::class);
    $this->seed(ProjectSeeder::class);
});

test('feature tests use an isolated PostgreSQL database', function () {
    expect(DB::connection()->getDriverName())->toBe('pgsql')
        ->and(DB::connection()->getDatabaseName())->toBe('db_testing');
});

test('guests are redirected from admin pages', function () {
    $this->get(route('admin.dashboard'))->assertRedirect(route('login'));
});

test('authenticated non-admin users are forbidden from admin pages', function () {
    $this->actingAs(User::factory()->create());

    $this->get(route('admin.dashboard'))->assertForbidden();
    $this->put(route('admin.settings.update'), [])->assertForbidden();
});

test('an authorized admin can use the dashboard and editor', function () {
    $this->actingAs(User::factory()->create()->forceFill(['is_admin' => true]));

    $this->get(route('admin.dashboard'))->assertOk()->assertInertia(fn (Assert $page) => $page->component('admin/dashboard'));
    $home = PortfolioPage::query()->where('key', 'home')->firstOrFail();
    $this->get(route('admin.home.edit'))->assertRedirect(route('admin.pages.edit', $home));
});

test('admin changes persist and public content follows visibility and order', function () {
    $admin = User::factory()->create()->forceFill(['is_admin' => true]);
    $this->actingAs($admin);
    $home = PortfolioPage::query()->where('key', 'home')->firstOrFail();
    $blocks = $home->draft_blocks;
    foreach ($blocks as &$block) {
        if (($block['content']['legacy_key'] ?? null) === 'hero') {
            $block['content']['headline'] = 'Construyo productos digitales.';
            $block['content']['show_navigation_link'] = false;
            $block['content']['show_projects_action'] = false;
            $block['content']['projects_action_label'] = 'Casos seleccionados';
            $block['content']['download_variant'] = 'ats';
        }
        if (($block['content']['legacy_key'] ?? null) === 'experience') {
            $block['visible'] = false;
        }
        if (($block['content']['legacy_key'] ?? null) === 'contact') {
            $block['position'] = 5;
            $block['content']['title'] = 'Hablemos de tu proyecto.';
        }
    }
    unset($block);
    $payload = ['title' => 'Inicio revisado', 'slug' => 'home', 'seo_title' => 'Inicio', 'seo_description' => '', 'blocks_json' => json_encode($blocks)];
    $this->put(route('admin.pages.update', $home), $payload)->assertRedirect();

    expect($home->fresh()->draft_blocks[0]['content']['legacy_key'])->toBe('hero')
        ->and($home->fresh()->draft_blocks[0]['content']['show_navigation_link'])->toBeFalse()
        ->and($home->fresh()->draft_blocks[0]['content']['download_variant'])->toBe('ats')
        ->and($home->fresh()->published_blocks[0]['content']['headline'])->not->toBe('Construyo productos digitales.');
    $this->get(route('home'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('builderBlocks.0.content.headline', $home->published_blocks[0]['content']['headline']));

    $this->post(route('admin.pages.publish', $home))->assertRedirect();
    $this->get(route('home'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('builderBlocks.1.content.title', 'Hablemos de tu proyecto.')
        ->where('builderBlocks.0.content.projects_action_label', 'Casos seleccionados')
        ->where('builderBlocks.0.content.show_projects_action', false)
        ->where('builderBlocks.0.content.download_variant', 'ats')
        ->where('portfolio.resume.showNavigation', false)
        ->where('portfolio.navigation.0.label', 'Contacto')
        ->has('portfolio.navigation', 4));
});

test('invalid portfolio settings are rejected', function () {
    $this->actingAs(User::factory()->create()->forceFill(['is_admin' => true]));

    $this->put(route('admin.settings.update'), [
        'site_title' => '',
        'default_meta_description' => 'x',
        'locale' => 'invalid_locale',
        'timezone' => 'Mars/Olympus',
        'footer_note' => str_repeat('a', 250),
    ])->assertSessionHasErrors(['site_title', 'locale', 'timezone', 'footer_note']);
});

test('the public portfolio renders database content and returns not found for drafts', function () {
    $this->assertDatabaseHas('professional_profiles', ['key' => 'primary', 'public_name' => 'Iván Martínez']);
    $this->get(route('home'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('welcome')
        ->where('portfolio.identity.name', 'Iván Martínez')
        ->where('portfolio.navigation.0.label', 'Proyectos')
        ->has('portfolio.navigation', 5)
        ->has('portfolio.projects', 0)
        ->has('portfolio.sections', 6));

    PortfolioPage::query()->where('key', 'home')->update(['status' => 'draft']);
    $this->get(route('home'))->assertNotFound();
});

test('the portfolio seeder is idempotent and preserves edits', function () {
    ProfessionalProfile::query()->where('key', 'primary')->update(['public_name' => 'Nombre editado']);
    PortfolioSection::query()->where('key', 'projects')->update(['content' => ['title' => 'Título editado']]);

    $this->seed(PortfolioSeeder::class);
    $this->seed(PortfolioSeeder::class);

    expect(ProfessionalProfile::query()->where('key', 'primary')->value('public_name'))->toBe('Nombre editado')
        ->and(PortfolioSection::query()->where('key', 'projects')->value('content')['title'])->toBe('Título editado')
        ->and(PortfolioPage::query()->count())->toBe(1)
        ->and(PortfolioSection::query()->count())->toBe(6)
        ->and(PortfolioSetting::query()->count())->toBe(1);
});

test('artisan grants and revokes admin access for an existing user without changing credentials', function () {
    $user = User::factory()->create(['email' => 'admin@example.test']);
    $password = $user->password;

    $this->artisan('cms:admin', ['email' => 'admin@example.test'])->assertSuccessful();
    expect($user->fresh()->is_admin)->toBeTrue()->and($user->fresh()->password)->toBe($password);

    $this->artisan('cms:admin', ['email' => 'admin@example.test'])->assertSuccessful();
    $this->artisan('cms:admin', ['email' => 'admin@example.test', '--revoke' => true])->assertSuccessful();
    expect($user->fresh()->is_admin)->toBeFalse();
});
