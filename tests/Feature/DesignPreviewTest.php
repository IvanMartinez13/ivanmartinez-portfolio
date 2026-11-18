<?php

use App\Models\Project;
use App\Models\ResumeExperience;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

test('visual design preview uses the existing admin authorization', function (): void {
    $this->get(route('admin.design-preview'))->assertRedirect(route('login'));

    $this->actingAs(User::factory()->create());
    $this->get(route('admin.design-preview'))->assertForbidden();
});

test('visual design preview uses published portfolio data and does not expose resume drafts', function (): void {
    Project::query()->create([
        'name' => 'Caso publicado',
        'slug' => 'caso-publicado',
        'summary' => 'Descripción publicada desde el CMS.',
        'category' => 'Producto digital',
        'project_type' => 'Aplicación web',
        'role' => 'Desarrollo',
        'development_status' => 'completed',
        'publication_status' => 'published',
        'published_at' => now(),
        'is_featured' => true,
        'is_visible' => true,
        'sort_order' => 1,
    ]);
    Project::query()->create([
        'name' => 'Caso privado',
        'slug' => 'caso-privado',
        'summary' => 'Este borrador no se debe mostrar.',
        'category' => 'Pendiente',
        'project_type' => 'Pendiente',
        'role' => 'Pendiente',
        'development_status' => 'unspecified',
        'publication_status' => 'draft',
        'is_featured' => true,
        'is_visible' => true,
        'sort_order' => 0,
    ]);
    ResumeExperience::query()->create([
        'job_title' => 'Cargo secreto de borrador',
        'company' => 'Empresa privada',
        'description' => 'No se publica hasta tener una versión del CV.',
        'responsibilities' => [],
        'achievements' => [],
        'sort_order' => 0,
        'is_visible' => true,
    ]);

    $admin = User::factory()->create(['email_verified_at' => now()])->forceFill(['is_admin' => true]);
    $this->actingAs($admin)->get(route('admin.design-preview'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('admin/design-preview')
        ->where('identity.name', 'Iván Martínez')
        ->where('resume.published', false)
        ->has('resume.experiences', 0)
        ->has('projects', 1)
        ->where('projects.0.slug', 'caso-publicado')
        ->where('projects.0.description', 'Descripción publicada desde el CMS.')
        ->has('technologies')
        ->missing('projects.1')
        ->missing('resume.experiences.0.job_title'));

    $this->get(route('home'))->assertOk()->assertInertia(fn (Assert $page) => $page->component('welcome'));
});
