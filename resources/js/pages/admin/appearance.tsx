import { Head, Link, router, useForm } from '@inertiajs/react';
import { Eye, History, RotateCcw, Save, Send } from 'lucide-react';
import { useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { AppearanceConfig } from '@/types/portfolio';

type Preset = { key: string; label: string; description: string };
type Revision = {
    id: number;
    version: number;
    preset: string;
    created_at: string;
};
type Options = Record<string, Record<string, string>>;
type Props = {
    appearance: {
        draftConfig: AppearanceConfig;
        publishedConfig: AppearanceConfig;
        publishedAt: string | null;
    };
    presets: Preset[];
    options: Options;
    revisions: Revision[];
};
const colorNames: Record<keyof AppearanceConfig['colors'], string> = {
    navy: 'Navy',
    primary: 'Azul principal',
    secondary: 'Turquesa',
    background: 'Fondo',
    surface: 'Superficie',
    text: 'Texto',
    muted: 'Texto secundario',
    accent: 'Acento',
    tint: 'Fondo suave',
    line: 'Bordes',
};
const selectFields = [
    { key: 'fontFamily', label: 'Tipografía', options: 'fonts' },
    { key: 'typeScale', label: 'Escala tipográfica', options: 'typeScales' },
    { key: 'radius', label: 'Radios', options: 'radii' },
    { key: 'shadow', label: 'Sombras', options: 'shadows' },
    { key: 'container', label: 'Ancho de contenido', options: 'containers' },
    { key: 'buttonStyle', label: 'Estilo de botones', options: 'buttonStyles' },
    { key: 'spacing', label: 'Espaciado vertical', options: 'spacingOptions' },
    { key: 'motion', label: 'Intensidad de animación', options: 'motions' },
    { key: 'headerVariant', label: 'Cabecera', options: 'variants' },
    { key: 'footerVariant', label: 'Pie de página', options: 'variants' },
] as const;

export default function Appearance({
    appearance,
    presets,
    options,
    revisions,
}: Props) {
    const form = useForm<{ config: AppearanceConfig }>({
        config: appearance.draftConfig,
    });
    useEffect(
        () => form.setData('config', appearance.draftConfig),
        [appearance.draftConfig],
    );
    const setField = <K extends keyof AppearanceConfig>(
        key: K,
        value: AppearanceConfig[K],
    ) => form.setData('config', { ...form.data.config, [key]: value });
    const updateColor = (
        key: keyof AppearanceConfig['colors'],
        value: string,
    ) =>
        form.setData('config', {
            ...form.data.config,
            colors: { ...form.data.config.colors, [key]: value },
        });
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.put('/admin/appearance');
    };
    const publish = () =>
        form.put('/admin/appearance', {
            onSuccess: () => router.post('/admin/appearance/publish'),
        });

    return (
        <>
            <Head title="Apariencia · Administración" />
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <p className="mb-2 text-sm font-medium text-teal-700">
                        Identidad visual
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Apariencia
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                        Configura el lenguaje visual del portfolio. Los cambios
                        guardados como borrador solo se ven en la
                        previsualización hasta que los publiques.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline">
                        <Link href="/admin/appearance/preview" target="_blank">
                            <Eye className="mr-2 size-4" />
                            Previsualizar
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        disabled={form.processing}
                        onClick={() => form.put('/admin/appearance')}
                    >
                        <Save className="mr-2 size-4" />
                        Guardar borrador
                    </Button>
                    <Button
                        disabled={form.processing}
                        onClick={() => {
                            if (
                                window.confirm(
                                    '¿Publicar esta apariencia para todos los visitantes?',
                                )
                            )
                                publish();
                        }}
                    >
                        <Send className="mr-2 size-4" />
                        Publicar tema
                    </Button>
                </div>
            </div>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
                <form onSubmit={submit} className="space-y-6">
                    <Card className="border-slate-200 shadow-none">
                        <CardHeader>
                            <CardTitle>Presets</CardTitle>
                            <CardDescription>
                                Un preset carga una base en el borrador; no
                                cambia la web hasta publicar.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3 md:grid-cols-2">
                            {presets.map((preset) => (
                                <button
                                    key={preset.key}
                                    type="button"
                                    onClick={() =>
                                        router.post(
                                            `/admin/appearance/presets/${preset.key}`,
                                        )
                                    }
                                    className={`rounded-xl border p-4 text-left transition-colors hover:border-teal-700 ${form.data.config.preset === preset.key ? 'border-teal-700 bg-teal-50/70' : 'border-slate-200 bg-white'}`}
                                >
                                    <span className="flex items-center justify-between gap-4">
                                        <strong className="text-sm">
                                            {preset.label}
                                        </strong>
                                        <span
                                            className="size-5 rounded-full border border-black/10"
                                            style={{
                                                background:
                                                    preset.key ===
                                                    'editorial-premium'
                                                        ? 'linear-gradient(135deg,#101c31 50%,#2459e0 50%)'
                                                        : 'linear-gradient(135deg,#f8fafc 50%,#16877d 50%)',
                                            }}
                                        />
                                    </span>
                                    <span className="mt-2 block text-xs leading-5 text-slate-500">
                                        {preset.description}
                                    </span>
                                </button>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-none">
                        <CardHeader>
                            <CardTitle>Paleta global</CardTitle>
                            <CardDescription>
                                Los colores se validan como hex. El contraste de
                                texto se mantiene dentro de los tokens
                                disponibles.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {Object.entries(colorNames).map(([key, label]) => (
                                <div
                                    key={key}
                                    className="flex items-center gap-3 rounded-lg border border-slate-200 p-3"
                                >
                                    <input
                                        aria-label={label}
                                        type="color"
                                        value={
                                            form.data.config.colors[
                                                key as keyof AppearanceConfig['colors']
                                            ]
                                        }
                                        onChange={(event) =>
                                            updateColor(
                                                key as keyof AppearanceConfig['colors'],
                                                event.target.value,
                                            )
                                        }
                                        className="size-10 cursor-pointer rounded border-0 bg-transparent p-0"
                                    />
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-slate-700">
                                            {label}
                                        </p>
                                        <input
                                            aria-label={`${label} hex`}
                                            value={
                                                form.data.config.colors[
                                                    key as keyof AppearanceConfig['colors']
                                                ]
                                            }
                                            onChange={(event) =>
                                                updateColor(
                                                    key as keyof AppearanceConfig['colors'],
                                                    event.target.value,
                                                )
                                            }
                                            className="mt-1 w-full border-0 bg-transparent p-0 font-mono text-xs text-slate-500 uppercase focus:ring-0"
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                        {form.errors['config.colors'] && (
                            <p className="px-6 pb-5 text-sm text-red-600">
                                {form.errors['config.colors']}
                            </p>
                        )}
                    </Card>

                    <Card className="border-slate-200 shadow-none">
                        <CardHeader>
                            <CardTitle>Sistema visual</CardTitle>
                            <CardDescription>
                                Opciones seguras y predefinidas; no se admite
                                CSS ni JavaScript arbitrario.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-5 sm:grid-cols-2">
                            {selectFields.map(
                                ({ key, label, options: optionKey }) => (
                                    <div key={key} className="space-y-2">
                                        <Label htmlFor={key}>{label}</Label>
                                        <select
                                            id={key}
                                            value={form.data.config[key]}
                                            onChange={(event) =>
                                                setField(
                                                    key,
                                                    event.target.value as never,
                                                )
                                            }
                                            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                                        >
                                            {Object.entries(
                                                options[optionKey],
                                            ).map(([value, name]) => (
                                                <option
                                                    key={value}
                                                    value={value}
                                                >
                                                    {name}
                                                </option>
                                            ))}
                                        </select>
                                        {form.errors[
                                            `config.${key}` as keyof typeof form.errors
                                        ] && (
                                            <p className="text-xs text-red-600">
                                                {
                                                    form.errors[
                                                        `config.${key}` as keyof typeof form.errors
                                                    ]
                                                }
                                            </p>
                                        )}
                                    </div>
                                ),
                            )}
                        </CardContent>
                    </Card>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={form.processing}>
                            <Save className="mr-2 size-4" />
                            {form.processing
                                ? 'Guardando…'
                                : 'Guardar borrador'}
                        </Button>
                    </div>
                </form>

                <aside className="space-y-5">
                    <Card className="border-slate-200 shadow-none">
                        <CardHeader>
                            <CardTitle className="text-base">
                                Estado de publicación
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm font-medium text-slate-800">
                                {appearance.publishedConfig.preset ===
                                'editorial-premium'
                                    ? 'Editorial Premium'
                                    : 'Minimal Light'}
                            </p>
                            <p className="mt-2 text-xs leading-5 text-slate-500">
                                {appearance.publishedAt
                                    ? `Publicado ${new Date(appearance.publishedAt).toLocaleString()}`
                                    : 'Todavía no hay una apariencia publicada.'}
                            </p>
                            <div className="mt-4 flex h-10 overflow-hidden rounded-md border border-slate-200">
                                {Object.values(
                                    appearance.publishedConfig.colors,
                                )
                                    .slice(0, 5)
                                    .map((color, index) => (
                                        <span
                                            key={index}
                                            className="flex-1"
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200 shadow-none">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <History className="size-4" />
                                Versiones anteriores
                            </CardTitle>
                            <CardDescription>
                                Recupera una publicación como borrador.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {revisions.length ? (
                                revisions.map((revision) => (
                                    <div
                                        key={revision.id}
                                        className="border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="text-sm font-medium">
                                                    Versión {revision.version}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {revision.preset ===
                                                    'editorial-premium'
                                                        ? 'Editorial Premium'
                                                        : 'Minimal Light'}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-400">
                                                    {new Date(
                                                        revision.created_at,
                                                    ).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (
                                                    window.confirm(
                                                        '¿Recuperar como borrador esta versión?',
                                                    )
                                                )
                                                    router.post(
                                                        `/admin/appearance/revisions/${revision.id}/restore`,
                                                    );
                                            }}
                                            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:underline"
                                        >
                                            <RotateCcw className="size-3.5" />
                                            Recuperar borrador
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500">
                                    La primera versión aparecerá al publicar un
                                    cambio.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </>
    );
}
