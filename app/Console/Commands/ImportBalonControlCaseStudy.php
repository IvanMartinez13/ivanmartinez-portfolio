<?php

namespace App\Console\Commands;

use App\Models\Project;
use App\Models\ProjectCaseStudySection;
use App\Models\Technology;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ImportBalonControlCaseStudy extends Command
{
    protected $signature = 'projects:populate-balon-control {--dry-run : Show planned updates without writing to the database}';

    protected $description = 'Populate the existing Balón Control project with its verified case study, preserving manual edits and draft status.';

    /** @var array<string, array{title: string, body: string}> */
    private array $sections = [
        'context' => [
            'title' => 'Contexto',
            'body' => 'Balón Control es una aplicación para entrenadores y cuerpos técnicos de fútbol. Reúne la gestión diaria de equipos, plantillas, planificación, actividad de partido y seguimiento deportivo en una experiencia móvil. El proyecto está funcional en desarrollo; no se ha verificado su despliegue productivo ni una validación completa en dispositivos físicos.',
        ],
        'problem' => [
            'title' => 'Problema',
            'body' => 'Los entrenadores y cuerpos técnicos necesitan gestionar información deportiva repartida entre distintas herramientas, documentos y procedimientos manuales. Balón Control busca centralizar la planificación, el seguimiento y la consulta de datos deportivos mediante una experiencia móvil organizada. No se atribuyen mejoras cuantificadas de productividad o tiempo.',
        ],
        'objectives' => [
            'title' => 'Objetivos',
            'body' => "Centralizar la gestión de equipos y plantillas.\nOrganizar entrenamientos, convocatorias y alineaciones.\nRegistrar asistencia y acontecimientos de partido.\nConsultar estadísticas e historial deportivo por equipo y temporada.\nSeparar el acceso según pertenencia al equipo y responsabilidad del cuerpo técnico.",
        ],
        'solution' => [
            'title' => 'Solución',
            'body' => 'Una API REST versionada desarrollada con Laravel se integra con una aplicación multiplataforma en React Native y Expo. La plataforma reúne equipos, jugadores, entrenamientos y partidos; organiza los datos por equipo y temporada; aplica permisos según membresías y roles; y conserva información histórica para consultar la evolución deportiva. La aplicación utiliza consultas tipadas con TanStack Query.',
        ],
        'contribution' => [
            'title' => 'Mi contribución',
            'body' => 'Desarrollo Full Stack del backend Laravel y de la aplicación móvil React Native/Expo. El trabajo cubre la implementación de flujos conectados para plantillas, entrenamientos, partidos y estadísticas, además de la integración entre cliente y API. Esta descripción refleja el rol declarado del proyecto y no asigna autoría individual a cada componente basándose únicamente en Git.',
        ],
        'architecture' => [
            'title' => 'Arquitectura',
            'body' => "Backend: Laravel 13, PHP 8.3 o superior, API REST versionada bajo /api/v1, Eloquent, Laravel Sanctum, Form Requests, API Resources y Policies. La lógica se organiza por dominios y Actions, con PostgreSQL 17 documentado para el entorno DDEV del proyecto.\nAplicación: React Native 0.88, Expo SDK 58, TypeScript, Expo Router, TanStack Query 5 y Expo SecureStore.\nCalidad: PHPUnit para backend y Vitest para la aplicación móvil. Las pruebas backend auditadas utilizan SQLite en memoria, no PostgreSQL.",
        ],
        'technical-decisions' => [
            'title' => 'Decisiones técnicas',
            'body' => "1. API versionada (/api/v1): delimita los contratos entre el backend y el cliente móvil.\n2. Lógica por dominios y Actions: separa las operaciones de negocio de la entrada HTTP.\n3. Membresías y roles por equipo: vincula la autorización a la pertenencia y responsabilidad dentro de cada equipo.\n4. Identidad separada de la plantilla: distingue el registro del jugador de su vínculo con un equipo y temporada.\n5. Snapshots e historial: conserva referencias históricas cuando cambian los datos deportivos.\n6. Caché aislada por usuario y equipo: evita mezclar contextos de consulta.\n7. Sincronización periódica del seguimiento de partido: mantiene actualizado el estado de reloj, periodos y eventos; no implica una cola offline de escritura.\n8. Información privada: combina autorización con almacenamiento específico. El OCR depende de un proveedor externo y exige revisión humana.",
        ],
        'challenges' => [
            'title' => 'Retos técnicos',
            'body' => "Gestionar permisos en un entorno con varios equipos y roles.\nPreservar la integridad del historial deportivo.\nMantener coherencia entre eventos, marcador y participación.\nRecuperar los flujos ante errores de autenticación y conectividad.\nRestringir el acceso a datos personales y documentos.\nMantener consistencia en estadísticas derivadas de entrenamientos y partidos.\nAdaptar las interfaces a distintos tamaños de pantalla.",
        ],
        'outcomes' => [
            'title' => 'Resultados verificados',
            'body' => "Auditoría automatizada de desarrollo realizada el 17/11/2026.\nBackend: 140 pruebas aprobadas y 970 aserciones; PHPUnit sobre SQLite en memoria.\nAplicación móvil: 117 pruebas aprobadas distribuidas en 24 archivos con Vitest.\nFlujos conectados: plantilla, entrenamientos, partidos y estadísticas.\nEstos datos describen verificaciones automatizadas en desarrollo; no son métricas de usuarios, clientes, negocio ni validación productiva.",
        ],
        'learnings' => [
            'title' => 'Limitaciones y siguientes pasos',
            'body' => "No hay despliegue productivo verificado ni validación completa en dispositivos físicos.\nNo existe una cola offline de escritura para eventos en directo.\nLa interfaz móvil de invitaciones del cuerpo técnico está incompleta, aunque las invitaciones están disponibles en backend.\nEl OCR depende de un proveedor externo y requiere revisión humana; no se mostrarán documentos personales en la galería.\nNo hay scouting ni análisis de vídeo implementados.\nQuedan por resolver decisiones operativas y de privacidad antes de producción.\nLa galería queda pendiente de capturas reales de inicio, plantilla, entrenamientos, asistencia, alineación, seguimiento, estadísticas y adaptaciones móvil/tablet.",
        ],
    ];

    /** @var array<string, array{name: string, category: string}> */
    private array $technologies = [
        'laravel' => ['name' => 'Laravel', 'category' => 'Backend'],
        'php' => ['name' => 'PHP', 'category' => 'Backend'],
        'postgresql' => ['name' => 'PostgreSQL', 'category' => 'Datos y entorno'],
        'react-native' => ['name' => 'React Native', 'category' => 'Desarrollo móvil'],
        'expo' => ['name' => 'Expo', 'category' => 'Desarrollo móvil'],
        'typescript' => ['name' => 'TypeScript', 'category' => 'Frontend'],
        'laravel-sanctum' => ['name' => 'Laravel Sanctum', 'category' => 'Backend'],
        'tanstack-query' => ['name' => 'TanStack Query', 'category' => 'Desarrollo móvil'],
    ];

    public function handle(): int
    {
        $matches = Project::query()->where('slug', 'balon-control')->get();
        if ($matches->count() !== 1) {
            $this->components->error('Se esperaba exactamente un proyecto con slug balon-control; no se escribió ningún dato.');

            return self::FAILURE;
        }

        $project = $matches->first();
        if ($project->publication_status !== 'draft') {
            $this->components->error('Balón Control ya no está en borrador; se conserva sin cambios.');

            return self::FAILURE;
        }

        $updates = $this->projectUpdates($project);
        $sectionPlan = $this->sectionPlan($project);
        $technologyPlan = $this->technologyPlan($project);
        $dryRun = (bool) $this->option('dry-run');

        $this->components->info($dryRun ? 'Dry-run: cambios previstos para el proyecto existente #'.$project->id : 'Actualizando proyecto existente #'.$project->id);
        foreach ($updates as $field => $value) {
            $this->line("Proyecto.{$field}: ".(blank($value) ? '(vacío)' : mb_strimwidth((string) $value, 0, 150, '…')));
        }
        $this->line('Secciones con contenido nuevo: '.collect($sectionPlan)->where('write', true)->count().' de '.count($this->sections));
        $this->line('Títulos por actualizar: '.collect($sectionPlan)->filter(fn (array $plan): bool => $plan['title'] !== null)->count());
        foreach ($sectionPlan as $key => $plan) {
            if ($plan['title'] !== null) {
                $this->line("Sección.{$key}.title: {$plan['title']}");
            }
        }
        $this->line('Tecnologías que se vincularán: '.implode(', ', array_column($technologyPlan, 'name')));
        $this->line('Estado editorial: borrador (sin cambios).');

        if ($dryRun) {
            return self::SUCCESS;
        }

        DB::transaction(function () use ($project, $updates, $sectionPlan): void {
            if ($updates !== []) {
                $project->fill($updates)->save();
            }

            foreach ($sectionPlan as $key => $plan) {
                if (! $plan['write'] && $plan['title'] === null) {
                    continue;
                }

                $section = ProjectCaseStudySection::query()->where('project_id', $project->id)->where('key', $key)->first();
                if (! $section) {
                    ProjectCaseStudySection::query()->create([
                        'project_id' => $project->id,
                        'key' => $key,
                        'title' => $this->sections[$key]['title'],
                        'body' => $this->sections[$key]['body'],
                        'position' => config("projects.case_study_sections.{$key}.position", 1000),
                        'is_visible' => true,
                    ]);

                    continue;
                }

                if ($plan['write']) {
                    $section->body = $this->sections[$key]['body'];
                }
                if ($plan['title'] !== null) {
                    $section->title = $plan['title'];
                }
                if (! $section->is_visible && $section->created_at?->equalTo($section->updated_at)) {
                    $section->is_visible = true;
                }
                $section->save();
            }

            $technologyIds = collect($this->technologyPlan($project))->map(function (array $item): int {
                $technology = Technology::query()
                    ->where('slug', $item['slug'])
                    ->orWhereRaw('LOWER(name) = ?', [mb_strtolower($item['name'])])
                    ->first();

                if (! $technology) {
                    $technology = Technology::query()->create([
                        'slug' => $item['slug'],
                        'name' => $item['name'],
                        'category' => $item['category'],
                        'is_visible' => true,
                    ]);
                }

                return (int) $technology->id;
            })->all();

            $project->technologies()->syncWithoutDetaching($technologyIds);
        });

        $this->components->info('Proyecto actualizado como borrador. No se publicó ni se alteraron otros proyectos.');

        return self::SUCCESS;
    }

    /** @return array<string, mixed> */
    private function projectUpdates(Project $project): array
    {
        $candidates = [
            'summary' => 'Aplicación móvil de gestión deportiva para entrenadores de fútbol que centraliza plantillas, entrenamientos, partidos y estadísticas.',
            'description' => 'Balón Control es una aplicación dirigida a entrenadores y cuerpos técnicos de fútbol que reúne en una única plataforma la gestión diaria de sus equipos. Permite administrar plantillas, organizar entrenamientos, controlar asistencia, preparar convocatorias y alineaciones, registrar acontecimientos durante los partidos y consultar estadísticas deportivas. La solución combina una API REST desarrollada con Laravel y una aplicación multiplataforma construida con React Native y Expo. La arquitectura incorpora autenticación por dispositivo, autorización por equipo y rol, gestión del historial deportivo y sincronización de información mediante consultas tipadas. El proyecto está funcional en desarrollo; no se ha verificado un despliegue productivo ni una validación completa en dispositivos físicos.',
            'category' => 'Aplicación deportiva',
            'project_type' => 'Proyecto propio',
            'role' => 'Desarrollo Full Stack · Backend Laravel y aplicación móvil React Native/Expo',
            'development_status' => 'in_progress',
            'seo_title' => 'Balón Control | Gestión deportiva para entrenadores de fútbol',
            'seo_description' => 'Caso de estudio de Balón Control, una aplicación móvil para la gestión de equipos, entrenamientos, partidos y estadísticas de fútbol.',
        ];
        $updates = [];

        foreach ($candidates as $field => $candidate) {
            $current = $project->getAttribute($field);
            if ($field === 'summary') {
                $isPlaceholder = blank($current) || str_starts_with((string) $current, 'Borrador inicial:');
            } elseif (in_array($field, ['category', 'project_type', 'role'], true)) {
                $isPlaceholder = blank($current) || $current === 'Pendiente de completar';
            } elseif ($field === 'development_status') {
                $isPlaceholder = blank($current) || $current === 'unspecified';
            } else {
                $isPlaceholder = blank($current);
            }

            if ($isPlaceholder) {
                $updates[$field] = $candidate;
            }
        }

        return $updates;
    }

    /** @return array<string, array{write: bool, title: ?string}> */
    private function sectionPlan(Project $project): array
    {
        $existing = ProjectCaseStudySection::query()->where('project_id', $project->id)->get()->keyBy('key');
        $plan = [];

        foreach ($this->sections as $key => $content) {
            $section = $existing->get($key);
            $defaultUntouched = $section && $section->created_at?->equalTo($section->updated_at);
            $write = ! $section || blank($section->body) && $defaultUntouched;
            $managedBody = $section && $section->body === $content['body'];
            $defaultTitle = config("projects.case_study_sections.{$key}.title");
            $title = $section && $section->title === $defaultTitle && $section->title !== $content['title'] && ($defaultUntouched || $managedBody)
                ? $content['title']
                : null;
            $plan[$key] = ['write' => $write, 'title' => $title];

            if ($section && filled($section->body)) {
                $this->line("Contenido existente conservado en sección '{$key}'.");
            } elseif ($section && ! $section->is_visible && ! $defaultUntouched) {
                $this->line("Visibilidad manual conservada en sección '{$key}'.");
            }
        }

        return $plan;
    }

    /** @return array<int, array{slug: string, name: string, category: string}> */
    private function technologyPlan(Project $project): array
    {
        $linked = $project->technologies()->pluck('technologies.id')->all();
        $plan = [];

        foreach ($this->technologies as $slug => $technology) {
            $existing = Technology::query()
                ->where('slug', $slug)
                ->orWhereRaw('LOWER(name) = ?', [mb_strtolower($technology['name'])])
                ->first();
            if ($existing && in_array($existing->id, $linked, true)) {
                continue;
            }
            $plan[] = ['slug' => $slug, ...$technology];
        }

        return $plan;
    }
}
