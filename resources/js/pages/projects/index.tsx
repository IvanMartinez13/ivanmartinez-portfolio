import { Head, Link } from '@inertiajs/react';
import { Container } from '@/components/public/container';
import { ProjectCard } from '@/components/public/project-card';
import { Button } from '@/components/ui/button';
import PublicLayout from '@/layouts/public-layout';
import type { PortfolioProject, PublicChromeContent } from '@/types/portfolio';

type Props = {
    projects: {
        data: PortfolioProject[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    categories: string[];
    technologies: { name: string; slug: string; category: string }[];
    filters: { category?: string; technology?: string };
    portfolio: PublicChromeContent;
};

export default function ProjectsIndex({
    projects,
    categories,
    technologies,
    filters,
    portfolio,
}: Props) {
    return (
        <PublicLayout portfolio={portfolio}>
            <Head title="Proyectos · ivanmartinez.dev">
                <meta
                    name="description"
                    content="Proyectos y casos de estudio de Iván Martínez."
                />
            </Head>
            <main id="main-content">
                <section className="border-b border-line bg-surface">
                    <Container className="py-16 sm:py-20 lg:py-24">
                        <p className="mb-4 text-xs font-semibold tracking-[0.16em] text-portfolio-accent uppercase">
                            Portfolio
                        </p>
                        <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.055em] text-portfolio-ink sm:text-5xl">
                            Proyectos y casos de estudio
                        </h1>
                        <p className="mt-5 max-w-2xl text-base leading-7 text-portfolio-muted">
                            Una selección de proyectos publicados, con
                            información sobre el contexto, el trabajo realizado
                            y las decisiones técnicas.
                        </p>
                    </Container>
                </section>
                <section className="py-12 sm:py-16">
                    <Container>
                        <form
                            action="/projects"
                            method="get"
                            className="mb-8 grid gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
                        >
                            <div className="space-y-2">
                                <label
                                    htmlFor="category"
                                    className="text-sm font-medium text-portfolio-ink"
                                >
                                    Categoría
                                </label>
                                <select
                                    id="category"
                                    name="category"
                                    defaultValue={filters.category ?? ''}
                                    className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm"
                                >
                                    <option value="">
                                        Todas las categorías
                                    </option>
                                    {categories.map((category) => (
                                        <option key={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label
                                    htmlFor="technology"
                                    className="text-sm font-medium text-portfolio-ink"
                                >
                                    Tecnología
                                </label>
                                <select
                                    id="technology"
                                    name="technology"
                                    defaultValue={filters.technology ?? ''}
                                    className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm"
                                >
                                    <option value="">
                                        Todas las tecnologías
                                    </option>
                                    {technologies.map((technology) => (
                                        <option
                                            key={technology.slug}
                                            value={technology.slug}
                                        >
                                            {technology.name} ·{' '}
                                            {technology.category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit">Filtrar</Button>
                                <Button asChild variant="outline">
                                    <Link href="/projects">Limpiar</Link>
                                </Button>
                            </div>
                        </form>
                        {projects.data.length > 0 ? (
                            <>
                                <p className="mb-5 text-sm text-portfolio-muted">
                                    {projects.total}{' '}
                                    {projects.total === 1
                                        ? 'proyecto publicado'
                                        : 'proyectos publicados'}
                                </p>
                                <div className="grid gap-4 sm:grid-cols-2 lg:gap-5">
                                    {projects.data.map((project, index) => (
                                        <ProjectCard
                                            key={project.slug}
                                            project={project}
                                            index={index}
                                        />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-16 text-center">
                                <h2 className="text-xl font-semibold text-portfolio-ink">
                                    Aún no hay proyectos publicados con estos
                                    filtros
                                </h2>
                                <p className="mt-2 text-sm text-portfolio-muted">
                                    Los proyectos aparecerán aquí cuando sus
                                    fichas estén revisadas y publicadas.
                                </p>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="mt-5"
                                >
                                    <Link href="/projects">Ver todos</Link>
                                </Button>
                            </div>
                        )}
                    </Container>
                </section>
            </main>
        </PublicLayout>
    );
}
