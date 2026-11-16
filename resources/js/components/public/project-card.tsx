import type { PortfolioProject } from '@/types/portfolio';
import { Badge } from '@/components/public/badge';
import { Card } from '@/components/public/card';

type Props = {
    project: PortfolioProject;
    index: number;
};

export function ProjectCard({ project, index }: Props) {
    return (
        <Card className="flex min-h-full flex-col overflow-hidden transition-colors hover:border-portfolio-primary/30">
            <a href={`/projects/${project.slug}`} className="group flex min-h-full flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-portfolio-accent" aria-label={`Ver caso de estudio: ${project.name}`}>
            <div className="relative flex min-h-52 items-end justify-between overflow-hidden border-b border-line bg-portfolio-tint p-6 sm:min-h-60 sm:p-8">
                {project.imageUrl ? <img src={project.imageUrl} alt={project.imageAlt ?? ''} loading="lazy" className="absolute inset-0 size-full object-cover" /> : null}
                {project.imageUrl ? <span className="absolute inset-0 bg-slate-950/20" aria-hidden="true" /> : null}
                <span
                    aria-hidden="true"
                    className={`absolute -top-10 -right-2 font-mono text-[clamp(8rem,22vw,15rem)] leading-none font-medium tracking-[-0.12em] select-none ${project.imageUrl ? 'text-white/30' : 'text-portfolio-primary/[0.055]'}`}
                >
                    {project.monogram}
                </span>
                <span className="relative z-10 font-mono text-xs tracking-[0.18em] text-portfolio-muted">
                    PROYECTO · {String(index + 1).padStart(2, '0')}
                </span>
                <span
                    className="relative z-10 size-2 rounded-full bg-portfolio-accent-soft"
                    aria-hidden="true"
                />
            </div>
            <div className="flex flex-1 flex-col p-6 sm:p-8">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    <Badge>{project.category}</Badge>
                    {project.isFeatured && <Badge className="border-portfolio-accent/20 bg-portfolio-accent/[0.06] text-portfolio-accent">Destacado</Badge>}
                </div>
                <h3 className="text-xl font-semibold tracking-[-0.03em] text-portfolio-ink transition-colors group-hover:text-portfolio-primary sm:text-2xl">
                    {project.name}
                </h3>
                <p className="mt-3 max-w-lg text-sm leading-6 text-portfolio-muted">
                    {project.description}
                </p>
                {project.technologies.length > 0 && <p className="mt-4 text-xs text-portfolio-muted">{project.technologies.join(' · ')}</p>}
            </div>
            </a>
        </Card>
    );
}
