<?php

namespace App\Services\Resume;

use App\Models\ProfessionalProfile;
use App\Models\Project;
use App\Models\ResumeCertification;
use App\Models\ResumeEducation;
use App\Models\ResumeExperience;
use App\Models\ResumeLanguage;
use App\Models\ResumePublication;
use App\Models\ResumeSetting;
use App\Models\Technology;
use App\Services\Portfolio\BuildPublicPortfolio;
use App\Support\PublicLocation;

class BuildResume
{
    /** @return array<string, mixed> */
    public function homepageData(bool $preview = false, int $limit = 5): array
    {
        $snapshot = $preview
            ? $this->draftSnapshot(ResumeSetting::query()->where('key', 'primary')->first()?->draft_config ?? $this->defaults())
            : ResumePublication::query()->orderByDesc('version')->first()?->snapshot;

        if (! $snapshot) {
            return ['available' => false, 'summary' => '', 'experiences' => [], 'technology_groups' => [], 'projects' => []];
        }

        $data = $this->publicData($snapshot, $preview);
        $visible = $data['config']['visible_sections'] ?? [];

        return [
            'available' => true,
            'summary' => in_array('experience', $visible, true) ? (string) ($data['profile']['summary'] ?? '') : '',
            'experiences' => in_array('experience', $visible, true) ? array_slice($data['experiences'], 0, min(12, max(1, $limit))) : [],
            'technology_groups' => in_array('skills', $visible, true) ? $data['technology_groups'] : [],
            'competency_groups' => in_array('skills', $visible, true) ? $data['competency_groups'] : [],
            'projects' => in_array('projects', $visible, true) ? $data['projects'] : [],
        ];
    }

    /** @return array<int, array<string, mixed>> */
    public function timelineItems(bool $preview = false, int $limit = 5): array
    {
        return $this->homepageData($preview, $limit)['experiences'];
    }

    /** @return array<string, mixed> */
    public function defaults(): array
    {
        return [
            'section_order' => ['experience', 'skills', 'education', 'certifications', 'languages', 'projects'],
            'visible_sections' => ['experience', 'skills', 'education', 'certifications', 'languages', 'projects'],
            'experience_ids' => [], 'project_ids' => [], 'technology_ids' => [],
            'professional_competencies' => [],
            'language' => 'es', 'visible_links' => ['linkedin', 'github', 'website'],
            'show_email' => false, 'theme' => 'editorial', 'target_length' => 'auto', 'include_photo' => false,
        ];
    }

    /** Build an administrator-only preview or publication snapshot from the single CMS source of truth.
     * @param  array<string, mixed>  $config
     * @return array<string, mixed>
     */
    public function draftSnapshot(array $config): array
    {
        $profile = ProfessionalProfile::query()->where('key', 'primary')->firstOrFail();
        $resumeProfile = array_replace([
            'name' => $profile->public_name,
            'headline' => $profile->headline,
            'specialty' => $profile->specialty,
            'summary' => $profile->short_description,
            'location' => $profile->location,
            'email' => $profile->contact_email,
            'links' => $profile->links ?? [],
            'photo_url' => $profile->photo_url,
        ], is_array($config['resume_profile'] ?? null) ? $config['resume_profile'] : []);
        $links = is_array($resumeProfile['links'] ?? null) ? $resumeProfile['links'] : [];
        $publicLinks = collect($config['visible_links'] ?? [])->mapWithKeys(fn (string $key): array => [$key => $links[$key] ?? null])
            ->filter(fn ($url): bool => is_string($url) && filled($url))->all();

        $experienceIds = array_map('intval', $config['experience_ids'] ?? []);
        $experiences = ResumeExperience::query()->where('is_visible', true)->whereIn('id', $experienceIds)
            ->with(['technologies' => fn ($query) => $query->where('technologies.is_visible', true), 'projects.technologies' => fn ($query) => $query->where('technologies.is_visible', true)])
            ->orderBy('sort_order')->orderBy('id')->get()
            ->map(fn (ResumeExperience $experience): array => [
                'id' => $experience->id,
                'job_title' => $experience->job_title,
                'company' => $experience->company,
                'location' => $experience->location,
                'started_at' => $experience->started_at?->format('Y-m-d'),
                'ended_at' => $experience->ended_at?->format('Y-m-d'),
                'started_year' => $experience->started_year,
                'ended_year' => $experience->ended_year,
                'is_current' => $experience->is_current,
                'description' => $experience->description,
                'responsibilities' => $experience->responsibilities ?? [],
                'achievements' => $experience->achievements ?? [],
                'technology_ids' => $experience->technologies->where('is_visible', true)->pluck('id')->map(fn ($id): int => (int) $id)->all(),
                'project_ids' => $experience->projects->pluck('id')->map(fn ($id): int => (int) $id)->all(),
            ])->all();

        return [
            'profile' => [
                'name' => $resumeProfile['name'],
                'headline' => $resumeProfile['headline'],
                'specialty' => $resumeProfile['specialty'],
                'summary' => $resumeProfile['summary'],
                'location' => $resumeProfile['location'],
                'email' => ($config['show_email'] ?? false) ? $resumeProfile['email'] : null,
                'links' => $publicLinks,
                'photo_url' => ($config['include_photo'] ?? false) ? $resumeProfile['photo_url'] : null,
            ],
            'config' => $config,
            'experiences' => $experiences,
            'education' => ResumeEducation::query()->where('is_visible', true)->orderBy('sort_order')->orderBy('id')->get()
                ->map(fn (ResumeEducation $item): array => ['qualification' => $item->qualification, 'institution' => $item->institution, 'started_at' => $item->started_at?->format('Y-m-d'), 'ended_at' => $item->ended_at?->format('Y-m-d'), 'started_year' => $item->started_year, 'ended_year' => $item->ended_year, 'description' => $item->description])->all(),
            'certifications' => ResumeCertification::query()->where('is_visible', true)->orderBy('sort_order')->orderBy('id')->get()
                ->map(fn (ResumeCertification $item): array => ['name' => $item->name, 'issuer' => $item->issuer, 'issued_at' => $item->issued_at?->format('Y-m-d'), 'credential_url' => $item->credential_url])->all(),
            'languages' => ResumeLanguage::query()->where('is_visible', true)->orderBy('sort_order')->orderBy('id')->get()
                ->map(fn (ResumeLanguage $item): array => ['language' => $item->language, 'declared_level' => $item->declared_level, 'certification_name' => $item->certification_name, 'certification_url' => $item->certification_url])->all(),
        ];
    }

