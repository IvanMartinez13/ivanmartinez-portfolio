<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveResumeRequest;
use App\Models\PortfolioAppearance;
use App\Models\ProfessionalProfile;
use App\Models\Project;
use App\Models\ResumeCertification;
use App\Models\ResumeEducation;
use App\Models\ResumeExperience;
use App\Models\ResumeLanguage;
use App\Models\ResumePublication;
use App\Models\ResumeSetting;
use App\Models\Technology;
use App\Services\Appearance\AppearancePresets;
use App\Services\Portfolio\BuildPublicPortfolio;
use App\Services\Resume\BuildResume;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ResumeController extends Controller
{
    public function edit(BuildResume $resume): Response
    {
        $settings = $this->settings($resume);
        $profile = ProfessionalProfile::query()->where('key', 'primary')->firstOrFail();
        $config = $settings->draft_config ?? $resume->defaults();
        $config['resume_profile'] ??= [
            'name' => $profile->public_name,
            'headline' => $profile->headline,
            'specialty' => $profile->specialty,
            'summary' => $profile->short_description,
            'location' => $profile->location ?? '',
            'email' => $profile->contact_email ?? '',
            'links' => $profile->links ?? [],
            'photo_url' => $profile->photo_url ?? '',
        ];
        $config['resume_profile'] = array_replace([
            'name' => '', 'headline' => '', 'specialty' => '', 'summary' => '', 'location' => '', 'email' => '', 'links' => [], 'photo_url' => '',
        ], $config['resume_profile']);
        $config['resume_profile']['links'] = array_replace(['linkedin' => '', 'github' => '', 'website' => '', 'cv' => ''], $config['resume_profile']['links'] ?? []);
        $config['professional_competencies'] ??= [];
        $reconciliation = [];
        $podarcis = ResumeExperience::query()->whereRaw('lower(company) like ?', ['%podarcis%'])->first();
        if ($podarcis) {
            $reconciliation[] = [
                'title' => 'Podarcis S.L.',
                'status' => 'Registro existente incluido en el borrador; los campos guardados se conservan.',
                'warning' => filled($podarcis->location) ? 'El registro conserva una ubicación. Comprueba que sea adecuada antes de publicar.' : null,
                'differences' => [
                    ['field' => 'Cargo', 'stored' => $podarcis->job_title, 'provided' => 'Lead Fullstack Developer | Responsable Técnico'],
                    ['field' => 'Periodo', 'stored' => ($podarcis->started_year ?? $podarcis->started_at?->format('Y') ?? 'Sin fecha').' – '.($podarcis->is_current ? 'Actualidad' : ($podarcis->ended_year ?? $podarcis->ended_at?->format('Y') ?? 'Sin fecha')), 'provided' => '2021 – Actualidad'],
                    ['field' => 'Contenido profesional', 'stored' => count($podarcis->responsibilities ?? []).' responsabilidades y '.count($podarcis->achievements ?? []).' aportaciones guardadas', 'provided' => '8 responsabilidades proporcionadas para revisar'],
                ],
            ];
        }
        $edib = ResumeEducation::query()->whereRaw('lower(institution) like ?', ['%edib%'])
            ->whereRaw('lower(qualification) like ?', ['%desarrollo de aplicaciones%'])->first();
        if ($edib) {
            $storedStart = $edib->started_year ?? $edib->started_at?->format('Y');
            $storedEnd = $edib->ended_year ?? $edib->ended_at?->format('Y');
            if ((string) $storedStart !== '2018' || (string) $storedEnd !== '2020') {
                $reconciliation[] = [
                    'title' => 'Formación EDIB',
                    'status' => 'La fecha propuesta queda pendiente de aprobación; no se ha aplicado ningún cambio.',
                    'warning' => null,
                    'differences' => [
                        ['field' => 'Titulación y centro', 'stored' => $edib->qualification.' · '.$edib->institution, 'provided' => 'Misma titulación · Escuela EDIB'],
                        ['field' => 'Periodo', 'stored' => ($storedStart ?? 'Sin fecha').' – '.($storedEnd ?? 'Sin fecha'), 'provided' => '2018 – 2020'],
                    ],
                ];
            }
        }

        return Inertia::render('admin/resume/index', [
            'profile' => $profile->only(['public_name', 'headline', 'specialty', 'short_description', 'location', 'contact_email', 'photo_url', 'links']),
            'config' => $config,
            'experiences' => ResumeExperience::query()->with(['technologies:id,name', 'projects:id,name'])->orderBy('sort_order')->orderBy('id')->get()
                ->map(fn (ResumeExperience $item): array => [...$item->only(['id', 'job_title', 'company', 'location', 'is_current', 'description', 'responsibilities', 'achievements', 'sort_order', 'is_visible', 'started_year', 'ended_year']),
                    'started_at' => $item->started_at?->format('Y-m-d') ?? '', 'ended_at' => $item->ended_at?->format('Y-m-d') ?? '',
                    'technology_ids' => $item->technologies->pluck('id')->map(fn ($id): int => (int) $id)->all(),
                    'project_ids' => $item->projects->pluck('id')->map(fn ($id): int => (int) $id)->all()]),
            'education' => ResumeEducation::query()->orderBy('sort_order')->orderBy('id')->get()
                ->map(fn (ResumeEducation $item): array => [...$item->only(['id', 'qualification', 'institution', 'description', 'sort_order', 'is_visible', 'started_year', 'ended_year']),
                    'started_at' => $item->started_at?->format('Y-m-d') ?? '', 'ended_at' => $item->ended_at?->format('Y-m-d') ?? '']),
            'certifications' => ResumeCertification::query()->orderBy('sort_order')->orderBy('id')->get()
                ->map(fn (ResumeCertification $item): array => [...$item->only(['id', 'name', 'issuer', 'credential_url', 'sort_order', 'is_visible']), 'issued_at' => $item->issued_at?->format('Y-m-d') ?? '']),
            'languages' => ResumeLanguage::query()->orderBy('sort_order')->orderBy('id')->get()
                ->map(fn (ResumeLanguage $item): array => [...$item->only(['id', 'language', 'declared_level', 'sort_order', 'is_visible']),
                    'certification_name' => $item->certification_name ?? '', 'certification_url' => $item->certification_url ?? '']),
            'technologies' => Technology::query()->orderBy('category')->orderBy('position')->orderBy('name')->get(['id', 'name', 'category', 'is_visible']),
            'projects' => Project::query()->orderBy('name')->get(['id', 'name', 'slug', 'publication_status', 'is_visible']),
            'publishedVersion' => ResumePublication::query()->max('version'),
            'reconciliation' => $reconciliation,
            'appearancePresets' => app(AppearancePresets::class)->options()['variants'],
        ]);
    }

    public function update(SaveResumeRequest $request, BuildResume $resume): RedirectResponse
    {
        DB::transaction(fn () => $this->saveDraft($request, $resume));
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Borrador del currículum guardado. La versión pública no cambia hasta publicar.']);

        return to_route('admin.resume.edit');
    }

    public function publish(SaveResumeRequest $request, BuildResume $resume): RedirectResponse
    {
        DB::transaction(function () use ($request, $resume): void {
            $this->saveDraft($request, $resume);
            $settings = ResumeSetting::query()->where('key', 'primary')->firstOrFail();
            $snapshot = $resume->draftSnapshot($settings->draft_config);
            $version = (int) (ResumePublication::query()->max('version') ?? 0) + 1;
            ResumePublication::query()->create([
                'version' => $version,
                'snapshot' => $snapshot,
                'published_by' => $request->user()?->id,
                'created_at' => now(),
            ]);
        });
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Currículum publicado. La web y los PDF ya usan esta versión aprobada.']);

        return to_route('admin.resume.edit');
    }

    public function preview(BuildResume $resume, AppearancePresets $presets): Response
    {
        $settings = $this->settings($resume);
        $data = $resume->publicData($resume->draftSnapshot($settings->draft_config), true);
        $data['portfolio'] = app(BuildPublicPortfolio::class)->chrome();
        $data['portfolio']['appearance'] = $presets->publicConfig(PortfolioAppearance::query()->where('key', 'primary')->first()?->draft_config);

        return Inertia::render('cv/show', $data);
    }

    private function saveDraft(SaveResumeRequest $request, BuildResume $resume): void
    {
        $data = $request->validated();
        $experienceIds = $this->saveCollection(ResumeExperience::class, $data['experiences'], function (ResumeExperience $item, array $row): void {
            $item->fill(collect($row)->only(['job_title', 'company', 'location', 'started_at', 'ended_at', 'started_year', 'ended_year', 'is_current', 'description', 'responsibilities', 'achievements', 'is_visible'])->all());
            if ($item->is_current) {
                $item->ended_at = null;
                $item->ended_year = null;
            }
            $item->sort_order = (int) ($row['sort_order'] ?? 0);
            $item->save();
            $item->technologies()->sync($row['technology_ids'] ?? []);
            $item->projects()->sync($row['project_ids'] ?? []);
        });
        $this->saveCollection(ResumeEducation::class, $data['education'], fn (ResumeEducation $item, array $row) => $item->fill(collect($row)->only(['qualification', 'institution', 'started_at', 'ended_at', 'started_year', 'ended_year', 'description', 'sort_order', 'is_visible'])->all())->save());
        $this->saveCollection(ResumeCertification::class, $data['certifications'], fn (ResumeCertification $item, array $row) => $item->fill(collect($row)->only(['name', 'issuer', 'issued_at', 'credential_url', 'sort_order', 'is_visible'])->all())->save());
        $this->saveCollection(ResumeLanguage::class, $data['languages'], fn (ResumeLanguage $item, array $row) => $item->fill(collect($row)->only(['language', 'declared_level', 'certification_name', 'certification_url', 'sort_order', 'is_visible'])->all())->save());

        $settings = $this->settings($resume);
        $storedConfig = $settings->draft_config ?? $resume->defaults();
        $importTracking = $storedConfig['port009_import'] ?? null;
        $config = array_replace($storedConfig, $data['config']);
        if (isset($storedConfig['resume_profile'], $data['config']['resume_profile'])) {
            $config['resume_profile'] = array_replace($storedConfig['resume_profile'], $data['config']['resume_profile']);
            $config['resume_profile']['links'] = array_replace($storedConfig['resume_profile']['links'] ?? [], $data['config']['resume_profile']['links'] ?? []);
        }
        if ($importTracking !== null) {
            $config['port009_import'] = $importTracking;
        }
        $config['experience_ids'] = array_values(array_intersect(array_map('intval', $config['experience_ids']), $experienceIds));
        $settings->draft_config = $config;
        $settings->save();
    }

    /** @param class-string<Model> $modelClass
     * @param  array<int, array<string, mixed>>  $rows
     * @param  callable(Model, array<string, mixed>): void  $save
     * @return array<int, int>
     */
    private function saveCollection(string $modelClass, array $rows, callable $save): array
    {
        $ids = [];
        foreach ($rows as $row) {
            /** @var Model $item */
            $item = filled($row['id'] ?? null) ? $modelClass::query()->findOrFail($row['id']) : new $modelClass;
            $save($item, $row);
            $ids[] = (int) $item->getKey();
        }
        $query = $modelClass::query();
        $ids ? $query->whereNotIn('id', $ids)->delete() : $query->delete();

        return $ids;
    }

    private function settings(BuildResume $resume): ResumeSetting
    {
        return ResumeSetting::query()->firstOrCreate(['key' => 'primary'], ['draft_config' => $resume->defaults()]);
    }
}
