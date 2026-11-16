import { Head, useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Profile = { public_name: string; headline: string; specialty: string; short_description: string; biography: string; location: string | null; availability_label: string; experience_years: string | number | null; contact_email: string | null; photo_url: string | null; links: Record<string, string> | null };
type Props = { profile: Profile };

export default function ProfessionalProfile({ profile }: Props) {
    const form = useForm({ public_name: profile.public_name, headline: profile.headline, specialty: profile.specialty, short_description: profile.short_description, biography: profile.biography, location: profile.location ?? '', availability_label: profile.availability_label, experience_years: profile.experience_years === null ? '' : String(profile.experience_years), contact_email: profile.contact_email ?? '', photo_url: profile.photo_url ?? '', links: { linkedin: profile.links?.linkedin ?? '', github: profile.links?.github ?? '', website: profile.links?.website ?? '', cv: profile.links?.cv ?? '' } });
    const fields = [
        ['public_name', 'Nombre público', 'text'], ['headline', 'Titular profesional', 'text'], ['specialty', 'Especialidad', 'text'], ['location', 'Ubicación', 'text'], ['availability_label', 'Disponibilidad', 'text'], ['experience_years', 'Años de experiencia (aproximados)', 'number'], ['contact_email', 'Email de contacto', 'email'], ['photo_url', 'URL de fotografía', 'url'],
    ] as const;
    const error = (name: string) => form.errors[name as keyof typeof form.errors];

    return <>
        <Head title="Perfil profesional · Administración" />
        <div className="mb-8"><p className="mb-2 text-sm font-medium text-teal-700">Contenido</p><h1 className="text-3xl font-semibold tracking-tight">Perfil profesional</h1><p className="mt-2 text-sm text-slate-500">Los datos de identidad, presentación y contacto que se muestran en la web.</p></div>
        <form onSubmit={(event) => { event.preventDefault(); form.put('/admin/profile'); }} className="space-y-6">
            <Card className="border-slate-200 shadow-none"><CardHeader><CardTitle>Presentación</CardTitle><CardDescription>Información que alimenta el Hero y la sección Sobre mí.</CardDescription></CardHeader><CardContent className="grid gap-5 sm:grid-cols-2">
                {fields.map(([key, label, type]) => <div key={key} className="space-y-2"><Label htmlFor={key}>{label}</Label><Input id={key} type={type} min={type === 'number' ? '0' : undefined} step={type === 'number' ? '0.1' : undefined} value={form.data[key]} onChange={(e) => form.setData(key, e.target.value)} aria-invalid={Boolean(error(key))} />{error(key) && <p className="text-sm text-red-600">{error(key)}</p>}</div>)}
                <div className="space-y-2 sm:col-span-2"><Label htmlFor="short_description">Descripción breve del Hero</Label><Textarea id="short_description" value={form.data.short_description} onChange={(e) => form.setData('short_description', e.target.value)} />{error('short_description') && <p className="text-sm text-red-600">{error('short_description')}</p>}</div>
                <div className="space-y-2 sm:col-span-2"><Label htmlFor="biography">Biografía</Label><Textarea id="biography" className="min-h-48" value={form.data.biography} onChange={(e) => form.setData('biography', e.target.value)} /><p className="text-xs text-slate-500">Separa los párrafos con una línea en blanco.</p>{error('biography') && <p className="text-sm text-red-600">{error('biography')}</p>}</div>
            </CardContent></Card>
            <Card className="border-slate-200 shadow-none"><CardHeader><CardTitle>Enlaces profesionales</CardTitle><CardDescription>Los campos vacíos se omiten en la web pública.</CardDescription></CardHeader><CardContent className="grid gap-5 sm:grid-cols-2">
                {(['linkedin', 'github', 'website', 'cv'] as const).map((key) => <div key={key} className="space-y-2"><Label htmlFor={`link-${key}`}>{key === 'cv' ? 'CV' : key[0]?.toUpperCase() + key.slice(1)}</Label><Input id={`link-${key}`} type="url" placeholder="https://" value={form.data.links[key]} onChange={(e) => form.setData('links', { ...form.data.links, [key]: e.target.value })} />{error(`links.${key}`) && <p className="text-sm text-red-600">{error(`links.${key}`)}</p>}</div>)}
            </CardContent></Card>
            <div className="flex justify-end"><Button type="submit" disabled={form.processing} className="gap-2"><Save className="size-4" />{form.processing ? 'Guardando…' : 'Guardar perfil'}</Button></div>
        </form>
    </>;
}
