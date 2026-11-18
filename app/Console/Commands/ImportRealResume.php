<?php

namespace App\Console\Commands;

use App\Models\ProfessionalProfile;
use App\Models\ResumeEducation;
use App\Models\ResumeExperience;
use App\Models\ResumeLanguage;
use App\Models\ResumeSetting;
use App\Models\Technology;
use App\Services\Resume\BuildResume;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ImportRealResume extends Command
{
    protected $signature = 'cms:import-real-resume {--dry-run : Muestra los cambios previstos sin escribir en la base de datos}';

    protected $description = 'Importa el currículum profesional proporcionado al borrador del CMS sin modificar publicaciones.';

    /** @var array<string, array{name: string, category: string}> */
    private const TECHNOLOGIES = [
        'mysql' => ['name' => 'MySQL', 'category' => 'Backend'],
        'apis-rest' => ['name' => 'APIs REST', 'category' => 'Backend'],
        'javascript' => ['name' => 'JavaScript', 'category' => 'Frontend'],
        'vue' => ['name' => 'Vue', 'category' => 'Frontend'],
        'react-native' => ['name' => 'React Native', 'category' => 'Desarrollo móvil'],
        'html' => ['name' => 'HTML', 'category' => 'Frontend'],
        'xml' => ['name' => 'XML', 'category' => 'Frontend'],
        'css' => ['name' => 'CSS', 'category' => 'Frontend'],
    ];

    public function handle(): int
    {
        $database = (string) config('database.connections.'.config('database.default').'.database');
        $environment = app()->environment();
        $allowed = ($environment === 'local' && $database === 'db') || ($environment === 'testing' && $database === 'db_testing');
        if (! $allowed) {
            $this->error("Importación cancelada: solo se permite en local/db o testing/db_testing (actual: {$environment}/{$database}).");

            return self::FAILURE;
        }

        if (config('database.default') !== 'pgsql') {
            $this->error('Importación cancelada: se requiere PostgreSQL.');

            return self::FAILURE;
        }

        $plan = $this->plan();
        $this->table(['Acción', 'Elemento'], $plan['summary']);
        foreach ($plan['conflicts'] as $conflict) {
            $this->warn($conflict);
        }

        if ($this->option('dry-run')) {
            $this->info('Dry-run: no se ha escrito ningún dato.');

            return self::SUCCESS;
        }

        DB::transaction(fn () => $this->import());
        $this->info('Importación completada en borrador. No se ha publicado ni alterado ninguna versión histórica.');

        return self::SUCCESS;
    }

    /** @return array{summary: array<int, array{0:string,1:string}>, conflicts: array<int,string>} */
    private function plan(): array
    {
        $conflicts = [];
        $podarcis = ResumeExperience::query()->whereRaw('lower(company) like ?', ['%podarcis%'])->first();
        if ($podarcis) {
            $conflicts[] = "Revisión manual: Podarcis ya existe (ID {$podarcis->id}) con contenido editado y fechas distintas; se conservará íntegro.";
        }
        $education = ResumeEducation::query()->whereRaw('lower(institution) like ?', ['%edib%'])
            ->whereRaw('lower(qualification) like ?', ['%desarrollo de aplicaciones%'])->first();
        if ($education && ((int) $education->started_year !== 2018 || (int) $education->ended_year !== 2020)) {
            $conflicts[] = "Revisión manual: la formación EDIB ya existe (ID {$education->id}) con fechas diferentes; se conservará íntegra.";
        }

        return [
            'summary' => [
                ['Crear si falta', 'Experiencia docente Escuela EDIB · 2021–2022'],
                ['Crear si falta', 'Tecnologías del catálogo: '.implode(', ', array_column(self::TECHNOLOGIES, 'name'))],
                ['Añadir solo si falta', 'Perfil y competencias del borrador del CV'],
                ['Reutilizar o completar', 'Formación e idiomas coincidentes; desarrollo continuo como entrada no certificada'],
                ['Incluir en el borrador', 'Registro existente de Podarcis sin modificar sus campos ni relaciones'],
                ['Conservar', 'Formación EDIB, proyectos y publicaciones existentes'],
            ],
            'conflicts' => $conflicts,
        ];
    }

    private function import(): void
    {
        $settings = ResumeSetting::query()->firstOrCreate(
            ['key' => 'primary'],
            ['draft_config' => app(BuildResume::class)->defaults()],
        );
        $settings = ResumeSetting::query()->whereKey($settings->id)->lockForUpdate()->firstOrFail();
        $config = $settings->draft_config ?? [];
        $tracking = $config['port009_import'] ?? [];
        $technologyIds = [];

        foreach (self::TECHNOLOGIES as $slug => $technology) {
            $record = Technology::query()->where('slug', $slug)->first();
            if (! $record) {
                $record = Technology::query()->create([
                    'name' => $technology['name'], 'slug' => $slug,
                    'category' => $technology['category'], 'position' => (int) Technology::query()->max('position') + 10,
                    'is_visible' => true,
                ]);
            }
            $technologyIds[] = (int) $record->id;
            $tracking['technologies'][$slug] ??= (int) $record->id;
        }

        $podarcis = ResumeExperience::query()->whereRaw('lower(company) like ?', ['%podarcis%'])->first();
        if ($podarcis) {
            if (! isset($tracking['experiences']['podarcis-existing'])) {
                $config['experience_ids'] = array_values(array_unique([
                    ...array_map('intval', $config['experience_ids'] ?? []),
                    (int) $podarcis->id,
                ]));
                $tracking['experiences']['podarcis-existing'] = (int) $podarcis->id;
            }
        }

        if (! ($tracking['technology_selection_applied'] ?? false)) {
            $config['technology_ids'] = array_values(array_unique([...array_map('intval', $config['technology_ids'] ?? []), ...$technologyIds]));
            $tracking['technology_selection_applied'] = true;
        }

        $teacher = ResumeExperience::query()->whereRaw('lower(company) = ?', ['escuela edib'])
            ->whereRaw('lower(job_title) like ?', ['%profesor%'])->first();
        if (! $teacher && ! isset($tracking['experiences']['edib-teaching'])) {
            $teacher = ResumeExperience::query()->create([
                'job_title' => 'Profesor de Lenguajes de Marcas',
                'company' => 'Escuela EDIB',
                'location' => null,
                'started_year' => 2021,
                'ended_year' => 2022,
                'is_current' => false,
                'description' => 'Docencia de tecnologías de marcado y desarrollo web en formación profesional técnica, combinando contenidos teóricos, ejercicios prácticos y evaluación de proyectos.',
                'responsibilities' => [
                    'Docencia de HTML, XML y CSS.',
                    'Diseño de contenidos académicos orientados al desarrollo web profesional.',
                    'Evaluación y mentoría de proyectos prácticos.',
                    'Desarrollo de habilidades de comunicación técnica y liderazgo formativo.',
                ],
                'achievements' => [],
                'sort_order' => (int) ResumeExperience::query()->max('sort_order') + 10,
                'is_visible' => true,
            ]);
            $teacherTechnologyIds = Technology::query()->whereIn('slug', ['html', 'xml', 'css'])->pluck('id')->all();
            $teacher->technologies()->sync($teacherTechnologyIds);
            $tracking['experiences']['edib-teaching'] = (int) $teacher->id;
            $config['experience_ids'] = array_values(array_unique([...array_map('intval', $config['experience_ids'] ?? []), (int) $teacher->id]));
        } elseif ($teacher) {
            $tracking['experiences']['edib-teaching'] ??= (int) $teacher->id;
        }

        $profile = ProfessionalProfile::query()->where('key', 'primary')->firstOrFail();
        if (! isset($config['resume_profile'])) {
            $config['resume_profile'] = [
                'name' => 'Iván Martínez Calafell',
                'headline' => 'Lead Full Stack Developer',
                'specialty' => 'Arquitectura SaaS y automatización de procesos',
                'summary' => 'Lead Full Stack Developer con aproximadamente cinco años de experiencia en el diseño, desarrollo y evolución de plataformas SaaS multiempresa. Especializado en arquitectura backend con Laravel, automatización de procesos e integración de sistemas en entornos empresariales y regulatorios. Experiencia en coordinación técnica, definición de arquitecturas e integración de APIs.',
                'location' => 'Palma de Mallorca, España',
                'email' => 'ivanmartinez.imc13@gmail.com',
                'links' => array_replace($profile->links ?? [], [
                    'github' => 'https://github.com/IvanMartinez13',
                    'website' => 'https://ivanmartinez.dev',
                ]),
                'photo_url' => $profile->photo_url,
            ];
            $tracking['profile'] = 'resume_profile';
        }

        if (empty($config['professional_competencies']) && ! isset($tracking['competencies'])) {
            $config['professional_competencies'] = [
                ['category' => 'Arquitectura y automatización', 'items' => ['Arquitectura SaaS', 'Automatización de procesos', 'Integración de APIs REST']],
                ['category' => 'Prácticas de ingeniería', 'items' => ['Code review', 'Planificación técnica', 'Definición de estándares y buenas prácticas', 'Optimización del rendimiento']],
                ['category' => 'Liderazgo técnico', 'items' => ['Coordinación de equipos', 'Diseño de arquitectura', 'Comunicación técnica y mentoría']],
            ];
            $tracking['competencies'] = true;
        }

        $this->reuseExistingEducationAndLanguages($tracking);
        // The profile and existing records are deliberately left untouched. Keep their facts visible in the admin draft for review.
        $config['port009_import'] = $tracking;
        $settings->draft_config = $config;
        $settings->save();
    }

    /** @param array<string, mixed> $tracking */
    private function reuseExistingEducationAndLanguages(array &$tracking): void
    {
        $education = ResumeEducation::query()->whereRaw('lower(institution) like ?', ['%edib%'])
            ->whereRaw('lower(qualification) like ?', ['%desarrollo de aplicaciones%'])->first();
        if ($education) {
            $tracking['education']['edib-dam'] = (int) $education->id;
        }
        $complementary = ResumeEducation::query()->whereRaw('lower(qualification) like ?', ['%formaci%complementaria%'])
            ->orWhereRaw('lower(institution) like ?', ['%udemy%'])->first();
        if ($complementary) {
            $tracking['education']['complementary'] = (int) $complementary->id;
        }
        if (! $complementary) {
            $continuous = ResumeEducation::query()->whereRaw('lower(qualification) = ?', ['desarrollo profesional continuo'])->first();
            if (! $continuous) {
                $continuous = ResumeEducation::query()->create([
                    'qualification' => 'Desarrollo profesional continuo',
                    'institution' => 'Formación continua',
                    'started_year' => null,
                    'ended_year' => null,
                    'description' => 'Formación continua en Laravel, React Native, arquitectura de software, frameworks modernos y buenas prácticas de desarrollo. No corresponde a certificaciones formales.',
                    'sort_order' => (int) ResumeEducation::query()->max('sort_order') + 10,
                    'is_visible' => true,
                ]);
            }
            $tracking['education']['continuous-learning'] = (int) $continuous->id;
        }
        foreach ([
            'spanish' => ['name' => 'Español', 'aliases' => ['castellano', 'spanish', 'español'], 'level' => 'Nativo'],
            'catalan' => ['name' => 'Catalán', 'aliases' => ['catalán', 'catalan'], 'level' => 'Nativo'],
            'english' => ['name' => 'Inglés', 'aliases' => ['inglés', 'ingles', 'english'], 'level' => 'Intermedio'],
        ] as $key => $languageData) {
            $language = ResumeLanguage::query()->whereIn(DB::raw('lower(language)'), $languageData['aliases'])->first();
            $language ??= ResumeLanguage::query()->create([
                'language' => $languageData['name'],
                'declared_level' => $languageData['level'],
                'sort_order' => (int) ResumeLanguage::query()->max('sort_order') + 10,
                'is_visible' => true,
            ]);
            $tracking['languages'][$key] = (int) $language->id;
        }
    }
}