    /** @param array<string, mixed> $snapshot
     * @return array<string, mixed>
     */
    public function publicData(array $snapshot, bool $preview = false): array
    {
        $config = $snapshot['config'] ?? $this->defaults();
        $profile = $snapshot['profile'] ?? [];
        if (! $preview) {
            $profile = array_intersect_key($profile, array_flip(['name', 'headline', 'specialty', 'summary', 'location', 'email', 'links', 'photo_url']));
            $profile['location'] = PublicLocation::cityAndRegion($profile['location'] ?? null);
            $profile['email'] = ($config['show_email'] ?? false) ? ($profile['email'] ?? null) : null;
            $profile['links'] = collect($config['visible_links'] ?? [])->mapWithKeys(fn (string $key): array => [$key => $profile['links'][$key] ?? null])
                ->filter(fn ($url): bool => is_string($url) && filled($url))->all();
            $profile['photo_url'] = ($config['include_photo'] ?? false) ? ($profile['photo_url'] ?? null) : null;
        }
        $allowedProjectQuery = Project::query()->when(! $preview, fn ($query) => $query->public());
        $projects = $allowedProjectQuery->whereIn('id', array_map('intval', $config['project_ids'] ?? []))
            ->with(['technologies' => fn ($query) => $query->where('technologies.is_visible', true)])->get()->keyBy('id');
        $technologies = Technology::query()->when(! $preview, fn ($query) => $query->visible())
            ->whereIn('id', array_map('intval', $config['technology_ids'] ?? []))->orderBy('category')->orderBy('position')->orderBy('name')->get()->keyBy('id');
        $portfolio = app(BuildPublicPortfolio::class);
        $projectCards = collect($config['project_ids'] ?? [])->map(fn ($id) => $projects->get((int) $id))
            ->filter()->map(fn (Project $project): array => $portfolio->projectCard($project))->values()->all();
        $experiences = collect($snapshot['experiences'] ?? [])->map(function (array $experience) use ($technologies, $projects, $portfolio, $preview): array {
            if (! $preview) {
                $experience = array_intersect_key($experience, array_flip(['id', 'job_title', 'company', 'location', 'started_at', 'ended_at', 'started_year', 'ended_year', 'is_current', 'description', 'responsibilities', 'achievements', 'technology_ids', 'project_ids']));
                $experience['location'] = PublicLocation::cityAndRegion($experience['location'] ?? null);
            }
            $experience['technologies'] = collect($experience['technology_ids'] ?? [])->map(fn ($id) => $technologies->get((int) $id))
                ->filter()->map(fn (Technology $technology): array => ['id' => $technology->id, 'name' => $technology->name, 'slug' => $technology->slug, 'category' => $technology->category])->values()->all();
            $experience['projects'] = collect($experience['project_ids'] ?? [])->map(fn ($id) => $projects->get((int) $id))
                ->filter()->map(fn (Project $project): array => $portfolio->projectCard($project))->values()->all();
            unset($experience['technology_ids'], $experience['project_ids']);

            return $experience;
        })->all();
        $groups = $technologies->groupBy('category')->map(fn ($items, $category): array => [
            'category' => (string) $category,
            'items' => $items->map(fn (Technology $technology): array => ['id' => $technology->id, 'name' => $technology->name, 'slug' => $technology->slug])->values()->all(),
        ])->values()->all();

        $competencyGroups = $snapshot['competency_groups'] ?? ($config['professional_competencies'] ?? []);

        return [
            'profile' => $profile, 'config' => $config,
            'experiences' => $experiences, 'technology_groups' => $groups,
            'competency_groups' => is_array($competencyGroups) ? $competencyGroups : [],
            'education' => $snapshot['education'] ?? [], 'certifications' => $snapshot['certifications'] ?? [],
            'languages' => $snapshot['languages'] ?? [], 'projects' => $projectCards,
            'preview' => $preview,
        ];
    }
}
