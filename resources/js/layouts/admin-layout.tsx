import type { PropsWithChildren } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, LayoutDashboard, Settings2, UserRound, PanelsTopLeft, BriefcaseBusiness, Tags, Files } from 'lucide-react';
import { useFlashToast } from '@/hooks/use-flash-toast';

const items = [
    { href: '/admin', label: 'Resumen', icon: LayoutDashboard },
    { href: '/admin/pages', label: 'Páginas', icon: Files },
    { href: '/admin/projects', label: 'Proyectos', icon: BriefcaseBusiness },
    { href: '/admin/technologies', label: 'Tecnologías', icon: Tags },
    { href: '/admin/profile', label: 'Perfil profesional', icon: UserRound },
    { href: '/admin/settings', label: 'Configuración', icon: Settings2 },
];

export default function AdminLayout({ children }: PropsWithChildren) {
    const { url } = usePage();
    useFlashToast();

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 lg:grid lg:grid-cols-[250px_1fr]">
            <aside className="border-b border-slate-200 bg-white lg:min-h-screen lg:border-r lg:border-b-0">
                <div className="flex h-16 items-center justify-between px-5 lg:h-20 lg:px-6">
                    <Link href="/admin" className="text-lg font-semibold tracking-tight">ivanmartinez<span className="text-teal-700">.dev</span><span className="ml-2 text-xs font-medium text-slate-400">CMS</span></Link>
                    <Link href="/" className="text-xs text-slate-500 hover:text-slate-900 lg:hidden">Ver sitio</Link>
                </div>
                <nav aria-label="Administración" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3 lg:py-4">
                    {items.map(({ href, label, icon: Icon }) => {
                        const active = href === '/admin' ? url === '/admin' : url.startsWith(href);
                        return <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${active ? 'bg-slate-100 text-slate-950' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}><Icon aria-hidden="true" className="size-4" />{label}</Link>;
                    })}
                </nav>
                <div className="hidden px-6 py-6 lg:block">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900">Abrir web pública <ArrowUpRight aria-hidden="true" className="size-4" /></Link>
                    <p className="mt-8 text-xs leading-5 text-slate-400">Panel privado de gestión del contenido de ivanmartinez.dev.</p>
                </div>
            </aside>
            <div className="min-w-0">
                <header className="hidden h-16 items-center justify-between border-b border-slate-200 bg-white px-8 lg:flex">
                    <p className="text-sm text-slate-500">Administración <span className="px-2 text-slate-300">/</span><span className="text-slate-800">{items.find((item) => item.href === '/admin' ? url === item.href : url.startsWith(item.href))?.label ?? 'Panel'}</span></p>
                    <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">Ver sitio público</Link>
                </header>
                <main id="admin-main" className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 lg:px-10 lg:py-10">{children}</main>
            </div>
        </div>
    );
}
