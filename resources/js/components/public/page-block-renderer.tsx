import type { CSSProperties } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Minus } from 'lucide-react';
import { Container } from '@/components/public/container';
import { ProjectCard } from '@/components/public/project-card';
import { PageContactForm } from '@/components/public/page-contact-form';
import {
    ArchitectureGraphic,
    EditorialProjectCard,
    EditorialProfileVisual,
    EditorialSectionHeading,
    EditorialTimelineItem,
    type EditorialExperience,
    type EditorialProject,
} from '@/components/public/editorial-visuals';
import { Button } from '@/components/ui/button';
import type { PageBlock } from '@/types/page-builder';
import type {
    PortfolioContent,
    PortfolioProject,
    PublicChromeContent,
} from '@/types/portfolio';

type Props = {
    blocks: PageBlock[];
    portfolio: PortfolioContent | PublicChromeContent;
    preview?: boolean;
};
type RecordValue = Record<string, unknown>;
const record = (value: unknown): RecordValue =>
    value && typeof value === 'object' && !Array.isArray(value)
        ? (value as RecordValue)
        : {};
const text = (value: unknown, fallback = ''): string =>
    typeof value === 'string' ? value : fallback;
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

export function PageBlockRenderer({
    blocks,
    portfolio,
    preview = false,
}: Props) {
    return (
        <>
            {preview && (
                <div className="border-b border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm font-medium text-amber-900">
                    Vista previa privada · los cambios no publicados solo son
                    visibles para administradores.
                </div>
            )}
            {blocks.map((block) => {
                const appearance = block.appearance ?? {};
                const width = {
                    narrow: '52rem',
                    standard: '76rem',
                    wide: '86rem',
                    full: '100%',
                }[appearance.content_width ?? 'standard'];
                const style = {
                    '--portfolio-container': width,
                } as CSSProperties;
                return (
                    <div
                        id={block.id}
                        key={block.id}
                        data-block-background={
                            appearance.background ?? 'default'
                        }
                        data-block-contrast={appearance.contrast ?? 'auto'}
                        data-block-align={appearance.alignment ?? 'left'}
                        data-block-graphic={appearance.graphic ?? 'none'}
                        style={style}
                        className={`block-visual ${block.variant === 'subtle' ? 'bg-portfolio-tint' : ''} ${block.variant === 'bordered' ? 'mx-auto my-6 max-w-6xl overflow-hidden rounded-portfolio-card border border-line bg-surface shadow-portfolio-soft' : ''}`}
                    >
                        <Block
                            block={block}
                            portfolio={portfolio}
                            preview={preview}
                        />
                    </div>
                );
            })}
        </>
    );
}

