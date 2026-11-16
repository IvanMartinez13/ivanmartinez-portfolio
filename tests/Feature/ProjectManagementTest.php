<?php

use App\Models\Project;
use App\Models\Technology;
use App\Models\User;
use Database\Seeders\PortfolioSeeder;
use Database\Seeders\ProjectSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(PortfolioSeeder::class);
    $this->seed(ProjectSeeder::class);
});

function projectPayload(array $overrides = []): array
{
    $sections = [];
    foreach (config('projects.case_study_sections') as $key => $section) {
        $sections[] = [
            'key' => $key,
            'title' => $section['title'],
            'body' => '',
            'position' => $section['position'],
            'is_visible' => false,
        ];
    }

    return array_replace([
        'name' => 'Proyecto de pruebas',
        'slug' => 'proyecto-de-pruebas',
        'summary' => 'Descripción validada para la prueba.',
        'description' => 'Detalle editorial del caso de estudio.',
        'category' => 'Aplicación web',
        'project_type' => 'Producto digital',
        'role' => 'Desarrollador Full Stack',
        'client_company' => '',
        'started_at' => '2024-01-01',
        'completed_at' => '2024-06-01',
        'development_status' => 'completed',
        'publication_status' => 'draft',
        'is_featured' => false,
        'is_visible' => true,
        'sort_order' => 10,
        'public_url' => '',
        'repository_url' => '',
        'seo_title' => '',
        'seo_description' => '',
        'main_image_alt' => '',
        'remove_main_image' => false,
        'technology_ids' => [],
        'case_study_sections' => $sections,
    ], $overrides);
}

function makePublishedProject(array $overrides = []): Project
{
    return Project::query()->create(array_merge([
        'name' => 'Proyecto público',
        'slug' => 'proyecto-publico',
        'summary' => 'Resumen público validado.',
        'description' => 'Descripción del caso.',
        'category' => 'Aplicación web',
        'project_type' => 'Producto digital',
        'role' => 'Desarrollo Full Stack',
        'development_status' => 'completed',
        'publication_status' => 'published',
        'published_at' => now(),
        'is_featured' => false,
        'is_visible' => true,
        'sort_order' => 10,
    ], $overrides));
}

function signInProjectAdmin($testCase): void
{
    $testCase->actingAs(User::factory()->create()->forceFill(['is_admin' => true]));
}

test('project tests are protected from using the application database', function () {
    expect(DB::connection()->getDriverName())->toBe('pgsql')
        ->and(DB::connection()->getDatabaseName())->toBe('db_testing');
});

test('project administration requires an administrator', function () {
    $this->get(route('admin.projects.index'))->assertRedirect(route('login'));

    $this->actingAs(User::factory()->create());
    $this->get(route('admin.projects.index'))->assertForbidden();
    $this->get(route('admin.projects.create'))->assertForbidden();
    $this->put(route('admin.technologies.update', Technology::query()->first()), [])->assertForbidden();
});

test('administrators can create update duplicate and delete projects', function () {
    signInProjectAdmin($this);
    $technology = Technology::query()->where('slug', 'laravel')->firstOrFail();
    $payload = projectPayload([
        'technology_ids' => [$technology->id],
        'case_study_sections' => collect(projectPayload()['case_study_sections'])->map(function (array $section): array {
            return $section['key'] === 'outcomes'
                ? array_merge($section, ['body' => 'Resultado pendiente de validar.', 'is_visible' => true])
                : $section;
        })->all(),
    ]);

    $this->post(route('admin.projects.store'), $payload)->assertRedirect();
    $project = Project::query()->where('slug', 'proyecto-de-pruebas')->firstOrFail();
    expect($project->publication_status)->toBe('draft')
        ->and($project->technologies->pluck('id')->all())->toBe([$technology->id])
        ->and($project->caseStudySections()->where('key', 'outcomes')->value('is_visible'))->toBeTrue();

    $updated = projectPayload([
        'name' => 'Proyecto editado',
        'slug' => 'proyecto-editado',
        'publication_status' => 'published',
        'is_featured' => true,
        'is_visible' => true,
        'technology_ids' => [$technology->id],
    ]);
    $this->post(route('admin.projects.update', $project), $updated)->assertRedirect();
    expect($project->fresh()->publication_status)->toBe('published')
        ->and($project->fresh()->is_featured)->toBeTrue()
        ->and($project->fresh()->slug)->toBe('proyecto-editado');

    $this->post(route('admin.projects.duplicate', $project))->assertRedirect();
    $copy = Project::query()->where('slug', 'proyecto-editado-copia')->firstOrFail();
    expect($copy->publication_status)->toBe('draft')
        ->and($copy->is_featured)->toBeFalse()
        ->and($copy->is_visible)->toBeFalse()
        ->and($copy->technologies()->whereKey($technology->id)->exists())->toBeTrue();

    $this->delete(route('admin.projects.destroy', $copy))->assertRedirect(route('admin.projects.index'));
    expect(Project::query()->whereKey($copy->id)->exists())->toBeFalse();
});

