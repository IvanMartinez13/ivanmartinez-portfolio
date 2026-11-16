<?php

namespace App\Services\Portfolio;

use App\Models\Project;

class BuildProjectPage
{
    /** @return array<string, mixed> */
    public function build(Project $project, bool $preview = false): array
    {
        $project->loadMissing([
            'technologies' => fn ($query) => $query->where('technologies.is_visible', true),
            'caseStudySections' => fn ($query) => $query->where('is_visible', true)->whereNotNull('body')->where('body', '<>', ''),
            'media',
        ]);

        return [
            'name' => $project->name,
            'slug' => $project->slug,
            'summary' => $project->summary,
            'description' => $project->description,
            'category' => $project->category,
            'projectType' => $project->project_type,
            'role' => $project->role,
            'clientCompany' => $project->client_company,
            'developmentStatus' => config('projects.development_statuses.'.$project->development_status, ''),
            'mainImageUrl' => $project->main_image_url,
            'mainImageAlt' => $project->main_image_alt,
            'startedAt' => $project->started_at?->format('Y-m'),
            'completedAt' => $project->completed_at?->format('Y-m'),
            'publicUrl' => $project->public_url,
            'repositoryUrl' => $project->repository_url,
            'seoTitle' => $project->seo_title ?: $project->name,
            'seoDescription' => $project->seo_description ?: $project->summary,
            'preview' => $preview,
            'technologies' => $project->technologies->map(fn ($technology): array => [
                'name' => $technology->name,
                'slug' => $technology->slug,
                'category' => $technology->category,
            ])->values()->all(),
            'sections' => $project->caseStudySections->map(fn ($section): array => [
                'key' => $section->key,
                'title' => $section->title,
                'body' => $section->body,
                'position' => $section->position,
            ])->values()->all(),
            'media' => $project->media
                ->when(! $preview, fn ($media) => $media->where('is_visible', true)->values())
                ->map(fn ($media): array => [
                    'kind' => $media->kind,
                    'url' => $media->url,
                    'alt' => $media->alt_text,
                    'caption' => $media->caption,
                ])->values()->all(),
        ];
    }
}
