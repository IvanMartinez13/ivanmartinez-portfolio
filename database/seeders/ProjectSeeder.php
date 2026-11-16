<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\ProjectCaseStudySection;
use App\Models\Technology;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $position = 10;
            foreach (config('portfolio.technologyGroups', []) as $group) {
                foreach ($group['items'] as $name) {
                    Technology::query()->firstOrCreate(
                        ['slug' => Str::slug($name)],
                        ['name' => $name, 'category' => $group['name'], 'position' => $position, 'is_visible' => true],
                    );
                    $position += 10;
                }
            }

            $projects = [
                'ESG Suite Solutions',
                'Balón Control',
                'Baleares Sport Club',
                'Legislación Online',
            ];

            foreach ($projects as $index => $name) {
                $project = Project::query()->firstOrCreate(
                    ['slug' => Str::slug($name)],
                    [
                        'name' => $name,
                        'summary' => 'Borrador inicial: completa esta descripción con información validada antes de publicar.',
                        'description' => null,
                        'category' => 'Pendiente de completar',
                        'project_type' => 'Pendiente de completar',
                        'role' => 'Pendiente de completar',
                        'development_status' => 'unspecified',
                        'publication_status' => 'draft',
                        'is_featured' => false,
                        'is_visible' => true,
                        'sort_order' => ($index + 1) * 10,
                    ],
                );

                foreach (config('projects.case_study_sections', []) as $key => $section) {
                    ProjectCaseStudySection::query()->firstOrCreate(
                        ['project_id' => $project->id, 'key' => $key],
                        ['title' => $section['title'], 'body' => null, 'position' => $section['position'], 'is_visible' => false],
                    );
                }
            }
        });
    }
}