test('admin project list supports text and state filters', function () {
    signInProjectAdmin($this);
    Project::query()->create([
        'name' => 'Internal search target',
        'slug' => 'internal-search-target',
        'summary' => 'Searchable admin summary.',
        'category' => 'Research',
        'project_type' => 'Tool',
        'role' => 'Developer',
        'development_status' => 'in_progress',
        'publication_status' => 'draft',
        'is_featured' => false,
        'is_visible' => true,
        'sort_order' => 5,
    ]);

    $this->get(route('admin.projects.index', ['search' => 'search target', 'publication_status' => 'draft', 'featured' => 0]))
        ->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('admin/projects/index')
        ->has('projects.data', 1)
        ->where('projects.data.0.slug', 'internal-search-target'));
});

test('project validation rejects unsafe slugs and unsupported external video hosts', function () {
    signInProjectAdmin($this);
    $badSlug = projectPayload(['slug' => 'Proyecto ../inseguro']);
    $this->post(route('admin.projects.store'), $badSlug)->assertSessionHasErrors('slug');
    $duplicateSlug = projectPayload(['slug' => 'esg-suite-solutions']);
    $this->post(route('admin.projects.store'), $duplicateSlug)->assertSessionHasErrors('slug');

    $badVideo = projectPayload(['video_url' => 'https://example.org/video']);
    $this->post(route('admin.projects.store'), $badVideo)->assertSessionHasErrors('video_url');

    $unreviewed = projectPayload([
        'publication_status' => 'published',
        'summary' => 'Borrador inicial: completa esta descripción con información validada antes de publicar.',
        'category' => 'Pendiente de completar',
        'project_type' => 'Pendiente de completar',
        'role' => 'Pendiente de completar',
    ]);
    $this->post(route('admin.projects.store'), $unreviewed)->assertSessionHasErrors('publication_status');
    expect(Project::query()->where('slug', 'proyecto-de-pruebas')->exists())->toBeFalse();
});

test('public listing filters published projects and details hide unpublished sections', function () {
    $technology = Technology::query()->where('slug', 'laravel')->firstOrFail();
    $public = makePublishedProject(['slug' => 'caso-publicado', 'category' => 'Plataforma']);
    $public->technologies()->attach($technology);
    $public->caseStudySections()->create(['key' => 'solution', 'title' => 'Solución', 'body' => 'Descripción pública.', 'position' => 20, 'is_visible' => true]);
    $public->caseStudySections()->create(['key' => 'outcomes', 'title' => 'Resultados', 'body' => 'Contenido privado.', 'position' => 30, 'is_visible' => false]);
    makePublishedProject(['name' => 'Otro caso', 'slug' => 'otro-caso', 'category' => 'Aplicación web', 'is_visible' => false]);
    $this->get(route('projects.index', ['category' => 'Plataforma', 'technology' => 'laravel']))
        ->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('projects/index')
        ->has('projects.data', 1)
        ->where('projects.data.0.slug', 'caso-publicado'));

    $this->get(route('projects.show', 'caso-publicado'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('projects/show')
        ->where('project.slug', 'caso-publicado')
        ->has('project.technologies', 1)
        ->has('project.sections', 1)
        ->where('project.sections.0.body', 'Descripción pública.'));

    $this->get(route('projects.show', 'esg-suite-solutions'))->assertNotFound();
    $this->get(route('projects.show', 'otro-caso'))->assertNotFound();
});

