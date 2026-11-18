<?php

namespace App\Http\Requests\Admin;

use App\Services\Appearance\AppearancePresets;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateAppearanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canAccessAdmin() === true;
    }

    public function rules(AppearancePresets $presets): array
    {
        $options = $presets->options();

        return [
            'config' => ['required', 'array:preset,colors,fontFamily,typeScale,radius,shadow,container,buttonStyle,spacing,motion,headerVariant,footerVariant'],
            'config.preset' => ['required', Rule::in(array_keys($presets->all()))],
            'config.colors' => ['required', 'array:navy,primary,secondary,background,surface,text,muted,accent,tint,line'],
            'config.colors.*' => ['required', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'config.fontFamily' => ['required', Rule::in(array_keys($options['fonts']))],
            'config.typeScale' => ['required', Rule::in(array_keys($options['typeScales']))],
            'config.radius' => ['required', Rule::in(array_keys($options['radii']))],
            'config.shadow' => ['required', Rule::in(array_keys($options['shadows']))],
            'config.container' => ['required', Rule::in(array_keys($options['containers']))],
            'config.buttonStyle' => ['required', Rule::in(array_keys($options['buttonStyles']))],
            'config.spacing' => ['required', Rule::in(array_keys($options['spacingOptions']))],
            'config.motion' => ['required', Rule::in(array_keys($options['motions']))],
            'config.headerVariant' => ['required', Rule::in(array_keys($options['variants']))],
            'config.footerVariant' => ['required', Rule::in(array_keys($options['variants']))],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            $colors = $this->input('config.colors', []);
            if (! is_array($colors)) {
                return;
            }

            $pairs = [
                ['text', 'background'], ['text', 'surface'], ['text', 'tint'],
                ['muted', 'background'], ['muted', 'surface'], ['muted', 'tint'],
                ['primary', 'background'], ['primary', 'surface'], ['primary', 'tint'],
                ['navy', 'surface'], ['secondary', 'navy'],
            ];
            foreach ($pairs as [$foreground, $background]) {
                if (! preg_match('/^#[0-9a-fA-F]{6}$/', (string) ($colors[$foreground] ?? ''))
                    || ! preg_match('/^#[0-9a-fA-F]{6}$/', (string) ($colors[$background] ?? ''))) {
                    continue;
                }
                if ($this->contrastRatio($colors[$foreground], $colors[$background]) < 4.5) {
                    $validator->errors()->add("config.colors.{$foreground}", "El color {$foreground} debe mantener contraste de 4,5:1 con {$background}.");
                }
            }

            if (preg_match('/^#[0-9a-fA-F]{6}$/', (string) ($colors['primary'] ?? '')) && $this->contrastRatio($colors['primary'], '#FFFFFF') < 4.5) {
                $validator->errors()->add('config.colors.primary', 'El color principal debe mantener contraste de 4,5:1 con texto blanco.');
            }
            if (preg_match('/^#[0-9a-fA-F]{6}$/', (string) ($colors['navy'] ?? '')) && $this->contrastRatio('#FFFFFF', $colors['navy']) < 4.5) {
                $validator->errors()->add('config.colors.navy', 'El navy debe mantener contraste de 4,5:1 con texto blanco.');
            }
        }];
    }

    private function contrastRatio(string $first, string $second): float
    {
        $luminance = fn (string $hex): float => array_sum(array_map(
            fn (float $channel, float $weight): float => $channel * $weight,
            array_map(function (int $value): float {
                $channel = $value / 255;

                return $channel <= 0.04045 ? $channel / 12.92 : (($channel + 0.055) / 1.055) ** 2.4;
            }, array_map('hexdec', str_split(ltrim($hex, '#'), 2))),
            [0.2126, 0.7152, 0.0722],
        ));
        $a = $luminance($first);
        $b = $luminance($second);

        return (max($a, $b) + 0.05) / (min($a, $b) + 0.05);
    }
}
