import { Head, useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Settings = { site_title: string; default_meta_description: string; locale: string; timezone: string; footer_note: string | null };
type Props = { settings: Settings };

export default function PortfolioSettings({ settings }: Props) {
    const form = useForm({ site_title: settings.site_title, default_meta_description: settings.default_meta_description, locale: settings.locale, timezone: settings.timezone, footer_note: settings.footer_note ?? '' });
    const error = (name: keyof typeof form.data) => form.errors[name];
    return <>
        <Head title="Configuración · Administración" />
        <div className="mb-8"><p className="mb-2 text-sm font-medium text-teal-700">Sistema</p><h1 className="text-3xl font-semibold tracking-tight">Configuración general</h1><p className="mt-2 text-sm text-slate-500">Preferencias básicas y metadatos de la web pública.</p></div>
        <form onSubmit={(event) => { event.preventDefault(); form.put('/admin/settings'); }} className="space-y-6">
            <Card className="border-slate-200 shadow-none"><CardHeader><CardTitle>Identidad del sitio</CardTitle><CardDescription>Ajustes globales que se usan en el título, metadatos e idioma.</CardDescription></CardHeader><CardContent className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="site_title">Título del sitio</Label><Input id="site_title" value={form.data.site_title} onChange={(e) => form.setData('site_title', e.target.value)} />{error('site_title') && <p className="text-sm text-red-600">{error('site_title')}</p>}</div>
                <div className="space-y-2"><Label htmlFor="locale">Idioma (locale)</Label><Input id="locale" placeholder="es o es-ES" value={form.data.locale} onChange={(e) => form.setData('locale', e.target.value)} />{error('locale') && <p className="text-sm text-red-600">{error('locale')}</p>}</div>
                <div className="space-y-2"><Label htmlFor="timezone">Zona horaria</Label><Input id="timezone" placeholder="Europe/Madrid" value={form.data.timezone} onChange={(e) => form.setData('timezone', e.target.value)} />{error('timezone') && <p className="text-sm text-red-600">{error('timezone')}</p>}</div>
                <div className="space-y-2 sm:col-span-2"><Label htmlFor="default_meta_description">Descripción para buscadores</Label><Textarea id="default_meta_description" value={form.data.default_meta_description} onChange={(e) => form.setData('default_meta_description', e.target.value)} />{error('default_meta_description') && <p className="text-sm text-red-600">{error('default_meta_description')}</p>}</div>
                <div className="space-y-2 sm:col-span-2"><Label htmlFor="footer_note">Nota del pie de página</Label><Input id="footer_note" value={form.data.footer_note} onChange={(e) => form.setData('footer_note', e.target.value)} />{error('footer_note') && <p className="text-sm text-red-600">{error('footer_note')}</p>}</div>
            </CardContent></Card>
            <div className="flex justify-end"><Button type="submit" disabled={form.processing} className="gap-2"><Save className="size-4" />{form.processing ? 'Guardando…' : 'Guardar configuración'}</Button></div>
        </form>
    </>;
}
