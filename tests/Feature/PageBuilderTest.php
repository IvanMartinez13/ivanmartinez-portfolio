<?php

use App\Mail\PortfolioContactMessage;
use App\Models\PortfolioPage;
use App\Models\PortfolioPageRevision;
use App\Models\ProfessionalProfile;
use App\Models\User;
use Database\Seeders\PortfolioSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(PortfolioSeeder::class);
});

function pageBlock(string $type, array $content, int $position = 10, bool $visible = true): array
{
    return [
        'id' => (string) Str::uuid(),
        'type' => $type,
        'position' => $position,
        'visible' => $visible,
        'variant' => 'default',
        'spacing' => 'default',
        'nav_label' => null,
        'content' => $content,
    ];
}

function pagePayload(array $overrides = []): array
{
    return array_replace([
        'title' => 'Página de pruebas',
        'slug' => 'pagina-de-pruebas',
        'seo_title' => 'SEO de prueba',
        'seo_description' => 'Descripción de prueba.',
        'blocks' => [pageBlock('rich_text', ['title' => 'Texto público', 'html' => '<p>Contenido original.</p>'])],
    ], $overrides);
}

function signInPageAdmin($testCase): void
{
    $testCase->actingAs(User::factory()->create(['email_verified_at' => now()])->forceFill(['is_admin' => true]));
}

test('page builder tests use only the isolated PostgreSQL testing database', function () {
    expect(DB::connection()->getDriverName())->toBe('pgsql')
        ->and(DB::connection()->getDatabaseName())->toBe('db_testing');
});

test('page builder administration is restricted to verified administrators', function () {
    $this->get(route('admin.pages.index'))->assertRedirect(route('login'));
    $this->actingAs(User::factory()->create(['email_verified_at' => now()]));
    $this->get(route('admin.pages.index'))->assertForbidden();
    $this->post(route('admin.pages.store'), pagePayload())->assertForbidden();
});

test('administrators can create draft pages and only publication makes them public', function () {
    signInPageAdmin($this);
    $this->get(route('admin.pages.create'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('admin/pages/editor')->has('blockTypes.hero')->has('blockTypes.contact_form'));

    $this->post(route('admin.pages.store'), pagePayload())->assertRedirect();
    $page = PortfolioPage::query()->where('slug', 'pagina-de-pruebas')->firstOrFail();
    expect($page->status)->toBe('draft')->and($page->published_blocks)->toBeNull();
    $this->get('/pagina-de-pruebas')->assertNotFound();

    $this->post(route('admin.pages.publish', $page))->assertRedirect();
    expect($page->fresh()->published_blocks[0]['content']['html'])->toBe('<p>Contenido original.</p>');
    $this->get('/pagina-de-pruebas')->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('public/page')->where('page.slug', 'pagina-de-pruebas')->where('blocks.0.content.html', '<p>Contenido original.</p>'));
});

