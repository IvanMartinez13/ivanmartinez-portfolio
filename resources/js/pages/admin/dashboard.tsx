import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight, CheckCircle2, Circle, Eye, Layers3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Props = { summary: { pageTitle: string; pageStatus: 'draft' | 'published'; visibleSections: number; totalSections: number; updatedAt: string | null } };

export default function Dashboard({ summary }: Props) {
    return <>
        <Head title="Resumen · Administración" />
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><p className="mb-2 text-sm font-medium text-teal-700">Panel de control</p><h1 className="text-3xl font-semibold tracking-tight">Resumen</h1><p className="mt-2 text-sm text-slate-500">Gestiona y revisa el contenido de tu portfolio.</p></div>
            <Button asChild variant="outline"><Link href="/" className="gap-2">Ver web pública <ArrowUpRight className="size-4" /></Link></Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-slate-200 shadow-none"><CardHeader className="flex-row items-center justify-between"><CardTitle className="text-sm font-medium text-slate-500">Página de inicio</CardTitle><Eye className="size-4 text-slate-400" /></CardHeader><CardContent><p className="text-2xl font-semibold">{summary.pageTitle}</p><Badge className="mt-3" variant={summary.pageStatus === 'published' ? 'secondary' : 'outline'}>{summary.pageStatus === 'published' ? 'Publicada' : 'Borrador'}</Badge></CardContent></Card>
            <Card className="border-slate-200 shadow-none"><CardHeader className="flex-row items-center justify-between"><CardTitle className="text-sm font-medium text-slate-500">Secciones visibles</CardTitle><Layers3 className="size-4 text-slate-400" /></CardHeader><CardContent><p className="text-2xl font-semibold">{summary.visibleSections}<span className="text-base font-normal text-slate-400"> / {summary.totalSections}</span></p><p className="mt-3 text-sm text-slate-500">Controla su visibilidad desde el editor.</p></CardContent></Card>
            <Card className="border-slate-200 shadow-none"><CardHeader className="flex-row items-center justify-between"><CardTitle className="text-sm font-medium text-slate-500">Estado del contenido</CardTitle><CheckCircle2 className="size-4 text-teal-700" /></CardHeader><CardContent><p className="text-2xl font-semibold">Persistente</p><p className="mt-3 text-sm text-slate-500">Los cambios se guardan en PostgreSQL.</p></CardContent></Card>
        </div>
        <Card className="mt-7 border-slate-200 shadow-none"><CardHeader><CardTitle>Acciones rápidas</CardTitle><CardDescription>Continúa editando las áreas disponibles.</CardDescription></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2">
            <Link href="/admin/home" className="group flex items-center justify-between rounded-xl border border-slate-200 p-4 transition-colors hover:border-slate-300 hover:bg-slate-50"><span><span className="block font-medium">Editar página de inicio</span><span className="mt-1 block text-sm text-slate-500">Textos, orden y visibilidad.</span></span><ArrowUpRight className="size-4 text-slate-400 group-hover:text-slate-800" /></Link>
            <Link href="/admin/profile" className="group flex items-center justify-between rounded-xl border border-slate-200 p-4 transition-colors hover:border-slate-300 hover:bg-slate-50"><span><span className="block font-medium">Actualizar perfil profesional</span><span className="mt-1 block text-sm text-slate-500">Biografía y enlaces públicos.</span></span><ArrowUpRight className="size-4 text-slate-400 group-hover:text-slate-800" /></Link>
            <p className="flex items-center gap-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-500 sm:col-span-2"><Circle className="size-3 fill-slate-300 text-slate-300" /> Gestor de proyectos y constructor de páginas: pendiente para una fase posterior.</p>
        </CardContent></Card>
    </>;
}