test('homepage shows only published visible featured projects in configured order', function () {
    makePublishedProject(['name' => 'Destacado tardío', 'slug' => 'destacado-tardio', 'is_featured' => true, 'sort_order' => 30]);
    makePublishedProject(['name' => 'Destacado primero', 'slug' => 'destacado-primero', 'is_featured' => true, 'sort_order' => 10]);
    makePublishedProject(['name' => 'Oculto', 'slug' => 'oculto', 'is_featured' => true, 'is_visible' => false, 'sort_order' => 1]);
    makePublishedProject(['name' => 'No destacado', 'slug' => 'no-destacado', 'is_featured' => false, 'sort_order' => 2]);

    $this->get(route('home'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->has('portfolio.projects', 2)
        ->where('portfolio.projects.0.slug', 'destacado-primero')
        ->where('portfolio.projects.1.slug', 'destacado-tardio'));
});

test('admins can upload safe project images and video links and remove gallery media', function () {
    Storage::fake('public');
    signInProjectAdmin($this);
    $payload = projectPayload([
        'publication_status' => 'published',
        'main_image' => UploadedFile::fake()->image('hero.png', 500, 300),
        'main_image_alt' => 'Captura principal',
        'gallery_image' => UploadedFile::fake()->image('screen.png', 500, 300),
        'gallery_alt' => 'Vista de pantalla',
        'gallery_caption' => 'Pantalla del proyecto',
        'video_url' => 'https://youtu.be/dQw4w9WgXcQ',
        'video_caption' => 'Demo',
    ]);

    $this->post(route('admin.projects.store'), $payload)->assertRedirect();
    $project = Project::query()->where('slug', 'proyecto-de-pruebas')->firstOrFail();
    expect($project->main_image_path)->not->toBeNull()
        ->and($project->media()->where('kind', 'image')->count())->toBe(1)
        ->and($project->media()->where('kind', 'video')->value('external_url'))->toBe('https://youtu.be/dQw4w9WgXcQ');
    Storage::disk('public')->assertExists($project->main_image_path);

    $this->get(route('projects.show', $project->slug))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->has('project.media', 2)
        ->where('project.media.0.alt', 'Vista de pantalla'));

    $imageMedia = $project->media()->where('kind', 'image')->firstOrFail();
    $imageMedia->update(['is_visible' => false]);
    $this->get(route('projects.show', $project->slug))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->has('project.media', 1)
        ->where('project.media.0.kind', 'video'));
    $this->get(route('admin.projects.preview', $project))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('preview', true)
        ->has('project.media', 2));

    $this->delete(route('admin.projects.media.destroy', [$project, $imageMedia]))->assertRedirect();
    expect($project->media()->where('kind', 'image')->exists())->toBeFalse();
});

test('catalogued technologies can be created updated and deleted by admins', function () {
    signInProjectAdmin($this);
    $payload = ['name' => 'Astro', 'slug' => 'astro', 'category' => 'Frontend', 'icon' => 'astro', 'position' => 100, 'is_visible' => true];
    $this->post(route('admin.technologies.store'), $payload)->assertRedirect();
    $technology = Technology::query()->where('slug', 'astro')->firstOrFail();

    $this->put(route('admin.technologies.update', $technology), array_merge($payload, ['name' => 'Astro Framework', 'slug' => 'astro-framework', 'is_visible' => false]))->assertRedirect();
    expect($technology->fresh()->name)->toBe('Astro Framework')->and($technology->fresh()->is_visible)->toBeFalse();

    $this->delete(route('admin.technologies.destroy', $technology))->assertRedirect();
    expect(Technology::query()->whereKey($technology->id)->exists())->toBeFalse();
});

test('project seed data remains draft and reseeding preserves edits', function () {
    $project = Project::query()->where('slug', 'esg-suite-solutions')->firstOrFail();
    $project->update(['summary' => 'Editado', 'publication_status' => 'published', 'is_featured' => true, 'published_at' => now()]);

    $this->seed(ProjectSeeder::class);
    $this->seed(ProjectSeeder::class);

    expect(Project::query()->count())->toBe(4)
        ->and($project->fresh()->summary)->toBe('Editado')
        ->and($project->fresh()->publication_status)->toBe('published')
        ->and(Project::query()->where('publication_status', 'draft')->count())->toBe(3);
});
