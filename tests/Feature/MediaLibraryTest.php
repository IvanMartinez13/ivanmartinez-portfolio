<?php

use App\Models\MediaAsset;
use App\Models\MediaAssetReference;
use App\Models\PortfolioPage;
use App\Models\PortfolioPageRevision;
use App\Models\User;
use Database\Seeders\PortfolioSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

function mediaAdmin($testCase): void
{
    $testCase->actingAs(User::factory()->create(['email_verified_at' => now()])->forceFill(['is_admin' => true]));
}

function mediaBlock(int $assetId): array
{
    return ['id' => (string) Str::uuid(), 'type' => 'image', 'position' => 10, 'visible' => true,
        'variant' => 'default', 'spacing' => 'default', 'content' => ['url' => '/spoofed-image.jpg', 'asset_id' => $assetId, 'alt' => 'Imagen accesible']];
}

beforeEach(function () {
    $this->seed(PortfolioSeeder::class);
});

test('media library operations are limited to admins and use isolated PostgreSQL testing database', function () {
    expect(DB::connection()->getDriverName())->toBe('pgsql')->and(DB::connection()->getDatabaseName())->toBe('db_testing');
    $this->get(route('admin.media.index'))->assertRedirect(route('login'));
    $this->post(route('admin.media.store'))->assertRedirect(route('login'));
    mediaAdmin($this);
    $this->get(route('admin.media.index'))->assertOk()->assertInertia(fn ($page) => $page->component('admin/media/index')->has('assets.data'));
});

test('admin can upload and edit accessible image metadata while rejecting unsafe file types', function () {
    Storage::fake('public');
    mediaAdmin($this);
    $this->post(route('admin.media.store'), ['image' => UploadedFile::fake()->image('profile.png'), 'alt_text' => 'Retrato profesional'])->assertCreated();
    $asset = MediaAsset::query()->firstOrFail();
    expect($asset->alt_text)->toBe('Retrato profesional')->and(Storage::disk('public')->exists($asset->path))->toBeTrue();
    $this->put(route('admin.media.update', $asset), ['alt_text' => 'Retrato en exterior'])->assertOk();
    expect($asset->fresh()->alt_text)->toBe('Retrato en exterior');
    $this->post(route('admin.media.store'), ['image' => UploadedFile::fake()->create('payload.svg', 2, 'image/svg+xml')])->assertSessionHasErrors('image');
});

test('page image asset ids resolve to canonical public media URLs and references protect drafts publications and revisions', function () {
    Storage::fake('public');
    Storage::disk('public')->put('media/portfolio.png', 'image-bytes');
    $asset = MediaAsset::query()->create(['public_id' => (string) Str::uuid(), 'disk' => 'public', 'path' => 'media/portfolio.png', 'original_name' => 'portfolio.png', 'mime_type' => 'image/png', 'size' => 12, 'alt_text' => 'Imagen accesible']);
    mediaAdmin($this);
    $page = PortfolioPage::query()->where('key', 'home')->firstOrFail();
    $payload = ['title' => 'Página multimedia', 'slug' => 'pagina-multimedia', 'blocks' => [mediaBlock($asset->id)]];
    $this->post(route('admin.pages.store'), $payload)->assertRedirect();
    $page = PortfolioPage::query()->where('slug', 'pagina-multimedia')->firstOrFail();
    expect($page->fresh()->draft_blocks[0]['content']['url'])->toBe(route('media.show', $asset->public_id))
        ->and($asset->references()->where('scope', 'draft')->exists())->toBeTrue();
    $this->delete(route('admin.media.destroy', $asset))->assertStatus(409);

    $this->post(route('admin.pages.publish', $page))->assertRedirect();
    expect($asset->references()->where('scope', 'published')->exists())->toBeTrue()
        ->and($asset->references()->where('scope', 'revision')->exists())->toBeTrue();
    auth()->logout();
    $this->get(route('media.show', $asset->public_id))->assertOk()->assertHeader('X-Content-Type-Options', 'nosniff');
    $this->delete(route('admin.media.destroy', $asset))->assertRedirect(route('login'));
    mediaAdmin($this);
    $this->post(route('admin.pages.unpublish', $page))->assertRedirect();
    $this->delete(route('admin.media.destroy', $asset))->assertStatus(409);
});

test('unreferenced media can be deleted but retained revision references prevent physical deletion', function () {
    Storage::fake('public');
    Storage::disk('public')->put('media/unused.png', 'image-bytes');
    $asset = MediaAsset::query()->create(['public_id' => (string) Str::uuid(), 'disk' => 'public', 'path' => 'media/unused.png', 'original_name' => 'unused.png', 'mime_type' => 'image/png', 'size' => 12, 'alt_text' => 'Imagen']);
    mediaAdmin($this);
    $page = PortfolioPage::query()->where('key', 'home')->firstOrFail();
    $revision = PortfolioPageRevision::query()->create(['portfolio_page_id' => $page->id, 'version' => 50, 'title' => 'Historial', 'slug' => 'historial', 'blocks' => [mediaBlock($asset->id)]]);
    MediaAssetReference::query()->create(['media_asset_id' => $asset->id, 'portfolio_page_id' => $page->id, 'portfolio_page_revision_id' => $revision->id, 'scope' => 'revision']);
    $this->delete(route('admin.media.destroy', $asset))->assertStatus(409);
    $revision->delete();
    $this->delete(route('admin.media.destroy', $asset))->assertOk();
    Storage::disk('public')->assertMissing('media/unused.png');
});

test('a media file used only by a hidden published block is not publicly served', function () {
    Storage::fake('public');
    Storage::disk('public')->put('media/private.png', 'image-bytes');
    $asset = MediaAsset::query()->create(['public_id' => (string) Str::uuid(), 'disk' => 'public', 'path' => 'media/private.png', 'original_name' => 'private.png', 'mime_type' => 'image/png', 'size' => 12, 'alt_text' => 'Oculta']);
    mediaAdmin($this);
    $payload = ['title' => 'Página oculta', 'slug' => 'pagina-oculta', 'blocks' => [array_merge(mediaBlock($asset->id), ['visible' => false])]];
    $this->post(route('admin.pages.store'), $payload)->assertRedirect();
    $page = PortfolioPage::query()->where('slug', 'pagina-oculta')->firstOrFail();
    $this->post(route('admin.pages.publish', $page))->assertRedirect();
    auth()->logout();
    $this->get(route('media.show', $asset->public_id))->assertNotFound();
});
