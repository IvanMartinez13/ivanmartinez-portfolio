import { Head, Link, router, useForm } from '@inertiajs/react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Technology = { id: number; name: string; slug: string; category: string; icon: string | null; position: number; is_visible: boolean; projects_count: number };
type Form = Omit<Technology, 'projects_count'>;
type Props = { technologies: Technology[]; selected: Form | null };

function emptyForm(): Form { return { id: 0, name: '', slug: '', category: '', icon: '', position: 10, is_visible: true }; }
function slugify(value: string): string { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

export default function TechnologiesIndex({ technologies, selected }: Props) {
    const form = useForm<Form>(selected ?? emptyForm());
    const [slugEdited, setSlugEdited] = useState(Boolean(selected?.slug));
    useEffect(() => { form.setData(selected ?? emptyForm()); setSlugEdited(Boolean(selected?.slug)); }, [selected]);
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (form.data.id) form.put(`/admin/technologies/${form.data.id}`);
        else form.post('/admin/technologies');
    };
    const destroy = (technology: Technology) => {
        if (window.confirm(`¿Eliminar “${technology.name}” del catálogo? Se quitará de los proyectos que la tengan asignada.`)) router.delete(`/admin/technologies/${technology.id}`);
    };

    return <>
        <Head title="Tecnologías · Administración" />
        <div className="mb-8"><p className="mb-2 text-sm font-medium text-teal-700">Catálogo</p><h1 className="text-3xl font-semibold tracking-tight">Tecnologías</h1><p className="mt-2 text-sm text-slate-500">Gestiona las etiquetas reutilizables que se asignan a los proyectos.</p></div>
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <Card className="border-slate-200 shadow-none"><CardHeader><CardTitle>Catálogo disponible</CardTitle><CardDescription>{technologies.length} tecnologías registradas.</CardDescription></CardHeader><CardContent className="space-y-2">{technologies.map((technology) => <div key={technology.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3"><div className="min-w-0"><p className="font-medium">{technology.name}<span className="ml-2 text-xs font-normal text-slate-400">{technology.category}</span></p><p className="mt-1 text-xs text-slate-400">/{technology.slug} · {technology.projects_count} proyectos</p></div><div className="flex items-center gap-2">{!technology.is_visible && <Badge variant="outline">Oculta</Badge>}<Button asChild size="sm" variant="outline"><Link href={`/admin/technologies?edit=${technology.id}`}>Editar</Link></Button><Button type="button" size="icon" variant="ghost" aria-label={`Eliminar ${technology.name}`} onClick={() => destroy(technology)}><Trash2 className="size-4 text-red-600" /></Button></div></div>)}{technologies.length === 0 && <p className="py-10 text-center text-sm text-slate-500">Aún no hay tecnologías en el catálogo.</p>}</CardContent></Card>
            <Card className="border-slate-200 shadow-none"><CardHeader><CardTitle>{form.data.id ? 'Editar tecnología' : 'Añadir tecnología'}</CardTitle><CardDescription>Icono opcional como identificador de texto; no se ejecuta ni se interpreta como HTML.</CardDescription></CardHeader><CardContent><form onSubmit={submit} className="space-y-4">
                <div className="space-y-2"><Label htmlFor="tech-name">Nombre *</Label><Input id="tech-name" required value={form.data.name} onChange={(e) => { const name = e.target.value; form.setData((data) => ({ ...data, name, ...(!slugEdited ? { slug: slugify(name) } : {}) })); }} />{form.errors.name && <p className="text-sm text-red-600">{form.errors.name}</p>}</div>
                <div className="space-y-2"><Label htmlFor="tech-slug">Slug *</Label><Input id="tech-slug" required value={form.data.slug} onChange={(e) => { setSlugEdited(true); form.setData('slug', slugify(e.target.value)); }} />{form.errors.slug && <p className="text-sm text-red-600">{form.errors.slug}</p>}</div>
                <div className="space-y-2"><Label htmlFor="tech-category">Categoría *</Label><Input id="tech-category" required value={form.data.category} onChange={(e) => form.setData('category', e.target.value)} />{form.errors.category && <p className="text-sm text-red-600">{form.errors.category}</p>}</div>
                <div className="space-y-2"><Label htmlFor="tech-icon">Icono (opcional)</Label><Input id="tech-icon" value={form.data.icon ?? ''} onChange={(e) => form.setData('icon', e.target.value)} placeholder="p. ej. react" /></div>
                <div className="space-y-2"><Label htmlFor="tech-position">Orden</Label><Input id="tech-position" type="number" min="0" max="1000" value={form.data.position} onChange={(e) => form.setData('position', Number(e.target.value))} /></div>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.data.is_visible} onChange={(e) => form.setData('is_visible', e.target.checked)} className="size-4 accent-teal-700" />Visible para visitantes</label>
                <div className="flex gap-2"><Button type="submit" disabled={form.processing} className="gap-2"><Save className="size-4" />{form.data.id ? 'Guardar' : 'Añadir'}</Button>{form.data.id && <Button asChild type="button" variant="outline"><Link href="/admin/technologies"><Plus className="mr-1 size-4" />Nueva</Link></Button>}</div>
            </form></CardContent></Card>
        </div>
    </>;
}
