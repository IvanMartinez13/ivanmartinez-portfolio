import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowLeft,
    ArrowUp,
    Copy,
    Eye,
    GripVertical,
    Plus,
    Save,
    Send,
    Trash2,
    Images,
    Search,
} from 'lucide-react';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StructuredBlockField } from '@/components/admin/structured-block-field';
const RichTextEditor = lazy(() =>
    import('@/components/admin/rich-text-editor').then((module) => ({
        default: module.RichTextEditor,
    })),
);
import type {
    JsonValue,
    PageBlock,
    PageBuilderPage,
} from '@/types/page-builder';

type BlockType = {
    label: string;
    fields: string[];
    defaults: Record<string, JsonValue>;
};
type Version = {
    id: number;
    version: number;
    title: string;
    slug: string;
    created_at: string;
};
type Props = {
    page: PageBuilderPage;
    blockTypes: Record<string, BlockType>;
    versions: Version[];
};
type MediaAsset = {
    id: number;
    url: string;
    original_name: string;
    alt_text: string;
    references: number;
};
const labels: Record<string, string> = {
    eyebrow: 'Antetítulo',
    title: 'Título',
    headline: 'Titular',
    body: 'Texto',
    description: 'Descripción',
    button_label: 'Texto del botón',
    button_url: 'Enlace del botón',
    resume_action_label: 'CTA al currículum',
    projects_action_label: 'CTA a proyectos',
    download_action_label: 'CTA de descarga PDF editorial',
    download_variant: 'Formato PDF para descargar',
    resume_navigation_label: 'Etiqueta de navegación del CV',
    show_resume_action: 'Mostrar CTA al currículum cuando esté publicado',
    show_projects_action: 'Mostrar CTA a proyectos',
    show_download_action:
        'Mostrar descarga PDF editorial cuando esté publicado',
    show_navigation_link: 'Mostrar enlace al CV en la navegación',
    show_graphic: 'Mostrar recurso gráfico del Hero',
    cta_label: 'Texto del CTA al currículum',
    show_cta: 'Mostrar CTA al currículum',
    html: 'Contenido HTML permitido',
    url: 'URL',
    alt: 'Texto alternativo',
    caption: 'Pie de imagen',
    images: 'Imágenes (JSON)',
    items: 'Elementos (JSON)',
    limit: 'Número máximo',
    groups: 'Grupos (JSON)',
    columns: 'Columnas (JSON)',
};

