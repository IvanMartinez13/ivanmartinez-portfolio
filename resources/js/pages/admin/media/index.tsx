import { Head, router } from '@inertiajs/react';
import { ImagePlus, Search, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

type Asset = {
    id: number;
    url: string;
    original_name: string;
    alt_text: string;
    size: number;
    references: number;
};
type Props = {
    assets: {
        data: Asset[];
        current_page: number;
        last_page: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
};

function csrfHeaders(): Record<string, string> {
    const token = document.cookie
        .split('; ')
        .find((cookie) => cookie.startsWith('XSRF-TOKEN='))
        ?.split('=')
        .slice(1)
        .join('=');
    return {
        Accept: 'application/json',
        ...(token ? { 'X-XSRF-TOKEN': decodeURIComponent(token) } : {}),
    };
}

export default function MediaLibrary({ assets }: Props) {
    const input = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState(
        new URLSearchParams(window.location.search).get('q') ?? '',
    );
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const upload = async (file?: File) => {
        if (!file) return;
        const body = new FormData();
        body.append('image', file);
        setBusy(true);
        setError('');
        try {
            const response = await fetch('/admin/media', {
                method: 'POST',
                credentials: 'same-origin',
                headers: csrfHeaders(),
                body,
            });
            const result = (await response.json()) as { message?: string };
            if (!response.ok)
                throw new Error(
                    result.message ?? 'No se ha podido subir la imagen.',
                );
            router.reload({ only: ['assets'] });
        } catch (issue) {
            setError(
                issue instanceof Error
                    ? issue.message
                    : 'Error al subir la imagen.',
            );
        } finally {
            setBusy(false);
            if (input.current) input.current.value = '';
        }
    };
    const saveAlt = async (asset: Asset, value: string) => {
        const response = await fetch(`/admin/media/${asset.id}`, {
            method: 'PUT',
            credentials: 'same-origin',
            headers: { ...csrfHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ alt_text: value }),
        });
        if (!response.ok)
            setError('No se ha podido guardar el texto alternativo.');
        else router.reload({ only: ['assets'] });
    };
    const remove = async (asset: Asset) => {
        if (
            asset.references > 0 ||
            !window.confirm(`¿Eliminar ${asset.original_name}?`)
        )
            return;
        const response = await fetch(`/admin/media/${asset.id}`, {
            method: 'DELETE',
            credentials: 'same-origin',
            headers: csrfHeaders(),
        });
        const result = (await response.json()) as { message?: string };
        if (!response.ok)
            setError(result.message ?? 'No se ha podido eliminar la imagen.');
        else router.reload({ only: ['assets'] });
    };

    return (
        <>
            <Head title="Biblioteca multimedia" />
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Biblioteca multimedia
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Imágenes reutilizables para páginas y bloques.
                    </p>
                </div>
                <input
                    ref={input}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(event) => void upload(event.target.files?.[0])}
                />
                <Button
                    type="button"
                    disabled={busy}
                    onClick={() => input.current?.click()}
                >
                    <ImagePlus className="mr-2 size-4" />
                    {busy ? 'Subiendo…' : 'Subir imagen'}
                </Button>
            </div>
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    router.get('/admin/media', query ? { q: query } : {}, {
                        preserveState: true,
                    });
                }}
                className="mb-5 flex max-w-xl gap-2"
            >
                <label className="relative min-w-0 flex-1">
                    <span className="sr-only">Buscar archivos</span>
                    <Search className="absolute top-2.5 left-3 size-4 text-slate-400" />
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Buscar por nombre o texto alternativo"
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white pr-3 pl-9 text-sm"
                    />
                </label>
                <Button variant="outline" type="submit">
                    Buscar
                </Button>
            </form>
            {error && (
                <p
                    role="alert"
                    className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800"
                >
                    {error}
                </p>
            )}
            {assets.data.length ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {assets.data.map((asset) => (
                        <article
                            key={asset.id}
                            className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white"
                        >
                            <img
                                src={asset.url}
                                alt={asset.alt_text}
                                loading="lazy"
                                className="aspect-[16/10] w-full bg-slate-100 object-cover"
                            />
                            <div className="space-y-3 p-4">
                                <p
                                    className="truncate text-sm font-medium"
                                    title={asset.original_name}
                                >
                                    {asset.original_name}
                                </p>
                                <label className="block space-y-1 text-xs font-medium text-slate-600">
                                    Texto alternativo
                                    <input
                                        key={`${asset.id}-${asset.alt_text}`}
                                        defaultValue={asset.alt_text}
                                        maxLength={500}
                                        onBlur={(event) => {
                                            if (
                                                event.target.value !==
                                                asset.alt_text
                                            )
                                                void saveAlt(
                                                    asset,
                                                    event.target.value,
                                                );
                                        }}
                                        className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm font-normal text-slate-900"
                                    />
                                </label>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-xs text-slate-500">
                                        {asset.references} referencias
                                    </span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={asset.references > 0}
                                        onClick={() => void remove(asset)}
                                        title={
                                            asset.references
                                                ? 'Usada en contenido o revisiones guardadas'
                                                : 'Eliminar imagen'
                                        }
                                    >
                                        <Trash2 className="mr-1.5 size-4 text-red-700" />
                                        Eliminar
                                    </Button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
                    <ImagePlus className="mx-auto size-7 text-slate-400" />
                    <h2 className="mt-3 font-medium">Aún no hay imágenes</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Sube una imagen para reutilizarla en el editor de
                        páginas.
                    </p>
                </div>
            )}
            {assets.last_page > 1 && (
                <nav
                    aria-label="Páginas de la biblioteca"
                    className="mt-6 flex flex-wrap gap-2"
                >
                    {assets.links.map((link) => (
                        <button
                            key={link.label}
                            type="button"
                            disabled={!link.url}
                            onClick={() => link.url && router.visit(link.url)}
                            className={`min-h-10 rounded-md border px-3 text-sm ${link.active ? 'border-teal-700 bg-teal-50 text-teal-900' : 'border-slate-200 bg-white text-slate-700'} disabled:opacity-40`}
                        >
                            {link.label}
                        </button>
                    ))}
                </nav>
            )}
        </>
    );
}
