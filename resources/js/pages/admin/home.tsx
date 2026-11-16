import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowUpRight, Eye, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type EditableSection = { id: number; key: 'hero' | 'projects' | 'experience' | 'about' | 'stack' | 'contact'; type: string; navLabel: string | null; position: number; visible: boolean; variant: string; content: { eyebrow?: string; headline?: string; title?: string; description?: string } };
type Editor = { page: { title: string; status: 'draft' | 'published' }; profileSummary: string; sections: EditableSection[] };
type Props = { editor: Editor };
const names: Record<EditableSection['key'], string> = { hero: 'Hero', projects: 'Proyectos destacados', experience: 'Experiencia', about: 'Sobre mí', stack: 'Stack tecnológico', contact: 'Contacto' };
const labels: Partial<Record<EditableSection['key'], (keyof EditableSection['content'])[]>> = { hero: ['headline'], projects: ['eyebrow', 'title', 'description'], experience: ['eyebrow', 'title', 'description'], about: ['eyebrow', 'title'], stack: ['eyebrow', 'title', 'description'], contact: ['eyebrow', 'title', 'description'] };
const fieldNames = { eyebrow: 'Antetítulo', headline: 'Titular principal', title: 'Título', description: 'Descripción' };

export default function HomeEditor({ editor }: Props) {
    const form = useForm({ title: editor.page.title, status: editor.page.status, profileSummary: editor.profileSummary, sections: editor.sections });
    const updateSection = (index: number, patch: Partial<EditableSection>) => form.setData('sections', form.data.sections.map((section, i) => i === index ? { ...section, ...patch } : section));
    const updateContent = (index: number, key: keyof EditableSection['content'], value: string) => {
        const section = form.data.sections[index];
        if (section) updateSection(index, { content: { ...section.content, [key]: value } });
    };
    const error = (name: string) => form.errors[name as keyof typeof form.errors];

    return <>
        <Head title="Página de inicio · Administración" />
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-sm font-medium text-teal-700">Contenido</p><h1 className="text-3xl font-semibold tracking-tight">Página de inicio</h1><p className="mt-2 text-sm text-slate-500">Edita textos, orden y visibilidad de las secciones.</p></div><Button asChild variant="outline"><Link href="/" className="gap-2"><Eye className="size-4" /> Vista pública <ArrowUpRight className="size-4" /></Link></Button></div>
        <form onSubmit={(event) => { event.preventDefault(); form.put('/admin/home'); }} className="space-y-6">
            <Card className="border-slate-200 shadow-none"><CardHeader><CardTitle>Publicación</CardTitle><CardDescription>Define el nombre interno y el estado de esta página.</CardDescription></CardHeader><CardContent className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="page-title">Título interno</Label><Input id="page-title" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} aria-invalid={Boolean(error('title'))} />{error('title') && <p className="text-sm text-red-600">{error('title')}</p>}</div>
                <div className="space-y-2"><Label htmlFor="page-status">Estado</Label><select id="page-status" className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={form.data.status} onChange={(e) => form.setData('status', e.target.value as 'draft' | 'published')}><option value="published">Publicada</option><option value="draft">Borrador</option></select>{error('status') && <p className="text-sm text-red-600">{error('status')}</p>}</div>
                <div className="space-y-2 sm:col-span-2"><Label htmlFor="profile-summary">Descripción breve del Hero</Label><Textarea id="profile-summary" value={form.data.profileSummary} onChange={(e) => form.setData('profileSummary', e.target.value)} />{error('profileSummary') && <p className="text-sm text-red-600">{error('profileSummary')}</p>}</div>
            </CardContent></Card>
            <div><h2 className="mb-3 text-xl font-semibold tracking-tight">Secciones</h2><p className="mb-5 text-sm text-slate-500">Ajusta su orden con posiciones numéricas; valores menores aparecen antes.</p><div className="space-y-4">{form.data.sections.map((section, index) => <Card key={section.id} className="border-slate-200 shadow-none"><CardHeader className="flex-row items-start justify-between"><div><CardTitle className="text-base">{names[section.key]}</CardTitle><CardDescription className="mt-1">Tipo de bloque: {section.type} · Variante: {section.variant}</CardDescription></div><label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={section.visible} onChange={(e) => updateSection(index, { visible: e.target.checked })} className="size-4 accent-teal-700" />Visible</label></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">
                    {section.key !== 'hero' && <div className="space-y-2"><Label htmlFor={`nav-${section.key}`}>Texto de navegación</Label><Input id={`nav-${section.key}`} value={section.navLabel ?? ''} onChange={(e) => updateSection(index, { navLabel: e.target.value || null })} /></div>}
                    <div className="space-y-2"><Label htmlFor={`position-${section.key}`}>Posición</Label><Input id={`position-${section.key}`} type="number" min="0" max="1000" value={section.position} onChange={(e) => updateSection(index, { position: Number(e.target.value) })} /></div>
                    {(labels[section.key] ?? []).map((key) => <div key={key} className="space-y-2 sm:col-span-2"><Label htmlFor={`${section.key}-${key}`}>{fieldNames[key]}</Label>{key === 'description' ? <Textarea id={`${section.key}-${key}`} value={section.content[key] ?? ''} onChange={(e) => updateContent(index, key, e.target.value)} /> : <Input id={`${section.key}-${key}`} value={section.content[key] ?? ''} onChange={(e) => updateContent(index, key, e.target.value)} />}{error(`sections.${index}.content.${key}`) && <p className="text-sm text-red-600">{error(`sections.${index}.content.${key}`)}</p>}</div>)}
                </CardContent></Card>)}</div>{error('sections') && <p className="mt-3 text-sm text-red-600">{error('sections')}</p>}</div>
            <div className="sticky bottom-3 flex justify-end"><Button type="submit" disabled={form.processing} className="gap-2 shadow-md"><Save className="size-4" />{form.processing ? 'Guardando…' : 'Guardar cambios'}</Button></div>
        </form>
    </>;
}