test('editing published pages leaves public revision unchanged until publish and supports restoring revisions', function () {
    signInPageAdmin($this);
    $this->post(route('admin.pages.store'), pagePayload())->assertRedirect();
    $page = PortfolioPage::query()->where('slug', 'pagina-de-pruebas')->firstOrFail();
    $this->post(route('admin.pages.publish', $page))->assertRedirect();
    $firstRevision = PortfolioPageRevision::query()->where('portfolio_page_id', $page->id)->firstOrFail();

    $updated = pagePayload(['title' => 'Página actualizada', 'slug' => 'pagina-actualizada', 'seo_title' => 'SEO actualizado', 'blocks' => [pageBlock('rich_text', ['title' => 'Nuevo texto', 'html' => '<p>Segunda versión.</p>'])]]);
    $this->put(route('admin.pages.update', $page), $updated)->assertRedirect();
    $this->get('/pagina-de-pruebas')->assertOk()->assertInertia(fn (Assert $response) => $response
        ->where('page.title', 'Página de pruebas')->where('page.slug', 'pagina-de-pruebas')
        ->where('page.seoTitle', 'SEO de prueba')->where('blocks.0.content.html', '<p>Contenido original.</p>'));
    $this->get('/pagina-actualizada')->assertNotFound();
    $this->get(route('admin.pages.preview', $page).'?frame=1')->assertOk()->assertInertia(fn (Assert $response) => $response->where('preview', true)->where('blocks.0.content.html', '<p>Segunda versión.</p>'));

    $this->post(route('admin.pages.publish', $page))->assertRedirect();
    expect($page->fresh()->revisions()->count())->toBe(2);
    $this->get('/pagina-de-pruebas')->assertNotFound();
    $this->get('/pagina-actualizada')->assertOk()->assertInertia(fn (Assert $response) => $response
        ->where('page.title', 'Página actualizada')->where('page.slug', 'pagina-actualizada')
        ->where('page.seoTitle', 'SEO actualizado')->where('blocks.0.content.html', '<p>Segunda versión.</p>'));

    $this->post(route('admin.pages.revisions.restore', [$page, $firstRevision]))->assertRedirect();
    expect($page->fresh()->draft_blocks[0]['content']['html'])->toBe('<p>Contenido original.</p>')
        ->and($page->fresh()->published_blocks[0]['content']['html'])->toBe('<p>Segunda versión.</p>');
    $this->post(route('admin.pages.unpublish', $page))->assertRedirect();
    $this->get('/pagina-actualizada')->assertNotFound();
});

test('page slugs protect system routes and existing projects route keeps precedence', function () {
    signInPageAdmin($this);
    foreach (['admin', 'projects', 'login', 'settings', 'home'] as $slug) {
        $this->post(route('admin.pages.store'), pagePayload(['slug' => $slug]))->assertSessionHasErrors('slug');
    }
    $this->get('/projects')->assertOk()->assertInertia(fn (Assert $page) => $page->component('projects/index'));
    $this->get('/login')->assertRedirect();
});

test('block order visibility and rich text sanitizer control public output', function () {
    signInPageAdmin($this);
    $this->post(route('admin.pages.store'), pagePayload([
        'blocks' => [
            pageBlock('rich_text', ['title' => 'Oculto', 'html' => '<p>Privado</p>'], 0, false),
            pageBlock('rich_text', ['title' => 'Público', 'html' => '<p onclick="alert(1)">Texto <script>alert(1)</script><a href="javascript:alert(1)">enlace</a></p>'], 20),
        ],
    ]))->assertRedirect();
    $page = PortfolioPage::query()->where('slug', 'pagina-de-pruebas')->firstOrFail();
    $this->post(route('admin.pages.publish', $page))->assertRedirect();
    $this->get('/pagina-de-pruebas')->assertOk()->assertInertia(fn (Assert $response) => $response
        ->has('blocks', 1)->where('blocks.0.content.title', 'Público')
        ->where('blocks.0.content.html', '<p>Texto <a>enlace</a></p>'));
});

test('reserved URLs cannot be used in video blocks and contact form sends mail securely', function () {
    signInPageAdmin($this);
    $bad = pagePayload(['blocks' => [pageBlock('video', ['url' => 'javascript:alert(1)', 'title' => 'Unsafe'])]]);
    $this->post(route('admin.pages.store'), $bad)->assertStatus(422);

    ProfessionalProfile::query()->where('key', 'primary')->update(['contact_email' => 'owner@example.test']);
    Mail::fake();
    $this->post(route('contact.store'), ['name' => 'Visitor', 'email' => 'visitor@example.test', 'message' => 'I would like to discuss a project.'])->assertRedirect();
    Mail::assertSent(
        PortfolioContactMessage::class,
    );
});

test('page duplicates are new unpublished records and home cannot be deleted', function () {
    signInPageAdmin($this);
    $home = PortfolioPage::query()->where('key', 'home')->firstOrFail();
    $this->delete(route('admin.pages.destroy', $home))->assertForbidden();
    $this->post(route('admin.pages.duplicate', $home))->assertRedirect();
    $copy = PortfolioPage::query()->where('slug', 'home-copia')->firstOrFail();
    expect($copy->status)->toBe('draft')->and($copy->published_blocks)->toBeNull()
        ->and($copy->draft_blocks)->toHaveCount(count($home->draft_blocks));
});

