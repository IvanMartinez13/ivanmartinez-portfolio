<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\HomePageController;
use App\Http\Controllers\Admin\PageAssetController;
use App\Http\Controllers\Admin\PortfolioPageController;
use App\Http\Controllers\Admin\PortfolioSettingsController;
use App\Http\Controllers\Admin\ProfessionalProfileController;
use App\Http\Controllers\Admin\ProjectController;
use App\Http\Controllers\Admin\TechnologyController;
use App\Http\Controllers\PublicContactController;
use App\Http\Controllers\PublicPageController;
use App\Http\Controllers\PublicProjectController;
use App\Models\PortfolioPage;
use App\Services\Pages\BuildPageBlocks;
use App\Services\Portfolio\BuildPublicPortfolio;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function (BuildPublicPortfolio $portfolio, BuildPageBlocks $blocks) {
    $home = PortfolioPage::query()->published()->where('key', 'home')->firstOrFail();
    $content = $portfolio->home();
    $builderBlocks = $blocks->renderData($home->published_blocks ?? [], false, $content);
    $content['navigation'] = collect($builderBlocks)->filter(fn (array $block): bool => filled($block['nav_label'] ?? null))
        ->map(fn (array $block): array => ['label' => $block['nav_label'], 'href' => '#'.$block['id']])->values()->all();

    return Inertia::render('welcome', [
        'portfolio' => $content,
        'builderBlocks' => $builderBlocks,
        'pagePreview' => false,
        'pageSeo' => ['title' => $home->published_seo_title, 'description' => $home->published_seo_description],
    ]);
})->name('home');

Route::get('/projects', [PublicProjectController::class, 'index'])->name('projects.index');
Route::get('/projects/{slug}', [PublicProjectController::class, 'show'])
    ->where('slug', '[a-z0-9]+(?:-[a-z0-9]+)*')
    ->name('projects.show');
Route::post('/contact', [PublicContactController::class, 'store'])->middleware('throttle:5,1')->name('contact.store');
Route::get('/page-assets/{page}/{filename}', [PageAssetController::class, 'show'])
    ->where(['filename' => '[a-fA-F0-9-]{36}\.(?:jpg|jpeg|png|webp)'])
    ->name('pages.assets.show');

Route::prefix('admin')->name('admin.')->middleware(['auth', 'verified', 'can:access-admin'])->group(function () {
    Route::get('/', DashboardController::class)->name('dashboard');

    Route::get('/home', [HomePageController::class, 'edit'])->name('home.edit');
    Route::put('/home', fn () => to_route('admin.pages.edit', PortfolioPage::query()->where('key', 'home')->firstOrFail()))->name('home.update');

    Route::get('/pages', [PortfolioPageController::class, 'index'])->name('pages.index');
    Route::get('/pages/create', [PortfolioPageController::class, 'create'])->name('pages.create');
    Route::post('/pages', [PortfolioPageController::class, 'store'])->middleware('throttle:30,1')->name('pages.store');
    Route::get('/pages/{page}/edit', [PortfolioPageController::class, 'edit'])->name('pages.edit');
    Route::put('/pages/{page}', [PortfolioPageController::class, 'update'])->middleware('throttle:30,1')->name('pages.update');
    Route::delete('/pages/{page}', [PortfolioPageController::class, 'destroy'])->name('pages.destroy');
    Route::post('/pages/{page}/duplicate', [PortfolioPageController::class, 'duplicate'])->name('pages.duplicate');
    Route::post('/pages/{page}/assets', [PageAssetController::class, 'store'])->middleware('throttle:20,1')->name('pages.assets.store');
    Route::post('/pages/{page}/publish', [PortfolioPageController::class, 'publish'])->name('pages.publish');
    Route::post('/pages/{page}/unpublish', [PortfolioPageController::class, 'unpublish'])->name('pages.unpublish');
    Route::get('/pages/{page}/preview', [PortfolioPageController::class, 'preview'])->name('pages.preview');
    Route::post('/pages/{page}/revisions/{revision}/restore', [PortfolioPageController::class, 'restore'])->name('pages.revisions.restore');

    Route::get('/profile', [ProfessionalProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/profile', [ProfessionalProfileController::class, 'update'])->middleware('throttle:20,1')->name('profile.update');

    Route::get('/settings', [PortfolioSettingsController::class, 'edit'])->name('settings.edit');
    Route::put('/settings', [PortfolioSettingsController::class, 'update'])->middleware('throttle:20,1')->name('settings.update');

    Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::get('/projects/create', [ProjectController::class, 'create'])->name('projects.create');
    Route::post('/projects', [ProjectController::class, 'store'])->middleware('throttle:30,1')->name('projects.store');
    Route::get('/projects/{project}/edit', [ProjectController::class, 'edit'])->name('projects.edit');
    Route::post('/projects/{project}', [ProjectController::class, 'update'])->middleware('throttle:30,1')->name('projects.update');
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])->name('projects.destroy');
    Route::post('/projects/{project}/duplicate', [ProjectController::class, 'duplicate'])->name('projects.duplicate');
    Route::get('/projects/{project}/preview', [ProjectController::class, 'preview'])->name('projects.preview');
    Route::delete('/projects/{project}/media/{media}', [ProjectController::class, 'destroyMedia'])->name('projects.media.destroy');

    Route::get('/technologies', [TechnologyController::class, 'index'])->name('technologies.index');
    Route::post('/technologies', [TechnologyController::class, 'store'])->name('technologies.store');
    Route::put('/technologies/{technology}', [TechnologyController::class, 'update'])->name('technologies.update');
    Route::delete('/technologies/{technology}', [TechnologyController::class, 'destroy'])->name('technologies.destroy');
});

require __DIR__.'/settings.php';

Route::get('/{slug}', [PublicPageController::class, 'show'])
    ->where('slug', '(?!(?:admin|projects|login|logout|register|forgot-password|reset-password|settings|storage|build|api|up|home)$)[a-z0-9]+(?:-[a-z0-9]+)*')
    ->name('pages.public');
