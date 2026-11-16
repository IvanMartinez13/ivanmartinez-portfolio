<?php

namespace Database\Seeders;

use App\Models\PortfolioPage;
use App\Models\PortfolioPageRevision;
use App\Models\PortfolioSection;
use App\Models\PortfolioSetting;
use App\Models\ProfessionalProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PortfolioSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $content = config('portfolio');

            $profile = ProfessionalProfile::query()->firstOrCreate(
                ['key' => 'primary'],
                [
                    'public_name' => $content['identity']['name'],
                    'headline' => $content['identity']['role'],
                    'specialty' => $content['hero']['eyebrow'],
                    'short_description' => $content['hero']['description'],
                    'biography' => implode("\n\n", $content['about']['paragraphs']),
                    'location' => null,
                    'availability_label' => $content['hero']['availability'],
                    'experience_years' => 5.0,
                    'links' => array_filter([
                        'linkedin' => $content['contact']['linkedin'],
                        'github' => null,
                        'website' => null,
                        'cv' => $content['contact']['cvUrl'],
                    ]),
                    'contact_email' => $content['contact']['email'],
                    'photo_url' => null,
                ],
            );

            $page = PortfolioPage::query()->firstOrCreate(
                ['key' => 'home'],
                [
                    'title' => 'Inicio',
                    'slug' => 'home',
                    'status' => 'published',
                    'published_at' => now(),
                ],
            );

            PortfolioSetting::query()->firstOrCreate(
                ['key' => 'primary'],
                [
                    'site_title' => 'ivanmartinez.dev',
                    'default_meta_description' => $content['hero']['description'],
                    'locale' => 'es',
                    'timezone' => 'Europe/Madrid',
                    'footer_note' => $content['footer']['note'],
                ],
            );

            $sections = [
                [
                    'key' => 'hero',
                    'nav_label' => null,
                    'position' => 0,
                    'content' => [
                        'headline' => $content['hero']['headline'],
                    ],
                ],
                [
                    'key' => 'projects',
                    'nav_label' => 'Proyectos',
                    'position' => 10,
                    'content' => [
                        'eyebrow' => 'Selección inicial',
                        'title' => 'Proyectos destacados',
                        'description' => 'Una primera selección de proyectos. Los detalles de alcance y participación se completarán tras su validación.',
                        'items' => $content['projects'],
                    ],
                ],
                [
                    'key' => 'experience',
                    'nav_label' => 'Experiencia',
                    'position' => 20,
                    'content' => [
                        'eyebrow' => 'Trayectoria',
                        'title' => 'Experiencia construyendo software.',
                        'description' => 'Desarrollo de productos digitales y software empresarial. Fechas, equipos y proyectos concretos pendientes de completar con información validada.',
                        'note' => 'Trayectoria completa pendiente de validación',
                    ],
                ],
                [
                    'key' => 'about',
                    'nav_label' => 'Sobre mí',
                    'position' => 30,
                    'content' => [
                        'eyebrow' => $content['about']['eyebrow'],
                        'title' => $content['about']['title'],
                    ],
                ],
                [
                    'key' => 'stack',
                    'nav_label' => 'Stack',
                    'position' => 40,
                    'content' => [
                        'eyebrow' => 'Herramientas',
                        'title' => 'Stack tecnológico',
                        'description' => 'Selección inicial basada en la tecnología del proyecto. La experiencia profesional con cada herramienta está pendiente de validar.',
                        'groups' => $content['technologyGroups'],
                    ],
                ],
                [
                    'key' => 'contact',
                    'nav_label' => 'Contacto',
                    'position' => 50,
                    'content' => [
                        'eyebrow' => $content['contact']['eyebrow'],
                        'title' => $content['contact']['title'],
                        'description' => $content['contact']['description'],
                    ],
                ],
            ];

            foreach ($sections as $section) {
                PortfolioSection::query()->firstOrCreate(
                    [
                        'portfolio_page_id' => $page->id,
                        'key' => $section['key'],
                    ],
                    [
                        'type' => $section['key'],
                        'nav_label' => $section['nav_label'],
                        'position' => $section['position'],
                        'is_visible' => true,
                        'variant' => 'default',
                        'content' => $section['content'],
                    ],
                );
            }

            if ($page->draft_blocks === null) {
                $blocks = PortfolioSection::query()->where('portfolio_page_id', $page->id)->orderBy('position')->get()
                    ->map(fn (PortfolioSection $section): array => [
                        'id' => (string) Str::uuid(),
                        'type' => match ($section->key) {
                            'projects' => 'featured_projects', 'experience' => 'timeline', 'about' => 'profile',
                            'stack' => 'technologies', 'contact' => 'cta', default => 'hero',
                        },
                        'position' => $section->position,
                        'visible' => $section->is_visible,
                        'variant' => $section->variant,
                        'spacing' => 'default',
                        'nav_label' => $section->nav_label,
                        'nav_label' => $section->nav_label,
                        'content' => ['legacy_key' => $section->key] + ($section->content ?? []),
                    ])->values()->all();
                $page->draft_blocks = $blocks;
                $page->save();
            }
            if ($page->status === 'published') {
                if ($page->published_blocks === null) {
                    $page->published_blocks = $page->draft_blocks;
                }
                $page->published_title ??= $page->title;
                $page->published_slug ??= $page->slug;
                $page->published_seo_title ??= $page->seo_title;
                $page->published_seo_description ??= $page->seo_description;
                $page->save();
                PortfolioPageRevision::query()->firstOrCreate(
                    ['portfolio_page_id' => $page->id, 'version' => 1],
                    ['title' => $page->title, 'slug' => $page->slug, 'seo_title' => $page->seo_title, 'seo_description' => $page->seo_description, 'blocks' => $page->published_blocks],
                );
            }
        });
    }
}