export default function PageEditor({ page, blockTypes, versions }: Props) {
    const [blocks, setBlocks] = useState<PageBlock[]>(page.blocks);
    const form = useForm({
        title: page.title,
        slug: page.slug,
        seo_title: page.seo_title,
        seo_description: page.seo_description,
        blocks_json: JSON.stringify(page.blocks),
    });
    const [selected, setSelected] = useState<string | null>(
        page.blocks[0]?.id ?? null,
    );
    const [dragged, setDragged] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
    const [mediaSearch, setMediaSearch] = useState('');
    const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
    const imageInput = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (!form.isDirty) return;
        const warn = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [form.isDirty]);
    const replaceBlocks = (next: PageBlock[]) => {
        setBlocks(next);
        form.setData('blocks_json', JSON.stringify(next));
    };
    const block = blocks.find((item) => item.id === selected) ?? null;
    const blockAppearance = block?.appearance ?? {
        background: 'default',
        contrast: 'auto',
        alignment: 'left',
        content_width: 'standard',
        graphic: 'none',
    };
    const setBlock = (id: string, update: Partial<PageBlock>) =>
        replaceBlocks(
            blocks.map((item) =>
                item.id === id ? { ...item, ...update } : item,
            ),
        );
    const updateAppearance = (
        key: keyof NonNullable<PageBlock['appearance']>,
        value: string,
    ) => {
        if (block)
            setBlock(block.id, {
                appearance: {
                    ...blockAppearance,
                    [key]: value,
                } as PageBlock['appearance'],
            });
    };
    const updateContent = (id: string, key: string, value: JsonValue) => {
        const current = blocks.find((item) => item.id === id);
        if (current)
            setBlock(id, { content: { ...current.content, [key]: value } });
    };
    const collectionField = (key: string, value: JsonValue) =>
        Array.isArray(value) && block ? (
            <StructuredBlockField
                blockType={block.type}
                field={key}
                value={value}
                onChange={(next) => updateContent(block.id, key, next)}
            />
        ) : null;
    const addBlock = (type: string) => {
        const next: PageBlock = {
            id: crypto.randomUUID(),
            type,
            position: blocks.length * 10,
            visible: true,
            variant: 'default',
            spacing: 'default',
            appearance: {
                background: 'default',
                contrast: 'auto',
                alignment: 'left',
                content_width: 'standard',
                graphic: 'none',
            },
            nav_label: '',
            content: { ...blockTypes[type]?.defaults },
        };
        replaceBlocks([...blocks, next]);
        setSelected(next.id);
    };
    const removeBlock = (id: string) => {
        if (window.confirm('¿Eliminar este bloque del borrador?')) {
            replaceBlocks(blocks.filter((item) => item.id !== id));
            setSelected(null);
        }
    };
    const moveBlock = (from: string, to: string) => {
        if (from === to) return;
        const items = [...blocks];
        const fromIndex = items.findIndex((item) => item.id === from);
        const toIndex = items.findIndex((item) => item.id === to);
        if (fromIndex < 0 || toIndex < 0) return;
        const [moved] = items.splice(fromIndex, 1);
        items.splice(toIndex, 0, moved);
        replaceBlocks(
            items.map((item, index) => ({ ...item, position: index * 10 })),
        );
    };
    const moveBlockBy = (id: string, offset: number) => {
        const index = blocks.findIndex((item) => item.id === id);
        const target = blocks[index + offset];
        if (target) moveBlock(id, target.id);
    };
    const duplicateBlock = (id: string) => {
        const index = blocks.findIndex((item) => item.id === id);
        const original = blocks[index];
        if (!original) return;
        const copy: PageBlock = {
            ...original,
            id: crypto.randomUUID(),
            position: original.position + 1,
            content: JSON.parse(
                JSON.stringify(original.content),
            ) as PageBlock['content'],
        };
        const next = [...blocks];
        next.splice(index + 1, 0, copy);
        replaceBlocks(
            next.map((item, itemIndex) => ({
                ...item,
                position: itemIndex * 10,
            })),
        );
        setSelected(copy.id);
    };
    const save = () => {
        const options = { onSuccess: () => form.setDefaults() };
        if (page.id) form.put(`/admin/pages/${page.id}`, options);
        else form.post('/admin/pages', options);
    };
    const uploadAsset = async (file?: File) => {
        if (!file || !page.id || !block) return;
        setUploading(true);
        setUploadError(null);
        const token = document.cookie
            .split('; ')
            .find((cookie) => cookie.startsWith('XSRF-TOKEN='))
            ?.split('=')
            .slice(1)
            .join('=');
        const payload = new FormData();
        payload.append('image', file);
        try {
            const response = await fetch('/admin/media', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    ...(token
                        ? { 'X-XSRF-TOKEN': decodeURIComponent(token) }
                        : {}),
                },
                body: payload,
            });
            const result = (await response.json()) as {
                asset?: MediaAsset;
                message?: string;
            };
            if (!response.ok || !result.asset)
                throw new Error(
                    result.message ?? 'No se ha podido subir la imagen.',
                );
            if (block.type === 'gallery')
                updateContent(block.id, 'images', [
                    ...(Array.isArray(block.content.images)
                        ? block.content.images
                        : []),
                    {
                        asset_id: result.asset.id,
                        url: result.asset.url,
                        alt: result.asset.alt_text,
                        caption: '',
                    },
                ]);
            else {
                updateContent(block.id, 'asset_id', result.asset.id);
                updateContent(block.id, 'url', result.asset.url);
                updateContent(block.id, 'alt', result.asset.alt_text);
            }
        } catch (error) {
            setUploadError(
                error instanceof Error
                    ? error.message
                    : 'No se ha podido subir la imagen.',
            );
        } finally {
            setUploading(false);
            if (imageInput.current) imageInput.current.value = '';
        }
    };
    const loadMedia = async () => {
        const response = await fetch(
            `/admin/media/library?${new URLSearchParams({ q: mediaSearch })}`,
            {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            },
        );
        if (!response.ok)
            throw new Error('No se ha podido cargar la biblioteca.');
        const result = (await response.json()) as { assets: MediaAsset[] };
        setMediaAssets(result.assets);
    };
    const openMediaPicker = () => {
        setMediaPickerOpen((open) => !open);
        if (!mediaPickerOpen)
            void loadMedia().catch(() =>
                setUploadError('No se ha podido cargar la biblioteca.'),
            );
    };
    const chooseMedia = (asset: MediaAsset) => {
        if (!block) return;
        if (block.type === 'gallery')
            updateContent(block.id, 'images', [
                ...(Array.isArray(block.content.images)
                    ? block.content.images
                    : []),
                {
                    asset_id: asset.id,
                    url: asset.url,
                    alt: asset.alt_text,
                    caption: '',
                },
            ]);
        else {
            updateContent(block.id, 'asset_id', asset.id);
            updateContent(block.id, 'url', asset.url);
            updateContent(block.id, 'alt', asset.alt_text);
        }
        setMediaPickerOpen(false);
    };
    const publish = () => {
        if (
            page.id &&
            window.confirm('¿Publicar la versión actual del borrador?')
        )
            router.post(`/admin/pages/${page.id}/publish`);
    };
    const field = (key: string, value: JsonValue) => {
        if (
            Array.isArray(value) ||
            (value !== null && typeof value === 'object')
        )
            return null;
        if (typeof value === 'boolean')
            return (
                <input
                    type="checkbox"
                    checked={value}
                    onChange={(event) =>
                        updateContent(block!.id, key, event.target.checked)
                    }
                    className="size-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
                />
            );
        if (key === 'download_variant')
            return (
                <select
                    value={value === 'ats' ? 'ats' : 'professional'}
                    onChange={(event) =>
                        updateContent(block!.id, key, event.target.value)
                    }
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus-visible:outline-2 focus-visible:outline-teal-600"
                >
                    <option value="professional">Editorial</option>
                    <option value="ats">ATS</option>
                </select>
            );
        const shown = String(value ?? '');
        if (key === 'html')
            return (
                <Suspense
                    fallback={
                        <div
                            className="min-h-40 animate-pulse rounded-lg border border-slate-200 bg-slate-50"
                            aria-label="Cargando editor"
                        />
                    }
                >
                    <RichTextEditor
                        value={shown}
                        onChange={(next) => updateContent(block!.id, key, next)}
                        label="Texto del bloque"
                    />
                </Suspense>
            );
        return ['body', 'description'].includes(key) ? (
            <textarea
                value={shown}
                onChange={(event) =>
                    updateContent(block!.id, key, event.target.value)
                }
                rows={key === 'html' || key === 'body' ? 6 : 4}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-teal-600"
            />
        ) : (
            <input
                type={key === 'limit' ? 'number' : 'text'}
                value={shown}
                onChange={(event) =>
                    updateContent(
                        block!.id,
                        key,
                        key === 'limit'
                            ? Number(event.target.value)
                            : event.target.value,
                    )
                }
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus-visible:outline-2 focus-visible:outline-teal-600"
            />
        );
    };

    return (
        <>
            <Head title={page.id ? `Editar ${page.title}` : 'Nueva página'} />
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <Link
                        href="/admin/pages"
                        className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
                    >
                        <ArrowLeft className="size-4" />
                        Páginas
                    </Link>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {page.id ? `Editar: ${page.title}` : 'Nueva página'}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Editas un borrador independiente de la versión
                        publicada.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {page.id && (
                        <Button asChild variant="outline">
                            <a
                                href={`/admin/pages/${page.id}/preview`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <Eye className="mr-2 size-4" />
                                Vista previa
                            </a>
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        onClick={save}
                        disabled={form.processing}
                    >
                        <Save className="mr-2 size-4" />
                        {form.processing ? 'Guardando…' : 'Guardar borrador'}
                    </Button>
                    {page.id && (
                        <Button
                            onClick={publish}
                            disabled={form.processing || form.isDirty}
                            title={
                                form.isDirty
                                    ? 'Guarda los cambios antes de publicar'
                                    : undefined
                            }
                        >
                            <Send className="mr-2 size-4" />
                            {form.isDirty
                                ? 'Guarda antes de publicar'
                                : 'Publicar'}
                        </Button>
                    )}
                </div>
            </div>
            <div className="grid gap-5 xl:grid-cols-[210px_minmax(0,1fr)_300px]">
                <aside className="space-y-5">
                    <section className="rounded-xl border border-slate-200 bg-white p-4">
                        <h2 className="mb-3 text-sm font-semibold">
                            Añadir bloque
                        </h2>
                        <div className="grid gap-1">
                            {Object.entries(blockTypes).map(
                                ([type, descriptor]) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => addBlock(type)}
                                        className="flex items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                                    >
                                        <Plus className="size-3.5" />
                                        {descriptor.label}
                                    </button>
                                ),
                            )}
                        </div>
                    </section>
                    {page.id && (
                        <section className="rounded-xl border border-slate-200 bg-white p-4">
                            <h2 className="mb-3 text-sm font-semibold">
                                Historial publicado
                            </h2>
                            {versions.length ? (
                                versions.map((version) => (
                                    <div
                                        key={version.id}
                                        className="mb-3 border-b border-slate-100 pb-3 last:mb-0 last:border-0"
                                    >
                                        <p className="text-sm font-medium">
                                            Versión {version.version}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {new Date(
                                                version.created_at,
                                            ).toLocaleString()}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (
                                                    window.confirm(
                                                        '¿Restaurar esta versión al borrador?',
                                                    )
                                                )
                                                    router.post(
                                                        `/admin/pages/${page.id}/revisions/${version.id}/restore`,
                                                    );
                                            }}
                                            className="mt-2 text-xs font-medium text-teal-700 hover:underline"
                                        >
                                            Restaurar al borrador
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-500">
                                    Aún no hay versiones publicadas.
                                </p>
                            )}
                        </section>
                    )}
                </aside>
                <section className="min-w-0 space-y-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-semibold">Estructura</h2>
                            <Badge
                                variant={
                                    page.status === 'published'
                                        ? 'secondary'
                                        : 'outline'
                                }
                            >
                                {page.status === 'published'
                                    ? 'Versión pública activa'
                                    : 'Solo borrador'}
                            </Badge>
                        </div>
                        <p
                            role="status"
                            aria-live="polite"
                            className={`mb-3 text-xs ${form.isDirty ? 'text-amber-700' : 'text-emerald-700'}`}
                        >
                            {form.isDirty
                                ? 'Cambios sin guardar'
                                : 'Cambios guardados'}
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <label className="space-y-1.5 text-xs font-medium text-slate-600">
                                Título
                                <input
                                    value={form.data.title}
                                    onChange={(event) =>
                                        form.setData(
                                            'title',
                                            event.target.value,
                                        )
                                    }
                                    className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-900"
                                />
                            </label>
                            <label className="space-y-1.5 text-xs font-medium text-slate-600">
                                Slug
                                <input
                                    value={form.data.slug}
                                    onChange={(event) =>
                                        form.setData('slug', event.target.value)
                                    }
                                    disabled={page.key === 'home'}
                                    className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-900 disabled:bg-slate-50"
                                />
                            </label>
                            <label className="space-y-1.5 text-xs font-medium text-slate-600">
                                Título SEO
                                <input
                                    value={form.data.seo_title}
                                    onChange={(event) =>
                                        form.setData(
                                            'seo_title',
                                            event.target.value,
                                        )
                                    }
                                    className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-900"
                                />
                            </label>
                            <label className="space-y-1.5 text-xs font-medium text-slate-600">
                                Descripción SEO
                                <input
                                    value={form.data.seo_description}
                                    onChange={(event) =>
                                        form.setData(
                                            'seo_description',
                                            event.target.value,
                                        )
                                    }
                                    className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-900"
                                />
                            </label>
                        </div>
                        {form.errors.title && (
                            <p className="mt-2 text-xs text-red-600">
                                {form.errors.title}
                            </p>
                        )}
                        {form.errors.slug && (
                            <p className="mt-2 text-xs text-red-600">
                                {form.errors.slug}
                            </p>
                        )}
                    </div>
                    {blocks.map((item, index) => (
                        <article
                            key={item.id}
                            draggable
                            onDragStart={() => setDragged(item.id)}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={() => {
                                if (dragged) moveBlock(dragged, item.id);
                                setDragged(null);
                            }}
                            onClick={() => setSelected(item.id)}
                            className={`cursor-pointer rounded-xl border bg-white p-4 transition-colors ${selected === item.id ? 'border-teal-700 ring-1 ring-teal-700/15' : 'border-slate-200 hover:border-slate-300'} ${!item.visible ? 'opacity-55' : ''}`}
                        >
                            <div className="flex items-center gap-2">
                                <GripVertical className="size-4 text-slate-400" />
                                <h3 className="font-medium">
                                    {blockTypes[item.type]?.label ?? item.type}
                                </h3>
                                <span className="ml-auto text-xs text-slate-400">
                                    {item.visible ? 'Visible' : 'Oculto'}
                                </span>
                                <button
                                    type="button"
                                    aria-label="Subir bloque"
                                    disabled={index === 0}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        moveBlockBy(item.id, -1);
                                    }}
                                    className="inline-flex size-10 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-teal-700 disabled:opacity-30"
                                >
                                    <ArrowUp className="size-4" />
                                </button>
                                <button
                                    type="button"
                                    aria-label="Duplicar bloque"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        duplicateBlock(item.id);
                                    }}
                                    className="inline-flex size-10 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-teal-700"
                                >
                                    <Copy className="size-4" />
                                </button>
                                <button
                                    type="button"
                                    aria-label="Bajar bloque"
                                    disabled={index === blocks.length - 1}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        moveBlockBy(item.id, 1);
                                    }}
                                    className="inline-flex size-10 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-teal-700 disabled:opacity-30"
                                >
                                    <ArrowDown className="size-4" />
                                </button>
                            </div>
                            <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                                {typeof item.content.title === 'string'
                                    ? item.content.title
                                    : typeof item.content.headline === 'string'
                                      ? item.content.headline
                                      : typeof item.content.body === 'string'
                                        ? item.content.body
                                        : 'Bloque editable'}
                            </p>
                        </article>
                    ))}
                    {blocks.length === 0 && (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-sm text-slate-500">
                            Añade bloques desde la columna lateral.
                        </div>
                    )}
                </section>
                <aside className="space-y-4">
                    <section className="rounded-xl border border-slate-200 bg-white p-4">
                        <h2 className="mb-4 font-semibold">Propiedades</h2>
                        {block ? (
                            <>
                                <label className="mb-3 flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={block.visible}
                                        onChange={(event) =>
                                            setBlock(block.id, {
                                                visible: event.target.checked,
                                            })
                                        }
                                    />
                                    Visible
                                </label>
                                <div className="mb-4 grid grid-cols-2 gap-2">
                                    <label className="space-y-1 text-xs font-medium text-slate-600">
                                        Espaciado
                                        <select
                                            value={block.spacing}
                                            onChange={(event) =>
                                                setBlock(block.id, {
                                                    spacing: event.target
                                                        .value as PageBlock['spacing'],
                                                })
                                            }
                                            className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-xs"
                                        >
                                            <option value="none">
                                                Sin espacio
                                            </option>
                                            <option value="compact">
                                                Compacto
                                            </option>
                                            <option value="default">
                                                Normal
                                            </option>
                                            <option value="relaxed">
                                                Amplio
                                            </option>
                                        </select>
                                    </label>
                                    <label className="space-y-1 text-xs font-medium text-slate-600">
                                        Variante
                                        <select
                                            value={block.variant}
                                            onChange={(event) =>
                                                setBlock(block.id, {
                                                    variant: event.target
                                                        .value as PageBlock['variant'],
                                                })
                                            }
                                            className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-xs"
                                        >
                                            <option value="default">
                                                Estándar
                                            </option>
                                            <option value="subtle">
                                                Fondo suave
                                            </option>
                                            <option value="bordered">
                                                Contenedor
                                            </option>
                                        </select>
                                    </label>
                                </div>
                                <div className="mb-4 space-y-2 rounded-lg bg-slate-50 p-3">
                                    <p className="text-xs font-semibold text-slate-700">
                                        Apariencia del bloque
                                    </p>
                                    <label className="block space-y-1 text-xs text-slate-600">
                                        Fondo
                                        <select
                                            value={blockAppearance.background}
                                            onChange={(event) =>
                                                updateAppearance(
                                                    'background',
                                                    event.target.value,
                                                )
                                            }
                                            className="h-9 w-full rounded-md border border-slate-200 bg-white px-2"
                                        >
                                            <option value="default">
                                                Tema
                                            </option>
                                            <option value="light">
                                                Claro suave
                                            </option>
                                            <option value="surface">
                                                Blanco
                                            </option>
                                            <option value="navy">Navy</option>
                                            <option value="primary">
                                                Azul principal
                                            </option>
                                            <option value="turquoise">
                                                Turquesa
                                            </option>
                                        </select>
                                    </label>
                                    <label className="block space-y-1 text-xs text-slate-600">
                                        Contraste
                                        <select
                                            value={blockAppearance.contrast}
                                            onChange={(event) =>
                                                updateAppearance(
                                                    'contrast',
                                                    event.target.value,
                                                )
                                            }
                                            className="h-9 w-full rounded-md border border-slate-200 bg-white px-2"
                                        >
                                            <option value="auto">
                                                Automático
                                            </option>
                                            <option value="light">
                                                Texto claro
                                            </option>
                                            <option value="dark">
                                                Texto oscuro
                                            </option>
                                        </select>
                                    </label>
                                    <label className="block space-y-1 text-xs text-slate-600">
                                        Alineación
                                        <select
                                            value={blockAppearance.alignment}
                                            onChange={(event) =>
                                                updateAppearance(
                                                    'alignment',
                                                    event.target.value,
                                                )
                                            }
                                            className="h-9 w-full rounded-md border border-slate-200 bg-white px-2"
                                        >
                                            <option value="left">
                                                Izquierda
                                            </option>
                                            <option value="center">
                                                Centro
                                            </option>
                                            <option value="right">
                                                Derecha
                                            </option>
                                        </select>
                                    </label>
                                    <label className="block space-y-1 text-xs text-slate-600">
                                        Anchura
                                        <select
                                            value={
                                                blockAppearance.content_width
                                            }
                                            onChange={(event) =>
                                                updateAppearance(
                                                    'content_width',
                                                    event.target.value,
                                                )
                                            }
                                            className="h-9 w-full rounded-md border border-slate-200 bg-white px-2"
                                        >
                                            <option value="narrow">
                                                Estrecha
                                            </option>
                                            <option value="standard">
                                                Estándar
                                            </option>
                                            <option value="wide">Amplia</option>
                                            <option value="full">
                                                Completa
                                            </option>
                                        </select>
                                    </label>
                                    <label className="block space-y-1 text-xs text-slate-600">
                                        Recurso gráfico
                                        <select
                                            value={blockAppearance.graphic}
                                            onChange={(event) =>
                                                updateAppearance(
                                                    'graphic',
                                                    event.target.value,
                                                )
                                            }
                                            className="h-9 w-full rounded-md border border-slate-200 bg-white px-2"
                                        >
                                            <option value="none">
                                                Ninguno
                                            </option>
                                            <option value="grid">
                                                Retícula
                                            </option>
                                            <option value="lines">
                                                Líneas
                                            </option>
                                            <option value="orbital">
                                                Órbitas
                                            </option>
                                        </select>
                                    </label>
                                </div>
                                <label className="mb-4 block space-y-1.5 text-xs font-medium text-slate-600">
                                    Etiqueta de navegación
                                    <input
                                        value={block.nav_label ?? ''}
                                        onChange={(event) =>
                                            setBlock(block.id, {
                                                nav_label: event.target.value,
                                            })
                                        }
                                        className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
                                    />
                                </label>
                                <div className="space-y-3">
                                    {(blockTypes[block.type]?.fields ?? []).map(
                                        (key) => {
                                            const value =
                                                block.content[key] ??
                                                blockTypes[block.type]
                                                    ?.defaults[key] ??
                                                '';
                                            return Array.isArray(value) ? (
                                                <div key={key}>
                                                    {collectionField(
                                                        key,
                                                        value,
                                                    )}
                                                </div>
                                            ) : (
                                                <label
                                                    key={key}
                                                    className="block space-y-1.5 text-xs font-medium text-slate-600"
                                                >
                                                    {labels[key] ?? key}
                                                    {field(key, value)}
                                                </label>
                                            );
                                        },
                                    )}
                                </div>
                                {(block.type === 'image' ||
                                    block.type === 'gallery') && (
                                    <div className="mt-4">
                                        <input
                                            ref={imageInput}
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            className="sr-only"
                                            onChange={(event) =>
                                                void uploadAsset(
                                                    event.target.files?.[0],
                                                )
                                            }
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full"
                                            disabled={!page.id || uploading}
                                            onClick={() =>
                                                imageInput.current?.click()
                                            }
                                        >
                                            {uploading
                                                ? 'Subiendo…'
                                                : 'Subir imagen'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="mt-2 w-full"
                                            onClick={openMediaPicker}
                                        >
                                            <Images className="mr-2 size-4" />
                                            Elegir de la biblioteca
                                        </Button>
                                        {mediaPickerOpen && (
                                            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                                                <label className="relative block">
                                                    <span className="sr-only">
                                                        Buscar imágenes
                                                    </span>
                                                    <Search className="absolute top-2.5 left-2.5 size-4 text-slate-400" />
                                                    <input
                                                        value={mediaSearch}
                                                        onChange={(event) =>
                                                            setMediaSearch(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        onKeyDown={(event) => {
                                                            if (
                                                                event.key ===
                                                                'Enter'
                                                            ) {
                                                                event.preventDefault();
                                                                void loadMedia();
                                                            }
                                                        }}
                                                        placeholder="Buscar imágenes"
                                                        className="h-9 w-full rounded-md border border-slate-200 bg-white pr-2 pl-8 text-sm"
                                                    />
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        void loadMedia()
                                                    }
                                                    className="mt-1 text-xs font-medium text-teal-800 underline"
                                                >
                                                    Buscar
                                                </button>
                                                <div className="mt-2 grid max-h-64 grid-cols-2 gap-2 overflow-y-auto">
                                                    {mediaAssets.map(
                                                        (asset) => (
                                                            <button
                                                                key={asset.id}
                                                                type="button"
                                                                onClick={() =>
                                                                    chooseMedia(
                                                                        asset,
                                                                    )
                                                                }
                                                                className="overflow-hidden rounded-md border border-slate-200 bg-white text-left focus-visible:outline-2 focus-visible:outline-teal-700"
                                                            >
                                                                <img
                                                                    src={
                                                                        asset.url
                                                                    }
                                                                    alt=""
                                                                    className="aspect-[4/3] w-full object-cover"
                                                                />
                                                                <span className="block truncate px-2 py-1 text-xs">
                                                                    {asset.alt_text ||
                                                                        asset.original_name}
                                                                </span>
                                                            </button>
                                                        ),
                                                    )}
                                                </div>
                                                {!mediaAssets.length && (
                                                    <p className="py-3 text-center text-xs text-slate-500">
                                                        No hay imágenes. Sube
                                                        una para empezar.
                                                    </p>
                                                )}
                                                <a
                                                    href="/admin/media"
                                                    className="mt-3 inline-block text-xs font-medium text-teal-800 underline"
                                                >
                                                    Administrar biblioteca y
                                                    textos alternativos
                                                </a>
                                            </div>
                                        )}
                                        {!page.id && (
                                            <p className="mt-2 text-xs text-slate-500">
                                                Guarda el borrador para poder
                                                subir imágenes.
                                            </p>
                                        )}
                                        {uploadError && (
                                            <p
                                                role="alert"
                                                className="mt-2 text-xs text-red-600"
                                            >
                                                {uploadError}
                                            </p>
                                        )}
                                    </div>
                                )}
                                <Button
                                    variant="outline"
                                    className="mt-4 w-full"
                                    onClick={() => duplicateBlock(block.id)}
                                >
                                    <Copy className="mr-2 size-4" />
                                    Duplicar bloque
                                </Button>
                                <Button
                                    variant="outline"
                                    className="mt-2 w-full"
                                    onClick={() => removeBlock(block.id)}
                                >
                                    <Trash2 className="mr-2 size-4 text-red-600" />
                                    Eliminar bloque
                                </Button>
                            </>
                        ) : (
                            <p className="text-sm text-slate-500">
                                Selecciona un bloque para editar sus
                                propiedades.
                            </p>
                        )}
                    </section>
                    {page.id && (
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                                if (
                                    window.confirm(
                                        '¿Retirar esta página de la publicación?',
                                    )
                                )
                                    router.post(
                                        `/admin/pages/${page.id}/unpublish`,
                                    );
                            }}
                            disabled={page.status !== 'published'}
                        >
                            <ArrowDown className="mr-2 size-4" />
                            Retirar publicación
                        </Button>
                    )}
                </aside>
            </div>
        </>
    );
}