test('an existing published slug cannot be reused until that publication changes', function () {
    signInPageAdmin($this);
    $this->post(route('admin.pages.store'), pagePayload(['slug' => 'slug-ocupado']))->assertRedirect();
    $first = PortfolioPage::query()->where('slug', 'slug-ocupado')->firstOrFail();
    $this->post(route('admin.pages.publish', $first))->assertRedirect();

    $firstPayload = pagePayload(['title' => $first->title, 'slug' => 'slug-nuevo', 'blocks' => $first->draft_blocks]);
    $this->put(route('admin.pages.update', $first), $firstPayload)->assertRedirect();
    expect($first->fresh()->published_slug)->toBe('slug-ocupado');

    $this->post(route('admin.pages.store'), pagePayload(['slug' => 'slug-ocupado']))->assertRedirect();
    $second = PortfolioPage::query()->where('slug', 'slug-ocupado')->whereKeyNot($first->id)->firstOrFail();
    $this->post(route('admin.pages.publish', $second))->assertSessionHasErrors('slug');
});

test('an administrator can delete non-home pages and their revisions', function () {
    signInPageAdmin($this);
    $this->post(route('admin.pages.store'), pagePayload())->assertRedirect();
    $page = PortfolioPage::query()->where('slug', 'pagina-de-pruebas')->firstOrFail();
    $this->post(route('admin.pages.publish', $page))->assertRedirect();
    $this->delete(route('admin.pages.destroy', $page))->assertRedirect(route('admin.pages.index'));
    expect(PortfolioPage::query()->whereKey($page->id)->exists())->toBeFalse()
        ->and(PortfolioPageRevision::query()->where('portfolio_page_id', $page->id)->exists())->toBeFalse();
});

test('page image assets validate file type and require an administrator', function () {
    Storage::fake('local');
    $page = PortfolioPage::query()->where('key', 'home')->firstOrFail();
    $this->post(route('admin.pages.assets.store', $page), ['image' => UploadedFile::fake()->image('hero.png')])->assertRedirect(route('login'));

    signInPageAdmin($this);
    $response = $this->post(route('admin.pages.assets.store', $page), ['image' => UploadedFile::fake()->image('hero.png')]);
    $response->assertOk()->assertJsonStructure(['url']);
    $url = $response->json('url');
    expect($url)->toContain('/page-assets/'.$page->id.'/');
    Storage::disk('local')->assertExists('pages/'.$page->id.'/'.basename(parse_url($url, PHP_URL_PATH)));
    $publishedBlocks = $page->published_blocks;
    $publishedBlocks[] = pageBlock('image', ['url' => $url, 'alt' => 'Imagen de prueba'], 100, false);
    $page->published_blocks = $publishedBlocks;
    $page->save();
    auth()->logout();
    $this->get($url)->assertNotFound();
    $publishedBlocks = $page->fresh()->published_blocks;
    $publishedBlocks[array_key_last($publishedBlocks)]['visible'] = true;
    $page->published_blocks = $publishedBlocks;
    $page->save();
    $this->get($url)->assertOk()->assertHeader('X-Content-Type-Options', 'nosniff');

    signInPageAdmin($this);
    $this->post(route('admin.pages.assets.store', $page), ['image' => UploadedFile::fake()->create('payload.svg', 2, 'image/svg+xml')])->assertSessionHasErrors('image');
});

test('the portfolio page seeder creates builder blocks and preserves edits on repeat runs', function () {
    $home = PortfolioPage::query()->where('key', 'home')->firstOrFail();
    $initial = $home->draft_blocks;
    expect($initial)->toHaveCount(6)->and($home->published_blocks)->toHaveCount(6)
        ->and($home->revisions()->count())->toBe(1);

    $edited = $initial;
    $edited[0]['content']['headline'] = 'Contenido editado';
    $home->draft_blocks = $edited;
    $home->save();
    $this->seed(PortfolioSeeder::class);

    expect($home->fresh()->draft_blocks[0]['content']['headline'])->toBe('Contenido editado')
        ->and($home->fresh()->revisions()->count())->toBe(1);
});
