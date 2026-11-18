<?php

namespace App\Services\Appearance;

class AppearancePresets
{
    /** @return array<string, array<string, mixed>> */
    public function all(): array
    {
        return [
            'editorial-premium' => [
                'label' => 'Editorial Premium',
                'description' => 'Contraste profundo, tipografía expresiva y acentos eléctricos.',
                'colors' => [
                    'navy' => '#101C31', 'primary' => '#2459E0', 'secondary' => '#17B6A4',
                    'background' => '#EFF3F9', 'surface' => '#FFFFFF', 'text' => '#101828',
                    'muted' => '#526079', 'accent' => '#17B6A4', 'tint' => '#E2E9F4', 'line' => '#D7DFEA',
                ],
                'fontFamily' => 'Geist', 'typeScale' => 'expressive', 'radius' => 'soft',
                'shadow' => 'editorial', 'container' => 'wide', 'buttonStyle' => 'solid',
                'spacing' => 'generous', 'motion' => 'subtle', 'headerVariant' => 'editorial', 'footerVariant' => 'editorial',
            ],
            'minimal-light' => [
                'label' => 'Minimal Light',
                'description' => 'Una lectura clara y ligera con una paleta contenida.',
                'colors' => [
                    'navy' => '#172638', 'primary' => '#2459E0', 'secondary' => '#17B6A4',
                    'background' => '#F8FAFC', 'surface' => '#FFFFFF', 'text' => '#101828',
                    'muted' => '#596579', 'accent' => '#17B6A4', 'tint' => '#F0F4F8', 'line' => '#E2E8F0',
                ],
                'fontFamily' => 'Inter', 'typeScale' => 'balanced', 'radius' => 'sharp',
                'shadow' => 'subtle', 'container' => 'standard', 'buttonStyle' => 'outline',
                'spacing' => 'comfortable', 'motion' => 'reduced', 'headerVariant' => 'minimal', 'footerVariant' => 'minimal',
            ],
        ];
    }

    /** @return array<string, mixed> */
    public function config(string $preset): array
    {
        abort_unless(isset($this->all()[$preset]), 404);
        $config = $this->all()[$preset];
        unset($config['label'], $config['description']);

        return ['preset' => $preset] + $config;
    }

    /** @return array<string, mixed> */
    public function defaults(): array
    {
        return $this->config('editorial-premium');
    }

    /** @param array<string, mixed>|null $config
     * @return array<string, mixed>
     */
    public function publicConfig(?array $config): array
    {
        $config ??= $this->defaults();

        return [...$config, 'cssVariables' => $this->cssVariables($config)];
    }

    /** @return array<string, mixed> */
    public function options(): array
    {
        return [
            'fonts' => ['Geist' => 'Geist', 'Inter' => 'Inter', 'System' => 'Sistema'],
            'typeScales' => ['compact' => 'Compacta', 'balanced' => 'Equilibrada', 'expressive' => 'Expresiva'],
            'radii' => ['sharp' => 'Preciso', 'soft' => 'Suave', 'round' => 'Redondo'],
            'shadows' => ['none' => 'Sin sombra', 'subtle' => 'Sutil', 'editorial' => 'Editorial'],
            'containers' => ['compact' => 'Compacto · 68 rem', 'standard' => 'Estándar · 76 rem', 'wide' => 'Amplio · 86 rem'],
            'buttonStyles' => ['solid' => 'Relleno', 'outline' => 'Contorno', 'editorial' => 'Editorial'],
            'spacingOptions' => ['compact' => 'Compacto', 'comfortable' => 'Cómodo', 'generous' => 'Generoso'],
            'motions' => ['reduced' => 'Reducida', 'subtle' => 'Sutil', 'full' => 'Completa'],
            'variants' => ['editorial' => 'Editorial', 'minimal' => 'Minimal'],
        ];
    }

    /** @param array<string, mixed> $config
     * @return array<string, string>
     */
    public function cssVariables(array $config): array
    {
        $colors = $config['colors'] ?? [];
        $font = match ($config['fontFamily'] ?? 'Inter') {
            'Geist' => 'Geist, Inter, ui-sans-serif, system-ui, sans-serif',
            'System' => 'ui-sans-serif, system-ui, sans-serif',
            default => 'Inter, ui-sans-serif, system-ui, sans-serif',
        };
        $scale = ['compact' => '0.94', 'balanced' => '1', 'expressive' => '1.08'][$config['typeScale'] ?? 'balanced'] ?? '1';
        $radius = ['sharp' => '0.35rem', 'soft' => '0.85rem', 'round' => '1.35rem'][$config['radius'] ?? 'soft'] ?? '0.85rem';
        $shadow = ['none' => 'none', 'subtle' => '0 12px 30px rgb(16 28 49 / 0.06)', 'editorial' => '0 24px 55px rgb(16 28 49 / 0.13)'][$config['shadow'] ?? 'subtle'] ?? 'none';
        $container = ['compact' => '68rem', 'standard' => '76rem', 'wide' => '86rem'][$config['container'] ?? 'standard'] ?? '76rem';
        $space = ['compact' => 'clamp(3.5rem, 7vw, 5.5rem)', 'comfortable' => 'clamp(4.5rem, 9vw, 7.5rem)', 'generous' => 'clamp(5rem, 10vw, 9rem)'][$config['spacing'] ?? 'comfortable'] ?? 'clamp(4.5rem, 9vw, 7.5rem)';
        $motion = ['reduced' => '0ms', 'subtle' => '180ms', 'full' => '300ms'][$config['motion'] ?? 'subtle'] ?? '180ms';

        return [
            '--portfolio-navy' => $colors['navy'] ?? '#101C31',
            '--portfolio-primary' => $colors['primary'] ?? '#2459E0',
            '--portfolio-secondary' => $colors['secondary'] ?? '#17B6A4',
            '--portfolio-background' => $colors['background'] ?? '#EFF3F9',
            '--portfolio-surface' => $colors['surface'] ?? '#FFFFFF',
            '--portfolio-ink' => $colors['text'] ?? '#101828',
            '--portfolio-muted' => $colors['muted'] ?? '#526079',
            '--portfolio-accent' => $colors['accent'] ?? '#17B6A4',
            '--portfolio-accent-strong' => $colors['primary'] ?? '#2459E0',
            '--portfolio-tint' => $colors['tint'] ?? '#E2E9F4',
            '--portfolio-line' => $colors['line'] ?? '#D7DFEA',
            '--portfolio-font-family' => $font,
            '--portfolio-type-scale' => $scale,
            '--portfolio-radius-card' => $radius,
            '--portfolio-radius-control' => $radius,
            '--portfolio-shadow-soft' => $shadow,
            '--portfolio-container' => $container,
            '--portfolio-section-space' => $space,
            '--portfolio-transition' => $motion,
        ];
    }
}
