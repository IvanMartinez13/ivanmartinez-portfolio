import { ArrowUpRight } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { PortfolioProject } from '@/types/portfolio';
import { Badge } from '@/components/public/badge';
import { Card } from '@/components/public/card';

type Props = {
    project: PortfolioProject;
    index: number;
};

const visualPalette = ['#16243B', '#214E91', '#12645F', '#373B65'];

export function ProjectCard({ project, index }: Props) {
    const artStyle = {
        backgroundColor:
            project.visualColor || visualPalette[index % visualPalette.length],
    } as CSSProperties;

    return (
        <Card className="group flex min-h-full flex-col overflow-hidden border-transparent bg-white shadow-[var(--portfolio-shadow-soft)] transition-all duration-[var(--portfolio-transition)] hover:-translate-y-1 hover:shadow-xl">
            <a
                href={`/projects/${project.slug}`}
                className="flex min-h-full flex-col focus-visible:ring-2 focus-visible:ring-portfolio-accent focus-visible:outline-none focus-visible:ring-inset"
                aria-label={`Ver caso de estudio: ${project.name}`}
            >
                <div
                    className="project-art relative isolate flex aspect-[1.55] min-h-56 items-end justify-between overflow-hidden p-6 text-white sm:min-h-64 sm:p-8"
                    style={artStyle}
                >
                    {project.imageUrl ? (
                        <img
                            src={project.imageUrl}
                            alt={project.imageAlt ?? ''}
                            loading="lazy"
                            className="absolute inset-0 -z-10 size-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                        />
                    ) : (
                        <div
                            aria-hidden="true"
                            className={`project-geometry project-geometry-${index % 4} absolute inset-0 -z-10`}
                        />
                    )}
                    <span className="project-art-mark absolute top-1/2 left-1/2 -z-0 -translate-x-1/2 -translate-y-1/2 font-mono text-[clamp(7rem,18vw,14rem)] leading-none font-medium tracking-[-0.14em] text-white/90 select-none">
                        {project.monogram}
                    </span>
                    <span className="relative z-10 font-mono text-[0.68rem] font-semibold tracking-[0.19em] text-white/80 uppercase">
                        Selected work{' '}
                        <span className="text-teal-300">
                            / {String(index + 1).padStart(2, '0')}
                        </span>
                    </span>
                    <span
                        aria-hidden="true"
                        className="relative z-10 grid size-10 place-items-center rounded-full border border-white/40 bg-black/10 transition-transform duration-[var(--portfolio-transition)] group-hover:rotate-45"
                    >
                        <ArrowUpRight className="size-5" />
                    </span>
                </div>
                <div className="flex flex-1 flex-col p-6 sm:p-8">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                        <Badge>{project.category}</Badge>
                        {project.isFeatured && (
                            <span className="text-[0.65rem] font-semibold tracking-[0.13em] text-portfolio-accent uppercase">
                                Destacado
                            </span>
                        )}
                    </div>
                    <h3 className="flex items-start justify-between gap-4 text-xl font-semibold tracking-[-0.035em] text-portfolio-ink sm:text-2xl">
                        <span>{project.name}</span>
                        <ArrowUpRight
                            aria-hidden="true"
                            className="mt-1 size-5 shrink-0 text-portfolio-primary transition-transform duration-[var(--portfolio-transition)] group-hover:translate-x-1 group-hover:-translate-y-1"
                        />
                    </h3>
                    <p className="mt-3 max-w-lg text-sm leading-6 text-portfolio-muted">
                        {project.description}
                    </p>
                    {project.technologies.length > 0 && (
                        <p className="mt-auto pt-5 text-xs tracking-wide text-portfolio-muted">
                            {project.technologies.join(' · ')}
                        </p>
                    )}
                </div>
            </a>
        </Card>
    );
}