function Block({
    block,
    portfolio,
    preview,
}: {
    block: PageBlock;
    portfolio: Props['portfolio'];
    preview: boolean;
}) {
    const content = block.content;
    const data = record(block.data);
    const spacing =
        block.spacing === 'none'
            ? 'py-0'
            : block.spacing === 'compact'
              ? 'py-8'
              : block.spacing === 'relaxed'
                ? 'py-24'
                : 'py-14 sm:py-18';
    const projects = list(block.data).filter(
        (item): item is RecordValue =>
            !!item && typeof item === 'object' && !Array.isArray(item),
    );
    const homePortfolio =
        'hero' in portfolio ? (portfolio as PortfolioContent) : null;
    const chrome = portfolio as PublicChromeContent;
    const identity = record(data.identity ?? homePortfolio?.identity);
    const profile = record(data.about ?? homePortfolio?.about);
    const title = text(content.title, text(content.headline));
    const body = text(content.body, text(content.description));

    if (block.type === 'hero')
        return (
            <HeroEditorialBlock
                block={block}
                content={content}
                data={data}
                identity={identity}
                title={title}
                body={body}
                preview={preview}
            />
        );
    if (block.type === 'featured_projects' || block.type === 'project_grid')
        return (
            <ProjectsEditorialBlock
                block={block}
                content={content}
                projects={projects}
                title={title}
                body={body}
            />
        );
    if (block.type === 'profile')
        return (
            <ProfileEditorialBlock
                block={block}
                content={content}
                identity={identity}
                profile={profile}
                title={title}
                body={body}
            />
        );
    if (block.type === 'timeline')
        return (
            <LegacyTimelineEditorialBlock
                block={block}
                content={content}
                title={title}
                body={body}
            />
        );
    if (block.type === 'resume_experience')
        return (
            <ResumeEditorialBlock
                block={block}
                content={content}
                data={data}
                title={title}
                body={body}
                preview={preview}
            />
        );
    if (block.type === 'technologies')
        return (
            <TechnologiesEditorialBlock
                block={block}
                content={content}
                data={data}
                title={title}
                body={body}
            />
        );
    if (block.type === 'cta')
        return (
            <ContactEditorialBlock
                block={block}
                content={content}
                title={title}
                body={body}
                portfolio={portfolio}
            />
        );

    if (block.type === 'separator')
        return (
            <div aria-hidden="true" className="mx-auto max-w-6xl px-5">
                <div className="border-t border-line py-2">
                    <Minus className="mx-auto size-4 text-portfolio-muted/50" />
                </div>
            </div>
        );
    if (block.type === 'hero') {
        const resumePublished = data.resumePublished === true;
        const resumePreviewAvailable =
            preview && data.resumePreviewAvailable === true;
        const resumeAvailable = resumePublished || resumePreviewAvailable;
        const showResumeAction =
            content.show_resume_action !== false && resumeAvailable;
        const showProjectsAction = content.show_projects_action !== false;
        const showDownloadAction =
            content.show_download_action !== false && resumePublished;
        const projectsIsPrimary = !showResumeAction;

        return (
            <section>
                <Container
                    className={`${spacing} grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end`}
                >
                    <div>
                        <p className="mb-4 text-xs font-semibold tracking-[0.16em] text-portfolio-accent uppercase">
                            {text(
                                content.eyebrow,
                                text(identity.specialty, 'Portfolio'),
                            )}
                        </p>
                        <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-balance text-portfolio-ink sm:text-6xl">
                            {title ||
                                text(identity.public_name, text(identity.name))}
                        </h1>
                        {body && (
                            <p className="mt-6 max-w-2xl text-lg leading-8 text-portfolio-muted">
                                {body}
                            </p>
                        )}
                        <div className="mt-7 flex flex-wrap items-center gap-3">
                            {showResumeAction && (
                                <Button asChild>
                                    <a
                                        href={
                                            resumePreviewAvailable
                                                ? '/admin/resume/preview'
                                                : '/cv'
                                        }
                                    >
                                        {text(
                                            content.resume_action_label,
                                            'Explorar mi trayectoria',
                                        )}
                                        <ArrowUpRight className="ml-2 size-4" />
                                    </a>
                                </Button>
                            )}
                            {showProjectsAction && (
                                <Button
                                    asChild
                                    variant={
                                        projectsIsPrimary
                                            ? 'default'
                                            : 'outline'
                                    }
                                >
                                    <a href="/projects">
                                        {text(
                                            content.projects_action_label,
                                            'Ver proyectos',
                                        )}
                                        <ArrowUpRight className="ml-2 size-4" />
                                    </a>
                                </Button>
                            )}
                            {showDownloadAction && (
                                <a
                                    href={`/cv/pdf/${text(content.download_variant) === 'ats' ? 'ats' : 'professional'}`}
                                    className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-portfolio-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-portfolio-accent"
                                >
                                    {text(
                                        content.download_action_label,
                                        'Descargar CV',
                                    )}
                                    <ArrowUpRight
                                        aria-hidden="true"
                                        className="ml-1.5 size-4"
                                    />
                                </a>
                            )}
                        </div>
                    </div>
                    <p className="text-sm text-portfolio-muted">
                        {text(identity.headline, text(identity.role))}
                    </p>
                </Container>
            </section>
        );
    }
    if (block.type === 'rich_text')
        return (
            <section className={spacing}>
                <Container>
                    {title && (
                        <h2 className="mb-5 text-3xl font-semibold tracking-tight text-portfolio-ink">
                            {title}
                        </h2>
                    )}
                    <div
                        className="prose prose-slate max-w-3xl text-base leading-8 text-portfolio-muted"
                        dangerouslySetInnerHTML={{ __html: text(content.html) }}
                    />
                </Container>
            </section>
        );
    if (block.type === 'image')
        return (
            <section className={spacing}>
                <Container>
                    <figure>
                        {text(content.url) && (
                            <img
                                src={text(content.url)}
                                alt={text(content.alt)}
                                className="max-h-[42rem] w-full rounded-2xl border border-line object-cover"
                            />
                        )}
                        {text(content.caption) && (
                            <figcaption className="mt-3 text-sm text-portfolio-muted">
                                {text(content.caption)}
                            </figcaption>
                        )}
                    </figure>
                </Container>
            </section>
        );
    if (block.type === 'gallery')
        return (
            <section className={spacing}>
                <Container>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {list(content.images).map((item, index) => {
                            const image = record(item);
                            return (
                                <figure key={`${text(image.url)}-${index}`}>
                                    <img
                                        src={text(image.url)}
                                        alt={text(image.alt)}
                                        loading="lazy"
                                        className="aspect-[4/3] w-full rounded-xl border border-line object-cover"
                                    />
                                    {text(image.caption) && (
                                        <figcaption className="mt-2 text-sm text-portfolio-muted">
                                            {text(image.caption)}
                                        </figcaption>
                                    )}
                                </figure>
                            );
                        })}
                    </div>
                </Container>
            </section>
        );
    if (block.type === 'video')
        return (
            <section className={spacing}>
                <Container>
                    <a
                        href={text(content.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-h-56 items-center justify-center rounded-2xl border border-line bg-surface p-8 text-lg font-medium text-portfolio-primary hover:border-portfolio-accent"
                    >
                        {text(content.title, 'Ver vídeo')}{' '}
                        <ArrowUpRight className="ml-2 size-4" />
                    </a>
                </Container>
            </section>
        );
    if (block.type === 'statistics')
        return (
            <section className={spacing}>
                <Container className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {list(content.items).map((item, index) => {
                        const stat = record(item);
                        return (
                            <div
                                key={index}
                                className="rounded-xl border border-line bg-surface p-5"
                            >
                                <p className="text-3xl font-semibold tracking-tight text-portfolio-primary">
                                    {text(stat.value)}
                                </p>
                                <p className="mt-2 text-sm text-portfolio-muted">
                                    {text(stat.label)}
                                </p>
                            </div>
                        );
                    })}
                </Container>
            </section>
        );
    if (block.type === 'featured_projects' || block.type === 'project_grid')
        return (
            <section
                id={
                    text(content.legacy_key) === 'projects'
                        ? 'projects'
                        : undefined
                }
                className={`bg-surface ${spacing}`}
            >
                <Container>
                    <div className="mb-8 max-w-2xl">
                        <p className="mb-3 text-xs font-semibold tracking-[0.16em] text-portfolio-accent uppercase">
                            {text(content.eyebrow, 'Trabajo seleccionado')}
                        </p>
                        <h2 className="text-3xl font-semibold tracking-tight text-portfolio-ink">
                            {title || 'Proyectos'}
                        </h2>
                        {body && (
                            <p className="mt-3 leading-7 text-portfolio-muted">
                                {body}
                            </p>
                        )}
                    </div>
                    {projects.length ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {projects.map((project, index) => (
                                <ProjectCard
                                    key={text(project.slug)}
                                    index={index}
                                    project={{
                                        name: text(project.name),
                                        slug: text(project.slug),
                                        category: text(project.category),
                                        description: text(project.description),
                                        monogram: text(project.monogram),
                                        imageUrl:
                                            text(project.imageUrl) || null,
                                        imageAlt: text(project.imageAlt),
                                        technologies: list(
                                            project.technologies,
                                        ).filter(
                                            (item): item is string =>
                                                typeof item === 'string',
                                        ),
                                        isFeatured: !!project.isFeatured,
                                        visualColor:
                                            text(project.visualColor) || null,
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="rounded-xl border border-dashed border-line p-8 text-sm text-portfolio-muted">
                            Los proyectos aparecerán aquí cuando estén
                            publicados.
                        </p>
                    )}
                </Container>
            </section>
        );
    if (block.type === 'profile')
        return (
            <section
                id={text(content.legacy_key) === 'about' ? 'about' : undefined}
                className={spacing}
            >
                <Container className="max-w-3xl">
                    <p className="mb-3 text-xs font-semibold tracking-[0.16em] text-portfolio-accent uppercase">
                        {text(content.eyebrow, 'Perfil')}
                    </p>
                    <h2 className="mb-5 text-3xl font-semibold tracking-tight text-portfolio-ink">
                        {title || text(profile.title, 'Sobre mí')}
                    </h2>
                    {body ? (
                        <p className="text-base leading-8 whitespace-pre-line text-portfolio-muted">
                            {body}
                        </p>
                    ) : (
                        list(profile.paragraphs).map((paragraph, index) => (
                            <p
                                key={index}
                                className="mb-4 text-base leading-8 text-portfolio-muted"
                            >
                                {text(paragraph)}
                            </p>
                        ))
                    )}
                </Container>
            </section>
        );
    if (block.type === 'timeline')
        return (
            <section
                id={
                    text(content.legacy_key) === 'experience'
                        ? 'experience'
                        : undefined
                }
                className={`${spacing} bg-surface`}
            >
                <Container>
                    <h2 className="mb-4 text-3xl font-semibold tracking-tight text-portfolio-ink">
                        {title || 'Experiencia'}
                    </h2>
                    {body && (
                        <p className="mb-6 max-w-2xl leading-7 text-portfolio-muted">
                            {body}
                        </p>
                    )}
                    <div className="space-y-4">
                        {list(content.items).map((item, index) => {
                            const row = record(item);
                            return (
                                <article
                                    key={index}
                                    className="border-l-2 border-portfolio-accent/40 pl-5"
                                >
                                    <h3 className="font-medium text-portfolio-ink">
                                        {text(row.role, text(row.title))}
                                    </h3>
                                    <p className="mt-1 text-sm text-portfolio-muted">
                                        {text(row.company)}
                                        {text(row.period)
                                            ? ` · ${text(row.period)}`
                                            : ''}
                                    </p>
                                    {text(row.description) && (
                                        <p className="mt-2 text-sm leading-6 text-portfolio-muted">
                                            {text(row.description)}
                                        </p>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                    {!list(content.items).length && text(content.note) && (
                        <p className="text-sm text-portfolio-muted">
                            {text(content.note)}
                        </p>
                    )}
                </Container>
            </section>
        );
    if (block.type === 'resume_experience') {
        if (data.available !== true) return null;
        const experiences = list(data.experiences);
        const skills = list(data.technology_groups);
        const selectedProjects = list(data.projects);
        const resumeHref = preview ? '/admin/resume/preview' : '/cv';

        return (
            <section className={spacing}>
                <Container>
                    <div className="mb-7 max-w-2xl">
                        {text(content.eyebrow) && (
                            <p className="mb-3 text-xs font-semibold tracking-[0.16em] text-portfolio-accent uppercase">
                                {text(content.eyebrow)}
                            </p>
                        )}
                        <h2 className="text-3xl font-semibold tracking-tight text-portfolio-ink">
                            {title || 'Experiencia profesional'}
                        </h2>
                        {body && (
                            <p className="mt-3 leading-7 text-portfolio-muted">
                                {body}
                            </p>
                        )}
                    </div>
                    {text(data.summary) && (
                        <p className="mb-8 max-w-3xl text-base leading-8 text-portfolio-muted">
                            {text(data.summary)}
                        </p>
                    )}
                    <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr]">
                        <div className="space-y-5">
                            {experiences.map((value, index) => {
                                const item = record(value);
                                const technologies = list(
                                    item.technologies,
                                ).map(record);
                                const projects = list(item.projects).map(
                                    record,
                                );
                                const start = text(item.started_at);
                                const end = item.is_current
                                    ? 'Actualidad'
                                    : text(item.ended_at);
                                return (
                                    <article
                                        key={text(item.id, String(index))}
                                        className="border-l-2 border-portfolio-accent/40 pl-5 sm:pl-6"
                                    >
                                        <h3 className="text-lg font-semibold text-portfolio-ink">
                                            {text(item.job_title)}
                                        </h3>
                                        <p className="mt-1 text-sm font-medium text-portfolio-primary">
                                            {text(item.company)}
                                            {item.location
                                                ? ` · ${text(item.location)}`
                                                : ''}
                                        </p>
                                        {(start || end) && (
                                            <p className="mt-1 text-xs text-portfolio-muted">
                                                {start}
                                                {start && end ? ' — ' : ''}
                                                {end}
                                            </p>
                                        )}
                                        {text(item.description) && (
                                            <p className="mt-3 text-sm leading-7 text-portfolio-muted">
                                                {text(item.description)}
                                            </p>
                                        )}
                                        {technologies.length > 0 && (
                                            <p className="mt-3 text-xs text-portfolio-muted">
                                                {technologies
                                                    .map((technology) =>
                                                        text(technology.name),
                                                    )
                                                    .filter(Boolean)
                                                    .join(' · ')}
                                            </p>
                                        )}
                                        {projects.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {projects.map((project) => (
                                                    <a
                                                        key={text(project.slug)}
                                                        href={`/projects/${text(project.slug)}`}
                                                        className="inline-flex min-h-9 items-center rounded-full border border-line px-3 text-xs font-medium text-portfolio-primary hover:border-portfolio-primary focus-visible:outline-2 focus-visible:outline-portfolio-accent"
                                                    >
                                                        {text(project.name)}
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                        <aside className="space-y-8">
                            {skills.length > 0 && (
                                <div>
                                    <h3 className="mb-4 text-xs font-semibold tracking-[0.15em] text-portfolio-muted uppercase">
                                        Competencias destacadas
                                    </h3>
                                    <div className="space-y-4">
                                        {skills.map((value, index) => {
                                            const group = record(value);
                                            return (
                                                <div
                                                    key={text(
                                                        group.category,
                                                        String(index),
                                                    )}
                                                >
                                                    <h4 className="mb-2 text-sm font-semibold text-portfolio-ink">
                                                        {text(group.category)}
                                                    </h4>
                                                    <ul className="flex flex-wrap gap-2">
                                                        {list(group.items).map(
                                                            (
                                                                item,
                                                                itemIndex,
                                                            ) => {
                                                                const technology =
                                                                    record(
                                                                        item,
                                                                    );
                                                                return (
                                                                    <li
                                                                        key={text(
                                                                            technology.slug,
                                                                            `${index}-${itemIndex}`,
                                                                        )}
                                                                        className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-portfolio-muted"
                                                                    >
                                                                        {text(
                                                                            technology.name,
                                                                            typeof item ===
                                                                                'string'
                                                                                ? item
                                                                                : '',
                                                                        )}
                                                                    </li>
                                                                );
                                                            },
                                                        )}
                                                    </ul>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            {selectedProjects.length > 0 && (
                                <div>
                                    <h3 className="mb-4 text-xs font-semibold tracking-[0.15em] text-portfolio-muted uppercase">
                                        Proyectos relacionados
                                    </h3>
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                                        {selectedProjects.map(
                                            (value, index) => (
                                                <ProjectCard
                                                    key={text(
                                                        record(value).slug,
                                                        String(index),
                                                    )}
                                                    project={
                                                        record(
                                                            value,
                                                        ) as unknown as PortfolioProject
                                                    }
                                                    index={index}
                                                />
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}
                        </aside>
                    </div>
                    {content.show_cta !== false && (
                        <Button asChild className="mt-8">
                            <a href={resumeHref}>
                                {text(
                                    content.cta_label,
                                    'Explorar mi trayectoria',
                                )}
                                <ArrowUpRight
                                    aria-hidden="true"
                                    className="ml-2 size-4"
                                />
                            </a>
                        </Button>
                    )}
                </Container>
            </section>
        );
    }
    if (block.type === 'technologies')
        return (
            <section
                id={text(content.legacy_key) === 'stack' ? 'stack' : undefined}
                className={spacing}
            >
                <Container>
                    <h2 className="mb-3 text-3xl font-semibold tracking-tight text-portfolio-ink">
                        {title || 'Tecnologías'}
                    </h2>
                    {body && (
                        <p className="mb-7 max-w-2xl text-portfolio-muted">
                            {body}
                        </p>
                    )}
                    <div className="grid gap-6 sm:grid-cols-2">
                        {list(data.items ?? content.groups).map(
                            (item, index) => {
                                const group = record(item);
                                const names = list(group.items).filter(
                                    (name): name is string =>
                                        typeof name === 'string',
                                );
                                return (
                                    <div key={index}>
                                        <h3 className="mb-3 text-sm font-semibold text-portfolio-ink">
                                            {text(
                                                group.category,
                                                text(group.title),
                                            )}
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {names.map((name) => (
                                                <span
                                                    key={name}
                                                    className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-portfolio-muted"
                                                >
                                                    {name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            },
                        )}
                    </div>
                </Container>
            </section>
        );
    if (block.type === 'cta')
        return (
            <section
                id={
                    text(content.legacy_key) === 'contact'
                        ? 'contact'
                        : undefined
                }
                className="border-y border-line bg-surface"
            >
                <Container className={`${spacing} text-center`}>
                    <p className="mb-3 text-xs font-semibold tracking-[0.16em] text-portfolio-accent uppercase">
                        {text(content.eyebrow, 'Contacto')}
                    </p>
                    <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-portfolio-ink">
                        {title}
                    </h2>
                    {body && (
                        <p className="mx-auto mt-4 max-w-xl leading-7 text-portfolio-muted">
                            {body}
                        </p>
                    )}
                    <div className="mt-6 flex justify-center gap-3">
                        {text(content.button_url) && (
                            <Button asChild>
                                <a href={text(content.button_url)}>
                                    {text(content.button_label, 'Contactar')}{' '}
                                    <ArrowUpRight className="ml-2 size-4" />
                                </a>
                            </Button>
                        )}
                        {homePortfolio?.contact.email && (
                            <Button asChild variant="outline">
                                <a
                                    href={`mailto:${homePortfolio.contact.email}`}
                                >
                                    {homePortfolio.contact.email}
                                </a>
                            </Button>
                        )}
                        {!homePortfolio && chrome.contact.email && (
                            <Button asChild variant="outline">
                                <a href={`mailto:${chrome.contact.email}`}>
                                    {chrome.contact.email}
                                </a>
                            </Button>
                        )}
                    </div>
                </Container>
            </section>
        );
    if (block.type === 'columns')
        return (
            <section className={spacing}>
                <Container className="grid gap-5 md:grid-cols-2">
                    {list(content.columns).map((item, index) => {
                        const column = record(item);
                        return (
                            <article
                                key={index}
                                className="rounded-xl border border-line bg-surface p-6"
                            >
                                <h2 className="text-xl font-semibold text-portfolio-ink">
                                    {text(column.title)}
                                </h2>
                                <p className="mt-3 leading-7 whitespace-pre-line text-portfolio-muted">
                                    {text(column.body)}
                                </p>
                            </article>
                        );
                    })}
                </Container>
            </section>
        );
    if (block.type === 'contact_form')
        return (
            <div className={spacing}>
                <PageContactForm
                    title={title || 'Contacto'}
                    description={body}
                />
            </div>
        );

    return null;
}

function HeroEditorialBlock({
    block,
    content,
    data,
    identity,
    title,
    body,
    preview,
}: {
    block: PageBlock;
    content: RecordValue;
    data: RecordValue;
    identity: RecordValue;
    title: string;
    body: string;
    preview: boolean;
}) {
    const resumePublished = data.resumePublished === true;
    const resumePreviewAvailable =
        preview && data.resumePreviewAvailable === true;
    const showResume =
        content.show_resume_action !== false &&
        (resumePublished || resumePreviewAvailable);
    const showProjects = content.show_projects_action !== false;
    const showDownload =
        content.show_download_action !== false && resumePublished;
    const name = text(identity.public_name, text(identity.name, title));
    const role = text(
        identity.specialty,
        text(identity.headline, text(identity.role)),
    );
    const oldHeadline = 'Software útil, bien pensado y preparado para crecer.';
    const headline = text(
        content.headline,
        'De la idea al producto. Del código a la solución.',
    );
    const tagline =
        headline === oldHeadline
            ? 'De la idea al producto. Del código a la solución.'
            : headline;
    const defaultDescription =
        'Diseño y desarrollo productos digitales y software empresarial con atención al detalle, desde la arquitectura hasta la experiencia de uso.';
    const rawDescription = body || text(data.description);
    const description =
        rawDescription === defaultDescription || !rawDescription
            ? 'Diseño y desarrollo aplicaciones web y productos digitales. Especializado en Laravel, React y arquitecturas que resuelven problemas reales.'
            : rawDescription;
    const hasDarkBackground = ['default', 'navy', 'primary'].includes(
        block.appearance?.background ?? 'default',
    );
    const lightText =
        block.appearance?.contrast === 'light' ||
        (block.appearance?.contrast !== 'dark' && hasDarkBackground);
    const background =
        block.appearance?.background === 'primary'
            ? 'var(--portfolio-primary)'
            : block.appearance?.background === 'turquoise'
              ? 'var(--portfolio-secondary)'
              : block.appearance?.background === 'surface'
                ? 'var(--portfolio-surface)'
                : block.appearance?.background === 'light'
                  ? 'var(--portfolio-tint)'
                  : 'var(--portfolio-navy)';
    const foreground = lightText ? 'text-white' : 'text-portfolio-ink';
    const muted = lightText ? 'text-white/70' : 'text-portfolio-muted';
    const graphic = block.appearance?.graphic ?? 'orbital';
    const years =
        typeof data.experienceYears === 'number' ? data.experienceYears : null;
    const hasPublishedProjects = showProjects;
    return (
        <section
            id="top"
            className={`relative isolate overflow-hidden ${spacingClass(block.spacing)} ${foreground}`}
            style={{ backgroundColor: background }}
        >
            <div className="mx-auto grid min-h-[620px] w-full max-w-[var(--portfolio-container)] items-center gap-8 px-5 sm:px-8 lg:min-h-[min(760px,calc(100svh-5rem))] lg:grid-cols-[1.03fr_.97fr] lg:gap-2 lg:px-10">
                <div className="relative z-10 max-w-3xl py-10">
                    <p className="mb-7 inline-flex items-center gap-3 text-xs font-semibold tracking-[.2em] text-portfolio-secondary uppercase sm:text-sm">
                        <span
                            className="h-px w-10 bg-portfolio-secondary"
                            aria-hidden="true"
                        />
                        {text(content.eyebrow, role || 'Portfolio')}
                    </p>
                    <h1 className="max-w-4xl text-[length:var(--portfolio-font-display)] leading-[.84] font-semibold tracking-[-.075em] text-balance">
                        {name}
                        <span className="text-portfolio-secondary">.</span>
                        <span
                            className={`mt-5 block text-[.24em] leading-tight font-medium tracking-[-.035em] sm:mt-7 ${muted}`}
                        >
                            {role}
                        </span>
                    </h1>
                    <p
                        className={`mt-8 max-w-2xl text-xl leading-8 text-pretty sm:text-2xl sm:leading-9 ${lightText ? 'text-white/95' : 'text-portfolio-ink'}`}
                    >
                        {tagline}
                    </p>
                    {description && (
                        <p
                            className={`mt-5 max-w-xl text-base leading-7 sm:text-lg sm:leading-8 ${muted}`}
                        >
                            {description}
                        </p>
                    )}
                    <div className="mt-9 flex flex-wrap items-center gap-3">
                        {showResume && (
                            <a
                                href={
                                    resumePreviewAvailable
                                        ? '/admin/resume/preview'
                                        : '/cv'
                                }
                                className="inline-flex min-h-12 items-center gap-3 rounded-full bg-portfolio-primary px-6 text-sm font-semibold text-white transition duration-[var(--portfolio-transition)] hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-portfolio-secondary"
                            >
                                {text(
                                    content.resume_action_label,
                                    'Explorar mi trayectoria',
                                )}
                                <ArrowDownRight
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            </a>
                        )}
                        {showProjects && (
                            <a
                                href="/projects"
                                className={`inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-portfolio-secondary ${showResume ? `border ${lightText ? 'border-white/35 text-white hover:border-white/75 hover:bg-white/5' : 'border-line text-portfolio-ink hover:border-portfolio-primary hover:bg-surface'}` : 'bg-portfolio-primary text-white hover:brightness-110'}`}
                            >
                                {text(
                                    content.projects_action_label,
                                    'Ver proyectos',
                                )}
                                <ArrowRight
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            </a>
                        )}
                        {!hasPublishedProjects && !showResume && (
                            <a
                                href="#contact"
                                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-portfolio-primary px-6 text-sm font-semibold text-white"
                            >
                                Contactar
                                <ArrowRight
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            </a>
                        )}
                        {showDownload && (
                            <a
                                href={`/cv/pdf/${text(content.download_variant) === 'ats' ? 'ats' : 'professional'}`}
                                className={`inline-flex min-h-11 items-center px-2 text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-portfolio-secondary ${muted}`}
                            >
                                {text(
                                    content.download_action_label,
                                    'Descargar CV',
                                )}
                                <ArrowUpRight
                                    aria-hidden="true"
                                    className="ml-1.5 size-4"
                                />
                            </a>
                        )}
                    </div>
                    {(text(data.availability) || years !== null) && (
                        <div
                            className={`mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 border-t pt-5 text-xs font-medium tracking-wide sm:text-sm ${lightText ? 'border-white/15 text-white/60' : 'border-line text-portfolio-muted'}`}
                        >
                            {text(data.availability) && (
                                <span>{text(data.availability)}</span>
                            )}
                            {text(data.availability) && years !== null && (
                                <span
                                    className="size-1 rounded-full bg-portfolio-secondary"
                                    aria-hidden="true"
                                />
                            )}
                            {years !== null && (
                                <span>
                                    ≈
                                    {Number.isInteger(years)
                                        ? years
                                        : years.toLocaleString('es-ES')}{' '}
                                    años de experiencia
                                </span>
                            )}
                        </div>
                    )}
                </div>
                {content.show_graphic !== false && (
                    <ArchitectureGraphic
                        graphic={graphic === 'none' ? 'orbital' : graphic}
                    />
                )}
            </div>
        </section>
    );
}

function ProjectsEditorialBlock({
    block,
    content,
    projects,
    title,
    body,
}: {
    block: PageBlock;
    content: RecordValue;
    projects: RecordValue[];
    title: string;
    body: string;
}) {
    const items: EditorialProject[] = projects.map((project) => ({
        name: text(project.name),
        slug: text(project.slug),
        category: text(project.category),
        description: text(project.description),
        monogram: text(project.monogram),
        imageUrl: text(project.imageUrl) || null,
        imageAlt: text(project.imageAlt) || null,
        technologies: list(project.technologies).filter(
            (item): item is string => typeof item === 'string',
        ),
        isFeatured: project.isFeatured === true,
        visualColor: text(project.visualColor) || null,
    }));
    const featuredVariant = block.type === 'featured_projects';
    return (
        <section
            id="projects"
            className={`${spacingClass(block.spacing)} ${block.variant === 'subtle' ? '' : ''}`}
            style={blockBackground(block, 'var(--portfolio-background)')}
        >
            <div className="mx-auto w-full max-w-[var(--portfolio-container)] px-5 sm:px-8 lg:px-10">
                <EditorialSectionHeading
                    eyebrow={text(
                        content.eyebrow,
                        featuredVariant
                            ? '01 / Trabajo seleccionado'
                            : 'Proyectos',
                    )}
                    title={
                        title ||
                        (featuredVariant
                            ? 'Proyectos con propósito.'
                            : 'Proyectos')
                    }
                    description={
                        body ||
                        'Productos y sistemas digitales construidos para resolver necesidades reales.'
                    }
                />
                {items.length > 0 ? (
                    <div className="mt-12 grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-y-16">
                        {items.map((project, index) => (
                            <EditorialProjectCard
                                key={project.slug}
                                project={project}
                                index={index}
                                asymmetric={block.variant !== 'bordered'}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="mt-12 rounded-2xl border border-dashed border-line bg-surface/70 p-8 text-sm leading-7 text-portfolio-muted">
                        Los proyectos publicados aparecerán aquí cuando estén
                        disponibles.
                    </p>
                )}
            </div>
        </section>
    );
}

function ProfileEditorialBlock({
    block,
    content,
    identity,
    profile,
    title,
    body,
}: {
    block: PageBlock;
    content: RecordValue;
    identity: RecordValue;
    profile: RecordValue;
    title: string;
    body: string;
}) {
    const paragraphs = list(profile.paragraphs)
        .map((value) => text(value))
        .filter(Boolean);
    const biography = body ? [body] : paragraphs;
    const name = text(identity.public_name, text(identity.name));
    return (
        <section
            id="about"
            className={spacingClass(block.spacing)}
            style={blockBackground(block, 'var(--portfolio-background)')}
        >
            <div className="mx-auto grid w-full max-w-[var(--portfolio-container)] items-center gap-10 px-5 sm:px-8 lg:grid-cols-[.72fr_1.28fr] lg:gap-20 lg:px-10">
                <div>
                    <p className="mb-4 text-xs font-bold tracking-[.18em] text-portfolio-accent uppercase">
                        {text(content.eyebrow, '03 / Sobre mí')}
                    </p>
                    <p className="text-sm font-medium text-portfolio-muted">
                        {text(identity.specialty)}
                    </p>
                    <EditorialProfileVisual
                        name={name}
                        role={text(identity.headline, text(identity.role))}
                        specialty={text(identity.location)}
                        photoUrl={
                            text(identity.photoUrl) ||
                            text(identity.photo_url) ||
                            null
                        }
                    />
                </div>
                <div>
                    <h2 className="max-w-4xl text-[length:var(--portfolio-font-section)] leading-[1.02] font-semibold tracking-[-.055em] text-balance text-portfolio-ink">
                        {title ||
                            text(profile.title, 'Tecnología con intención.')}
                    </h2>
                    <div className="mt-7 max-w-3xl space-y-5">
                        {biography.map((paragraph, index) => (
                            <p
                                key={index}
                                className="text-base leading-8 text-portfolio-muted sm:text-lg"
                            >
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function LegacyTimelineEditorialBlock({
    block,
    content,
    title,
    body,
}: {
    block: PageBlock;
    content: RecordValue;
    title: string;
    body: string;
}) {
    const items = list(content.items).map(record);
    return (
        <section
            id="experience"
            className={spacingClass(block.spacing)}
            style={blockBackground(block, 'var(--portfolio-surface)')}
        >
            <div className="mx-auto w-full max-w-[var(--portfolio-container)] px-5 sm:px-8 lg:px-10">
                <div className="mb-10 min-w-0">
                    <EditorialSectionHeading
                        eyebrow={text(content.eyebrow, '02 / Trayectoria')}
                        title={title || 'Experiencia profesional'}
                        description={body}
                    />
                </div>
                <div className="min-w-0 border-l border-line pl-5 sm:pl-8">
                    {items.length ? (
                        items.map((item, index) => (
                            <EditorialTimelineItem
                                key={`${text(item.company)}-${index}`}
                                item={{
                                    id: index,
                                    job_title: text(
                                        item.role,
                                        text(item.title),
                                    ),
                                    company: text(item.company),
                                    description: text(item.description),
                                    started_at: null,
                                    ended_at: null,
                                    responsibilities: [],
                                    achievements: [],
                                    technologies: [],
                                    projects: [],
                                }}
                                index={index}
                            />
                        ))
                    ) : (
                        <p className="rounded-xl border border-dashed border-line bg-canvas p-6 text-sm leading-7 text-portfolio-muted">
                            La trayectoria se mostrará aquí cuando haya
                            experiencias configuradas.
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}

function ResumeEditorialBlock({
    block,
    content,
    data,
    title,
    body,
    preview,
}: {
    block: PageBlock;
    content: RecordValue;
    data: RecordValue;
    title: string;
    body: string;
    preview: boolean;
}) {
    if (data.available !== true)
        return (
            <section
                id="experience"
                className={spacingClass(block.spacing)}
                style={blockBackground(block, 'var(--portfolio-surface)')}
            >
                <div className="mx-auto w-full max-w-[var(--portfolio-container)] px-5 sm:px-8 lg:px-10">
                    <EditorialSectionHeading
                        eyebrow={text(content.eyebrow, '02 / Trayectoria')}
                        title={
                            title ||
                            'Experiencia que conecta producto y tecnología.'
                        }
                        description={body}
                    />
                    <p className="mt-8 rounded-xl border border-dashed border-line bg-canvas p-6 text-sm leading-7 text-portfolio-muted">
                        Todavía no hay contenido de currículum publicado.
                    </p>
                </div>
            </section>
        );
    const experiences = list(data.experiences).map(
        record,
    ) as unknown as EditorialExperience[];
    const groups = list(data.technology_groups).map(record);
    const relatedProjects = list(data.projects).map(record);
    return (
        <section
            id="experience"
            className={spacingClass(block.spacing)}
            style={blockBackground(block, 'var(--portfolio-surface)')}
        >
            <div className="mx-auto w-full max-w-[var(--portfolio-container)] px-5 sm:px-8 lg:px-10">
                <div className="space-y-10 lg:space-y-12">
                    <div className="grid min-w-0 gap-5 md:grid-cols-[minmax(0,1.2fr)_minmax(16rem,.8fr)] md:gap-10 lg:gap-16">
                        <div className="min-w-0">
                            {text(content.eyebrow) && (
                                <p className="mb-3 text-xs font-semibold tracking-[0.16em] text-portfolio-accent uppercase">
                                    {text(content.eyebrow)}
                                </p>
                            )}
                            <h2 className="max-w-4xl text-[length:var(--portfolio-font-section)] leading-[1.02] font-semibold tracking-[-.045em] text-balance text-portfolio-ink">
                                {title || 'Experiencia profesional'}
                            </h2>
                        </div>
                        <div className="min-w-0 space-y-4 text-base leading-7 text-portfolio-muted md:pt-7">
                            {body && <p>{body}</p>}
                            {text(data.summary) && <p>{text(data.summary)}</p>}
                        </div>
                    </div>
                    <div className="min-w-0 border-l border-line pl-5 sm:pl-8">
                        {experiences.length ? (
                            experiences.map((item, index) => (
                                <EditorialTimelineItem
                                    key={item.id}
                                    item={{
                                        ...item,
                                        projects: (item.projects ?? []).filter(
                                            (project) => Boolean(project.slug),
                                        ),
                                    }}
                                    index={index}
                                />
                            ))
                        ) : (
                            <p className="rounded-xl border border-dashed border-line bg-canvas p-6 text-sm leading-7 text-portfolio-muted">
                                No hay experiencias seleccionadas para mostrar
                                públicamente.
                            </p>
                        )}
                    </div>
                </div>
                {(groups.length > 0 || relatedProjects.length > 0) && (
                    <div className="mt-10 grid gap-8 border-t border-line pt-8 md:grid-cols-2">
                        {groups.length > 0 && (
                            <div>
                                <h3 className="mb-4 text-xs font-semibold tracking-[.15em] text-portfolio-muted uppercase">
                                    Competencias destacadas
                                </h3>
                                {groups.map((value, index) => {
                                    const group = record(value);
                                    const items = list(group.items)
                                        .map((entry) =>
                                            typeof entry === 'string'
                                                ? entry
                                                : text(record(entry).name),
                                        )
                                        .filter(Boolean);
                                    return (
                                        <div
                                            key={text(
                                                group.category,
                                                String(index),
                                            )}
                                            className="mb-4"
                                        >
                                            <h4 className="mb-2 text-sm font-semibold text-portfolio-ink">
                                                {text(group.category)}
                                            </h4>
                                            <ul className="flex flex-wrap gap-2">
                                                {items.map((item) => (
                                                    <li
                                                        key={item}
                                                        className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-portfolio-muted"
                                                    >
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {relatedProjects.length > 0 && (
                            <div>
                                <h3 className="mb-4 text-xs font-semibold tracking-[.15em] text-portfolio-muted uppercase">
                                    Proyectos relacionados
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {relatedProjects.map((value) => {
                                        const project = record(value);
                                        return (
                                            <a
                                                key={text(project.slug)}
                                                href={`/projects/${text(project.slug)}`}
                                                className="inline-flex min-h-10 items-center rounded-full border border-line px-4 text-sm font-medium text-portfolio-primary hover:border-portfolio-primary focus-visible:outline-2 focus-visible:outline-portfolio-primary"
                                            >
                                                {text(project.name)}
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {content.show_cta !== false && (
                    <a
                        href={preview ? '/admin/resume/preview' : '/cv'}
                        className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-portfolio-primary px-5 text-sm font-semibold text-white transition duration-[var(--portfolio-transition)] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-portfolio-primary"
                    >
                        {text(content.cta_label, 'Explorar mi trayectoria')}
                        <ArrowUpRight aria-hidden="true" className="size-4" />
                    </a>
                )}
            </div>
        </section>
    );
}

function TechnologiesEditorialBlock({
    block,
    content,
    data,
    title,
    body,
}: {
    block: PageBlock;
    content: RecordValue;
    data: RecordValue;
    title: string;
    body: string;
}) {
    const groups = list(data.items ?? content.groups).map(record);
    return (
        <section
            id="stack"
            className={`${spacingClass(block.spacing)} border-y border-line`}
            style={blockBackground(block, 'var(--portfolio-surface)')}
        >
            <div className="mx-auto w-full max-w-[var(--portfolio-container)] px-5 sm:px-8 lg:px-10">
                <EditorialSectionHeading
                    eyebrow={text(content.eyebrow, '04 / Herramientas')}
                    title={title || 'Un stack para construir y hacer crecer.'}
                    description={
                        body ||
                        'Tecnologías visibles en el catálogo del portfolio, agrupadas por disciplina.'
                    }
                />
                {groups.length ? (
                    <div className="mt-12 divide-y divide-line border-y border-line">
                        {groups.map((value, index) => {
                            const group = record(value);
                            const items = list(group.items)
                                .map((item) =>
                                    typeof item === 'string'
                                        ? item
                                        : text(record(item).name),
                                )
                                .filter(Boolean);
                            return (
                                <article
                                    key={text(
                                        group.category,
                                        text(group.name, String(index)),
                                    )}
                                    className="grid gap-4 py-6 sm:grid-cols-[4.5rem_.75fr_1.25fr] sm:items-start sm:gap-6 sm:py-8"
                                >
                                    <span className="font-mono text-xs font-semibold tracking-widest text-portfolio-primary">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <h3 className="text-lg font-semibold tracking-[-.025em] text-portfolio-ink">
                                        {text(
                                            group.category,
                                            text(
                                                group.name,
                                                `Disciplina ${index + 1}`,
                                            ),
                                        )}
                                    </h3>
                                    <ul className="flex flex-wrap gap-2 sm:justify-end">
                                        {items.map((item) => (
                                            <li
                                                key={item}
                                                className="rounded-full border border-line bg-surface px-3.5 py-2 text-xs font-medium text-portfolio-muted"
                                            >
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <p className="mt-10 rounded-xl border border-dashed border-line bg-canvas p-6 text-sm text-portfolio-muted">
                        Las tecnologías aparecerán cuando haya elementos
                        visibles en el catálogo.
                    </p>
                )}
            </div>
        </section>
    );
}

function ContactEditorialBlock({
    block,
    content,
    title,
    body,
    portfolio,
}: {
    block: PageBlock;
    content: RecordValue;
    title: string;
    body: string;
    portfolio: Props['portfolio'];
}) {
    const home =
        'contact' in portfolio ? (portfolio as PortfolioContent) : null;
    const contact = home?.contact ?? portfolio.contact;
    const links = [
        ...(contact.email
            ? [{ label: 'Email', href: `mailto:${contact.email}` }]
            : []),
        ...(contact.linkedin
            ? [{ label: 'LinkedIn', href: contact.linkedin }]
            : []),
        ...(contact.github ? [{ label: 'GitHub', href: contact.github }] : []),
        ...(contact.website
            ? [{ label: 'Sitio web', href: contact.website }]
            : []),
    ];
    const background =
        block.appearance?.background === 'primary'
            ? 'var(--portfolio-primary)'
            : block.appearance?.background === 'turquoise'
              ? 'var(--portfolio-secondary)'
              : block.appearance?.background === 'surface'
                ? 'var(--portfolio-surface)'
                : block.appearance?.background === 'light'
                  ? 'var(--portfolio-tint)'
                  : 'var(--portfolio-navy)';
    const light =
        block.appearance?.contrast === 'light' ||
        (block.appearance?.contrast !== 'dark' &&
            !['surface', 'light', 'turquoise'].includes(
                block.appearance?.background ?? 'default',
            ));
    return (
        <section
            id="contact"
            className={`${spacingClass(block.spacing)} ${light ? 'text-white' : 'text-portfolio-ink'}`}
            style={{ backgroundColor: background }}
        >
            <div className="mx-auto grid w-full max-w-[var(--portfolio-container)] gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-end lg:px-10">
                <div className="max-w-4xl">
                    <p className="mb-4 text-xs font-bold tracking-[.18em] text-portfolio-secondary uppercase">
                        {text(content.eyebrow, '05 / Contacto')}
                    </p>
                    <h2 className="text-[clamp(2.5rem,6vw,6rem)] leading-[.92] font-semibold tracking-[-.065em] text-balance">
                        {title || 'Hablemos de lo que podemos construir.'}
                    </h2>
                    {body && (
                        <p
                            className={`mt-6 max-w-2xl text-base leading-7 sm:text-lg ${light ? 'text-white/65' : 'text-portfolio-muted'}`}
                        >
                            {body}
                        </p>
                    )}
                </div>
                {text(content.button_url) && text(content.button_label) && (
                    <a
                        href={text(content.button_url)}
                        className="inline-flex min-h-12 w-fit items-center gap-3 rounded-full bg-portfolio-secondary px-6 text-sm font-bold text-portfolio-navy transition duration-[var(--portfolio-transition)] hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-portfolio-secondary"
                    >
                        {text(content.button_label)}
                        <ArrowUpRight aria-hidden="true" className="size-4" />
                    </a>
                )}
            </div>
            {links.length > 0 && (
                <div
                    className={`mx-auto mt-12 flex w-full max-w-[var(--portfolio-container)] flex-wrap gap-x-7 gap-y-3 border-t px-5 pt-6 text-sm sm:px-8 lg:px-10 ${light ? 'border-white/15 text-white/65' : 'border-line text-portfolio-muted'}`}
                >
                    {links.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            target={
                                link.href.startsWith('mailto:')
                                    ? undefined
                                    : '_blank'
                            }
                            rel={
                                link.href.startsWith('mailto:')
                                    ? undefined
                                    : 'noreferrer'
                            }
                            className="transition-colors hover:text-portfolio-secondary focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-portfolio-secondary"
                        >
                            {link.label === 'Email'
                                ? contact.email
                                : link.label}
                        </a>
                    ))}
                </div>
            )}
        </section>
    );
}

function spacingClass(spacing: PageBlock['spacing']): string {
    if (spacing === 'none') return 'py-0';
    if (spacing === 'compact') return 'py-10 sm:py-12';
    if (spacing === 'relaxed') return 'py-24 sm:py-32';
    return 'py-16 sm:py-24 lg:py-28';
}

function blockBackground(block: PageBlock, fallback: string): CSSProperties {
    const colors: Record<string, string> = {
        default: fallback,
        navy: 'var(--portfolio-navy)',
        primary: 'var(--portfolio-primary)',
        turquoise: 'var(--portfolio-secondary)',
        surface: 'var(--portfolio-surface)',
        light: 'var(--portfolio-tint)',
    };
    return {
        backgroundColor:
            colors[block.appearance?.background ?? 'default'] ?? fallback,
    };
}
