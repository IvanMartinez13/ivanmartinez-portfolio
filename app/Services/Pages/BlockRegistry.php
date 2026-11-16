<?php

namespace App\Services\Pages;

class BlockRegistry
{
    /** @return array<string, array<string, mixed>> */
    public function all(): array
    {
        return [
            'hero' => ['label' => 'Hero', 'fields' => ['eyebrow', 'title', 'headline', 'body', 'description', 'button_label', 'button_url']],
            'rich_text' => ['label' => 'Texto enriquecido', 'fields' => ['title', 'html']],
            'image' => ['label' => 'Imagen', 'fields' => ['url', 'alt', 'caption']],
            'gallery' => ['label' => 'Galería', 'fields' => ['images']],
            'video' => ['label' => 'Vídeo', 'fields' => ['url', 'title']],
            'statistics' => ['label' => 'Estadísticas', 'fields' => ['items']],
            'featured_projects' => ['label' => 'Proyectos destacados', 'fields' => ['eyebrow', 'title', 'description', 'limit']],
            'project_grid' => ['label' => 'Grid de proyectos', 'fields' => ['title', 'description', 'limit']],
            'profile' => ['label' => 'Perfil profesional', 'fields' => ['eyebrow', 'title', 'body']],
            'timeline' => ['label' => 'Experiencia', 'fields' => ['eyebrow', 'title', 'description', 'note', 'items']],
            'technologies' => ['label' => 'Tecnologías', 'fields' => ['eyebrow', 'title', 'description', 'groups']],
            'cta' => ['label' => 'CTA', 'fields' => ['eyebrow', 'title', 'body', 'description', 'button_label', 'button_url']],
            'separator' => ['label' => 'Separador', 'fields' => []],
            'columns' => ['label' => 'Columnas', 'fields' => ['columns']],
            'contact_form' => ['label' => 'Formulario de contacto', 'fields' => ['title', 'description']],
        ];
    }

    /** @return array<string, mixed> */
    public function defaults(string $type): array
    {
        abort_unless(isset($this->all()[$type]), 422, 'Tipo de bloque no válido.');

        return match ($type) {
            'hero' => ['eyebrow' => '', 'title' => '', 'body' => '', 'button_label' => '', 'button_url' => ''],
            'rich_text' => ['title' => '', 'html' => ''],
            'image' => ['url' => '', 'alt' => '', 'caption' => ''],
            'gallery' => ['images' => []],
            'video' => ['url' => '', 'title' => ''],
            'statistics' => ['items' => []],
            'featured_projects', 'project_grid' => ['title' => 'Proyectos', 'description' => '', 'limit' => 4],
            'profile' => ['title' => 'Sobre mí', 'body' => ''],
            'timeline' => ['title' => 'Experiencia', 'items' => []],
            'technologies' => ['title' => 'Tecnologías', 'groups' => []],
            'cta' => ['eyebrow' => '', 'title' => '', 'body' => '', 'button_label' => '', 'button_url' => ''],
            'separator' => [],
            'columns' => ['columns' => [['title' => '', 'body' => ''], ['title' => '', 'body' => '']]],
            'contact_form' => ['title' => 'Contacto', 'description' => ''],
        };
    }

    /** @param array<string, mixed> $content
     * @return array<string, mixed>
     */
    public function validateContent(string $type, array $content): array
    {
        abort_unless(isset($this->all()[$type]), 422, 'Tipo de bloque no válido.');
        $legacyKey = $content['legacy_key'] ?? null;
        $legacyFields = [
            'hero' => ['eyebrow', 'headline', 'description'],
            'projects' => ['eyebrow', 'title', 'description', 'items'],
            'experience' => ['eyebrow', 'title', 'description', 'note'],
            'about' => ['eyebrow', 'title'],
            'stack' => ['eyebrow', 'title', 'description', 'groups'],
            'contact' => ['eyebrow', 'title', 'description'],
        ];
        $allowed = array_unique(array_merge($this->all()[$type]['fields'], $legacyFields[$legacyKey] ?? []));
        $content = array_intersect_key($content, array_flip($allowed));
        if (is_string($legacyKey) && isset($legacyFields[$legacyKey])) {
            $content['legacy_key'] = $legacyKey;
        }

        $listFields = ['images', 'items', 'groups', 'columns'];
        foreach ($content as $key => $value) {
            if (in_array($key, $listFields, true)) {
                $content[$key] = is_array($value) ? array_slice(array_values($value), 0, 40) : [];
            } elseif ($key === 'limit') {
                $content[$key] = min(12, max(1, (int) $value));
            } elseif (! is_string($value) && ! is_numeric($value)) {
                unset($content[$key]);
            } elseif (is_string($value)) {
                $content[$key] = mb_substr(trim($value), 0, $key === 'html' ? 30000 : ($key === 'url' ? 2048 : 5000));
            }
        }

        if ($type === 'rich_text') {
            $content['html'] = app(SafeRichText::class)->sanitize((string) ($content['html'] ?? ''));
        }
        if (in_array($type, ['image', 'video'], true) && filled($content['url'] ?? null)) {
            $url = (string) $content['url'];
            $safeUrl = str_starts_with($url, '/') && ! str_starts_with($url, '//')
                || filter_var($url, FILTER_VALIDATE_URL) && parse_url($url, PHP_URL_SCHEME) === 'https';
            abort_unless($safeUrl, 422, 'La URL debe ser local o HTTPS.');
            if ($type === 'image') {
                abort_unless(filled($content['alt'] ?? null), 422, 'Añade un texto alternativo para la imagen.');
            }
            if ($type === 'video') {
                $host = strtolower((string) parse_url($url, PHP_URL_HOST));
                abort_unless(in_array($host, ['youtube.com', 'www.youtube.com', 'youtu.be', 'vimeo.com', 'www.vimeo.com', 'player.vimeo.com'], true), 422, 'Proveedor de vídeo no permitido.');
            }
        }
        if (filled($content['button_url'] ?? null)) {
            $url = (string) $content['button_url'];
            $safe = str_starts_with($url, '/') && ! str_starts_with($url, '//') || str_starts_with($url, '#') || str_starts_with($url, 'mailto:')
                || (filter_var($url, FILTER_VALIDATE_URL) && parse_url($url, PHP_URL_SCHEME) === 'https');
            abort_unless($safe, 422, 'El enlace debe ser local, correo o HTTPS.');
        }
        if ($type === 'gallery') {
            $content['images'] = array_slice(array_values(array_filter($content['images'] ?? [], function ($item): bool {
                if (! is_array($item) || ! is_string($item['url'] ?? null)) {
                    return false;
                }
                $url = $item['url'];
                $safeUrl = str_starts_with($url, '/') && ! str_starts_with($url, '//')
                    || filter_var($url, FILTER_VALIDATE_URL) && parse_url($url, PHP_URL_SCHEME) === 'https';
                abort_unless($safeUrl, 422, 'La URL de la galería debe ser local o HTTPS.');
                abort_unless(filled($item['alt'] ?? null), 422, 'Añade texto alternativo a todas las imágenes de la galería.');

                return true;
            })), 0, 24);
        }
        if (in_array($type, ['featured_projects', 'project_grid'], true)) {
            $content['limit'] = min(12, max(1, (int) ($content['limit'] ?? 4)));
        }

        return $content;
    }
}
