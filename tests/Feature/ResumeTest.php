<?php

use App\Models\PortfolioPage;
use App\Models\PortfolioSetting;
use App\Models\ProfessionalProfile;
use App\Models\Project;
use App\Models\ResumeCertification;
use App\Models\ResumeEducation;
use App\Models\ResumeExperience;
use App\Models\ResumeLanguage;
use App\Models\ResumePublication;
use App\Models\ResumeSetting;
use App\Models\Technology;
use App\Models\User;
use App\Services\Pages\BuildPageBlocks;
use App\Services\Portfolio\BuildPublicPortfolio;
use App\Services\Resume\BuildResume;
use App\Support\PublicLocation;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
});

function resumeAdmin($testCase): void
{
    $testCase->actingAs(User::factory()->create(['email_verified_at' => now()])->forceFill(['is_admin' => true]));
}

function resumePayload(array $overrides = []): array
{
    $technology = Technology::query()->firstOrFail();
    $project = Project::query()->firstOrCreate(['slug' => 'proyecto-seleccionado'], [
        'name' => 'Proyecto seleccionado', 'summary' => 'Resumen confirmado',
        'category' => 'Producto', 'project_type' => 'Software', 'role' => 'Desarrollador', 'development_status' => 'completed',
        'publication_status' => 'published', 'published_at' => now(), 'is_visible' => true,
    ]);

    return array_replace_recursive([
        'config' => [
            'section_order' => ['experience', 'skills', 'education', 'certifications', 'languages', 'projects'],
            'visible_sections' => ['experience', 'skills', 'education', 'certifications', 'languages', 'projects'],
            'experience_ids' => [], 'project_ids' => [$project->id], 'technology_ids' => [$technology->id],
            'language' => 'es', 'visible_links' => [], 'show_email' => false, 'theme' => 'editorial', 'target_length' => 'auto', 'include_photo' => false,
        ],
        'experiences' => [[
            'id' => null, 'job_title' => 'Desarrollador Full Stack', 'company' => 'Empresa de ejemplo verificada', 'location' => 'Mallorca',
            'started_at' => '2021-01-01', 'ended_at' => '2022-06-01', 'is_current' => false, 'description' => 'Desarrollo y mantenimiento de productos digitales.',
            'responsibilities' => ['Implementación de funcionalidades web.'], 'achievements' => ['Migración de módulo a arquitectura mantenible.'],
            'sort_order' => 0, 'is_visible' => true, 'technology_ids' => [$technology->id], 'project_ids' => [$project->id],
        ]],
        'education' => [['id' => null, 'qualification' => 'Formación técnica', 'institution' => 'Institución verificada', 'started_at' => '2017-09-01', 'ended_at' => '2020-06-30', 'description' => '', 'sort_order' => 0, 'is_visible' => true]],
        'certifications' => [['id' => null, 'name' => 'Certificación verificada', 'issuer' => 'Entidad emisora', 'issued_at' => '2022-05-01', 'credential_url' => 'https://credentials.example.test/123', 'sort_order' => 0, 'is_visible' => true]],
        'languages' => [['id' => null, 'language' => 'Español', 'declared_level' => 'Nativo', 'certification_name' => '', 'certification_url' => '', 'sort_order' => 0, 'is_visible' => true]],
    ], $overrides);
}

function pdfTextOperators(string $pdf): string
{
    preg_match_all('/stream\r?\n(.*?)\r?\nendstream/s', $pdf, $matches);
    $contents = '';
    foreach ($matches[1] as $stream) {
        $decoded = @gzuncompress(rtrim($stream, "\r\n"));
        if ($decoded !== false) {
            $contents .= $decoded;
        }
    }

    return $contents;
}

test('resume administration uses PostgreSQL db_testing and stays behind existing admin authorization', function () {
    expect(DB::connection()->getDriverName())->toBe('pgsql')->and(DB::connection()->getDatabaseName())->toBe('db_testing');
    $this->get(route('admin.resume.edit'))->assertRedirect(route('login'));
    $this->put(route('admin.resume.update'), [])->assertRedirect(route('login'));
    $this->post(route('admin.resume.publish'), [])->assertRedirect(route('login'));
    $this->get(route('cv.show'))->assertNotFound();
    $this->get(route('cv.pdf', 'ats'))->assertNotFound();

    resumeAdmin($this);
    $this->get(route('admin.resume.edit'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('admin/resume/index')->has('config.section_order', 6)->has('experiences')->has('technologies')->has('projects'));
    $this->get(route('admin.resume.preview'))->assertOk()->assertInertia(fn (Assert $page) => $page->component('cv/show')->where('preview', true));
});

test('real resume importer is safe, idempotent and never publishes or overwrites matching manual records', function () {
    expect(DB::connection()->getDriverName())->toBe('pgsql')->and(DB::connection()->getDatabaseName())->toBe('db_testing');

    $existingExperience = ResumeExperience::query()->create([
        'job_title' => 'Full Stack Developer', 'company' => 'Podarcis SL', 'location' => 'Dirección privada',
        'started_at' => '2023-02-01', 'is_current' => true, 'description' => 'Texto editado manualmente',
        'responsibilities' => ['Aportación conservada'], 'achievements' => [], 'sort_order' => 5, 'is_visible' => true,
    ]);
    $existingEducation = ResumeEducation::query()->create([
        'qualification' => 'CFGS - Desarrollo de aplicaciones multiplataforma', 'institution' => 'Escuela EDIB',
        'started_at' => '2018-01-01', 'ended_at' => '2022-12-31', 'description' => 'Descripción editada', 'sort_order' => 10, 'is_visible' => true,
    ]);
    ResumeLanguage::query()->create(['language' => 'Castellano', 'declared_level' => 'Nativo', 'sort_order' => 10, 'is_visible' => true]);
    ResumePublication::query()->create(['version' => 4, 'snapshot' => ['profile' => ['name' => 'Versión anterior']], 'created_at' => now()]);

    $this->artisan('cms:import-real-resume --dry-run')->assertSuccessful();
    expect(ResumeExperience::query()->count())->toBe(1)->and(Technology::query()->where('slug', 'mysql')->exists())->toBeFalse();

    $this->artisan('cms:import-real-resume')->assertSuccessful();
    $this->artisan('cms:import-real-resume')->assertSuccessful();

    expect(ResumeExperience::query()->where('company', 'Escuela EDIB')->count())->toBe(1)
        ->and(ResumeExperience::query()->count())->toBe(2)
        ->and(ResumeExperience::query()->findOrFail($existingExperience->id)->only(['job_title', 'company', 'location', 'started_at', 'description', 'responsibilities']))
        ->toMatchArray(['job_title' => 'Full Stack Developer', 'company' => 'Podarcis SL', 'location' => 'Dirección privada', 'description' => 'Texto editado manualmente', 'responsibilities' => ['Aportación conservada']])
        ->and(ResumeEducation::query()->findOrFail($existingEducation->id)->started_at->format('Y-m-d'))->toBe('2018-01-01')
        ->and(ResumeEducation::query()->findOrFail($existingEducation->id)->ended_at->format('Y-m-d'))->toBe('2022-12-31')
        ->and(ResumeLanguage::query()->where('language', 'Castellano')->firstOrFail()->declared_level)->toBe('Nativo')
        ->and(ResumeLanguage::query()->count())->toBe(3)
        ->and(ResumePublication::query()->count())->toBe(1)
        ->and(ResumePublication::query()->firstOrFail()->snapshot['profile']['name'])->toBe('Versión anterior');

    $teacher = ResumeExperience::query()->where('company', 'Escuela EDIB')->firstOrFail();
    $snapshot = app(BuildResume::class)->draftSnapshot(ResumeSetting::query()->firstOrFail()->draft_config);
    expect($teacher->started_year)->toBe(2021)->and($teacher->ended_year)->toBe(2022)
        ->and($teacher->started_at)->toBeNull()->and($teacher->ended_at)->toBeNull()
        ->and($teacher->technologies()->pluck('technologies.slug')->sort()->values()->all())->toBe(['css', 'html', 'xml'])
        ->and(ResumeSetting::query()->firstOrFail()->draft_config['experience_ids'])->toContain($teacher->id)
        ->and(ResumeSetting::query()->firstOrFail()->draft_config['experience_ids'])->toContain($existingExperience->id)
        ->and($snapshot['profile']['name'])->toBe('Iván Martínez Calafell')
        ->and($snapshot['profile']['location'])->toBe('Palma de Mallorca, España')
        ->and($snapshot['profile']['email'])->toBeNull()
        ->and(collect($snapshot['experiences'])->firstWhere('id', $teacher->id)['started_year'])->toBe(2021)
        ->and(collect($snapshot['experiences'])->firstWhere('id', $existingExperience->id)['job_title'])->toBe('Full Stack Developer')
        ->and(collect($snapshot['experiences'])->firstWhere('id', $existingExperience->id)['location'])->toBe('Dirección privada')
        ->and(app(BuildResume::class)->publicData($snapshot, true)['competency_groups'])->toHaveCount(3)
        ->and(ResumePublication::query()->count())->toBe(1)
        ->and(ProfessionalProfile::query()->where('key', 'primary')->value('public_name'))->toBe('Iván Martínez');

    resumeAdmin($this);
    $this->get(route('admin.resume.edit'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->has('reconciliation', 2)
        ->where('reconciliation.0.title', 'Podarcis S.L.')
        ->where('reconciliation.1.title', 'Formación EDIB')
        ->where('reconciliation.1.differences.1.stored', '2018 – 2022')
        ->where('reconciliation.1.differences.1.provided', '2018 – 2020'));
    $this->get(route('admin.resume.preview'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('cv/show')->where('preview', true)->has('experiences', 2)
        ->where('experiences.0.job_title', 'Full Stack Developer')
        ->where('experiences.0.company', 'Podarcis SL'));
});

test('the homepage hides the CV navigation and CV section while no publication exists', function () {
    $this->get(route('home'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('portfolio.resume.published', false)
        ->where('portfolio.resume.navigationLabel', 'Mi CV')
        ->where('portfolio.resume.showNavigation', true)
        ->where('builderBlocks.0.data.resumePublished', false));

    $this->get(route('cv.show'))->assertNotFound();
    $this->get(route('cv.pdf', 'professional'))->assertNotFound();
    $this->get(route('cv.pdf', 'ats'))->assertNotFound();
});

test('published professional resume content replaces provisional homepage experience copy without changing the saved block', function () {
    $settings = app(BuildResume::class)->defaults();
    ResumePublication::query()->create([
        'version' => 1,
        'snapshot' => [
            'profile' => ['summary' => 'Resumen profesional validado desde el currículum publicado.'],
            'config' => $settings,
            'experiences' => [],
            'education' => [],
            'certifications' => [],
            'languages' => [],
        ],
        'created_at' => now(),
    ]);
    $description = 'Fechas y proyectos pendientes de completar con información validada.';
    $blocks = [[
        'id' => 'experience-block',
        'type' => 'timeline',
        'position' => 0,
        'visible' => true,
        'content' => [
            'legacy_key' => 'experience',
            'title' => 'Experiencia profesional',
            'description' => $description,
            'items' => [],
        ],
    ]];

    $rendered = app(BuildPageBlocks::class)->renderData($blocks, false, [
        'sections' => [['key' => 'experience', 'content' => []]],
    ]);

    expect($rendered[0]['type'])->toBe('resume_experience')
        ->and($rendered[0]['content']['description'])->toBe('')
        ->and($rendered[0]['data']['summary'])->toBe('Resumen profesional validado desde el currículum publicado.')
        ->and($blocks[0]['content']['description'])->toBe($description)
        ->and(ResumePublication::query()->count())->toBe(1);
});

test('the published homepage uses the published resume snapshot and CMS action settings', function () {
    resumeAdmin($this);
    $payload = resumePayload();
    $this->put(route('admin.resume.update'), $payload)->assertRedirect();
    $experience = ResumeExperience::query()->firstOrFail();
    $payload['experiences'][0]['id'] = $experience->id;
    $payload['config']['experience_ids'] = [$experience->id];
    $this->post(route('admin.resume.publish'), $payload)->assertRedirect();

    $home = PortfolioPage::query()->where('key', 'home')->firstOrFail();
    $blocks = $home->published_blocks;
    foreach ($blocks as &$block) {
        if (($block['type'] ?? null) === 'hero') {
            $block['content'] = array_merge($block['content'] ?? [], [
                'resume_action_label' => 'Explorar experiencia publicada',
                'projects_action_label' => 'Ver casos',
                'download_action_label' => 'Descargar PDF',
                'resume_navigation_label' => 'Mi CV',
                'show_resume_action' => true,
                'show_projects_action' => true,
                'show_download_action' => true,
                'show_navigation_link' => true,
            ]);
        }
        if (($block['content']['legacy_key'] ?? null) === 'experience') {
            $block['content']['title'] = 'Trayectoria publicada';
            $block['content']['description'] = 'Selección profesional';
            $block['content']['limit'] = 3;
            $block['content']['cta_label'] = 'Abrir mi CV';
            $block['content']['show_cta'] = true;
            $block['variant'] = 'bordered';
            $block['spacing'] = 'relaxed';
            $block['appearance'] = ['background' => 'light', 'contrast' => 'dark', 'alignment' => 'left', 'content_width' => 'wide', 'graphic' => 'none'];
        }
    }
    unset($block);
    $home->forceFill(['published_blocks' => $blocks])->save();

    $this->get(route('home'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('portfolio.resume.published', true)
        ->where('portfolio.resume.showNavigation', true)
        ->where('portfolio.resume.navigationLabel', 'Mi CV')
        ->where('builderBlocks.0.data.resumePublished', true)
        ->where('builderBlocks.0.content.resume_action_label', 'Explorar experiencia publicada')
        ->where('builderBlocks.0.content.show_download_action', true)
        ->where('builderBlocks.2.type', 'resume_experience')
        ->where('builderBlocks.2.appearance.background', 'light')
        ->where('builderBlocks.2.spacing', 'relaxed')
        ->where('builderBlocks.2.variant', 'bordered')
        ->where('builderBlocks.2.data.available', true)
        ->where('builderBlocks.2.data.summary', 'Diseño y desarrollo productos digitales y software empresarial con atención al detalle, desde la arquitectura hasta la experiencia de uso.')
        ->where('builderBlocks.2.data.experiences.0.job_title', 'Desarrollador Full Stack')
        ->has('builderBlocks.2.data.technology_groups.0.items', 1)
        ->where('builderBlocks.2.data.projects.0.slug', 'proyecto-seleccionado')
        ->has('portfolio.appearance.cssVariables'));

    $payload['experiences'][0]['job_title'] = 'Cambio todavía en borrador';
    $this->put(route('admin.resume.update'), $payload)->assertRedirect();
    $this->get(route('home'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('builderBlocks.2.data.experiences.0.job_title', 'Desarrollador Full Stack'));

    $this->get(route('cv.show'))->assertOk();
    $this->get(route('cv.pdf', 'professional'))->assertOk()->assertHeader('content-type', 'application/pdf');
    $this->get(route('cv.pdf', 'ats'))->assertOk()->assertHeader('content-type', 'application/pdf');
});

test('resume draft CRUD and publication snapshot keep private changes and contact details out of public output', function () {
    resumeAdmin($this);
    $payload = resumePayload();
    ProfessionalProfile::query()->where('key', 'primary')->update(['contact_email' => 'private@example.test']);
    $this->put(route('admin.resume.update'), $payload)->assertRedirect(route('admin.resume.edit'));
    expect(ResumeExperience::query()->count())->toBe(1)
        ->and(ResumeEducation::query()->count())->toBe(1)
        ->and(ResumeCertification::query()->count())->toBe(1)
        ->and(ResumeLanguage::query()->count())->toBe(1)
        ->and(ResumePublication::query()->count())->toBe(0);
    $this->get(route('cv.show'))->assertNotFound();

    $experience = ResumeExperience::query()->firstOrFail();
    $payload['experiences'][0]['id'] = $experience->id;
    $payload['config']['experience_ids'] = [$experience->id];
    $this->post(route('admin.resume.publish'), $payload)->assertRedirect(route('admin.resume.edit'));
    expect(ResumePublication::query()->count())->toBe(1)
        ->and($experience->fresh()->technologies()->exists())->toBeTrue()
        ->and($experience->fresh()->projects()->exists())->toBeTrue();

    $this->get(route('cv.show'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('cv/show')->where('profile.name', 'Iván Martínez')
        ->where('profile.email', null)->where('experiences.0.job_title', 'Desarrollador Full Stack')
        ->where('experiences.0.technologies.0.name', Technology::query()->firstOrFail()->name)
        ->where('experiences.0.projects.0.name', 'Proyecto seleccionado')
        ->where('education.0.qualification', 'Formación técnica')
        ->where('certifications.0.name', 'Certificación verificada')
        ->where('languages.0.declared_level', 'Nativo')
        ->where('projects.0.slug', 'proyecto-seleccionado'));

    $payload['experiences'][0]['job_title'] = 'Cambio todavía privado';
    $payload['config']['show_email'] = true;
    $this->put(route('admin.resume.update'), $payload)->assertRedirect();
    $this->get(route('cv.show'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('experiences.0.job_title', 'Desarrollador Full Stack')->where('profile.email', null));
    $this->post(route('admin.resume.publish'), $payload)->assertRedirect();
    $this->get(route('cv.show'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('experiences.0.job_title', 'Cambio todavía privado')->where('profile.email', 'private@example.test'));
});

test('resume validates dates and credential links and supports collection ordering, visibility and deletion', function () {
    resumeAdmin($this);
    $payload = resumePayload();
    $payload['experiences'][0]['started_at'] = '2022-02-01';
    $payload['experiences'][0]['ended_at'] = '2021-01-01';
    $payload['certifications'][0]['credential_url'] = 'javascript:alert(1)';
    $this->put(route('admin.resume.update'), $payload)->assertSessionHasErrors(['experiences.0.ended_at', 'certifications.0.credential_url']);

    $payload = resumePayload();
    $this->put(route('admin.resume.update'), $payload)->assertRedirect();
    $payload['education'][0]['qualification'] = 'Formación editada';
    $payload['education'][0]['is_visible'] = false;
    $payload['certifications'] = [];
    $payload['languages'][0]['sort_order'] = 20;
    $this->put(route('admin.resume.update'), $payload)->assertRedirect();
    expect(ResumeEducation::query()->firstOrFail()->qualification)->toBe('Formación editada')
        ->and(ResumeEducation::query()->firstOrFail()->is_visible)->toBeFalse()
        ->and(ResumeCertification::query()->count())->toBe(0)
        ->and(ResumeLanguage::query()->firstOrFail()->sort_order)->toBe(20);
});

test('resume responsibilities and achievements preserve separate multiline entries', function () {
    resumeAdmin($this);
    $payload = resumePayload([
        'experiences' => [[
            ...resumePayload()['experiences'][0],
            'responsibilities' => ['Primera responsabilidad', 'Segunda responsabilidad'],
            'achievements' => ['Primera aportación', 'Segunda aportación'],
        ]],
    ]);

    $this->put(route('admin.resume.update'), $payload)->assertRedirect();
    $experience = ResumeExperience::query()->firstOrFail();
    $payload['experiences'][0]['id'] = $experience->id;
    $payload['config']['experience_ids'] = [$experience->id];
    $this->post(route('admin.resume.publish'), $payload)->assertRedirect();

    expect($experience->fresh()->responsibilities)->toBe(['Primera responsabilidad', 'Segunda responsabilidad'])
        ->and($experience->fresh()->achievements)->toBe(['Primera aportación', 'Segunda aportación']);

    $this->get(route('cv.show'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('experiences.0.responsibilities.0', 'Primera responsabilidad')
        ->where('experiences.0.responsibilities.1', 'Segunda responsabilidad')
        ->where('experiences.0.achievements.0', 'Primera aportación')
        ->where('experiences.0.achievements.1', 'Segunda aportación'));
});

test('public CV data redacts street addresses and follows explicit contact privacy settings without altering the publication', function () {
    resumeAdmin($this);
    $address = 'Carrer de la Prova 123, Palma de Mallorca, Islas Baleares';
    $profile = ProfessionalProfile::query()->where('key', 'primary')->firstOrFail();
    $profile->update([
        'location' => $address,
        'contact_email' => 'private@example.test',
        'links' => ['linkedin' => 'https://linkedin.example.test/ivan', 'github' => 'https://github.example.test/ivan'],
    ]);
    $setting = PortfolioSetting::query()->firstOrFail();
    $setting->update(['footer_note' => 'Portfolio personal · Contenido en preparación']);

    $payload = resumePayload();
    $payload['experiences'][0]['location'] = $address;
    $payload['config']['visible_links'] = ['linkedin'];
    $payload['config']['show_email'] = false;
    $payload['config']['include_photo'] = false;
    $this->put(route('admin.resume.update'), $payload)->assertRedirect();
    $experience = ResumeExperience::query()->firstOrFail();
    $payload['experiences'][0]['id'] = $experience->id;
    $payload['config']['experience_ids'] = [$experience->id];
    $this->post(route('admin.resume.publish'), $payload)->assertRedirect();

    $publication = ResumePublication::query()->orderByDesc('version')->firstOrFail();
    expect($publication->snapshot['experiences'][0]['location'])->toBe($address)
        ->and($experience->fresh()->location)->toBe($address)
        ->and(PublicLocation::cityAndRegion($address))->toBe('Palma de Mallorca, Islas Baleares');

    $public = app(BuildResume::class)->publicData($publication->snapshot);
    expect($public['profile']['location'])->toBe('Palma de Mallorca, Islas Baleares')
        ->and($public['profile']['email'])->toBeNull()
        ->and($public['profile']['links'])->toBe(['linkedin' => 'https://linkedin.example.test/ivan'])
        ->and($public['experiences'][0]['location'])->toBe('Palma de Mallorca, Islas Baleares');

    $this->get(route('cv.show'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('profile.location', 'Palma de Mallorca, Islas Baleares')
        ->where('profile.email', null)
        ->where('experiences.0.location', 'Palma de Mallorca, Islas Baleares')
        ->where('portfolio.contact.email', null)
        ->where('portfolio.contact.github', null));

    $homepage = app(BuildPublicPortfolio::class)->home();
    expect($homepage['identity']['location'])->toBe('Palma de Mallorca, Islas Baleares')
        ->and($homepage['contact']['email'])->toBeNull()
        ->and($homepage['contact']['github'])->toBeNull()
        ->and($homepage['footer']['note'])->toBe('')
        ->and($setting->fresh()->footer_note)->toBe('Portfolio personal · Contenido en preparación');

    foreach (['professional', 'ats'] as $variant) {
        $pdf = $this->get(route('cv.pdf', $variant))->assertOk()->getContent();
        expect(pdfTextOperators($pdf))->not->toContain('Carrer de la Prova 123')
            ->not->toContain('private@example.test');
    }
});

test('both published PDF variants contain selectable text, retain links, and paginate long content', function () {
    resumeAdmin($this);
    $payload = resumePayload();
    $payload['experiences'] = [];
    for ($index = 0; $index < 22; $index++) {
        $payload['experiences'][] = [
            'id' => null, 'job_title' => 'Cargo profesional '.$index, 'company' => 'Empresa '.$index, 'location' => '',
            'started_at' => '2020-01-01', 'ended_at' => '2021-01-01', 'is_current' => false, 'description' => str_repeat('Responsabilidad técnica documentada con contexto y decisiones verificadas. ', 8),
            'responsibilities' => ['Diseño y mantenimiento de sistemas web empresariales.'], 'achievements' => [], 'sort_order' => $index * 10,
            'is_visible' => true, 'technology_ids' => [], 'project_ids' => [],
        ];
    }
    $this->put(route('admin.resume.update'), $payload)->assertRedirect();
    $experienceIds = ResumeExperience::query()->orderBy('id')->pluck('id')->all();
    $payload['experiences'] = ResumeExperience::query()->orderBy('sort_order')->get()->map(fn (ResumeExperience $item, int $index): array => array_merge($payload['experiences'][$index], ['id' => $item->id]))->all();
    $payload['config']['experience_ids'] = $experienceIds;
    $this->post(route('admin.resume.publish'), $payload)->assertRedirect();

    foreach (['professional', 'ats'] as $variant) {
        $response = $this->get(route('cv.pdf', $variant))->assertOk()->assertHeader('content-type', 'application/pdf');
        $pdf = $response->getContent();
        expect($pdf)->toStartWith('%PDF-')->toContain('%%EOF')->toContain('/Subtype /Link');
        $streams = pdfTextOperators($pdf);
        expect($streams)->toMatch('/\b(?:Tj|TJ)\b/')
            ->and(preg_match_all('/\/Type\s*\/Page\b(?!s)/', $pdf))->toBeGreaterThan(1);
    }
});

test('unpublished projects and hidden experiences do not leak through the CV or its PDFs', function () {
    resumeAdmin($this);
    $payload = resumePayload();
    $this->put(route('admin.resume.update'), $payload)->assertRedirect();
    $experience = ResumeExperience::query()->firstOrFail();
    $payload['experiences'][0]['id'] = $experience->id;
    $payload['config']['experience_ids'] = [$experience->id];
    $payload['experiences'][0]['is_visible'] = false;
    $project = Project::query()->where('slug', 'proyecto-seleccionado')->firstOrFail();
    $project->update(['publication_status' => 'draft']);
    $payload['config']['project_ids'] = [$project->id];
    $this->post(route('admin.resume.publish'), $payload)->assertRedirect();
    $this->get(route('cv.show'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->has('experiences', 0)->has('projects', 0));
    $this->get(route('cv.pdf', 'ats'))->assertOk();
});
