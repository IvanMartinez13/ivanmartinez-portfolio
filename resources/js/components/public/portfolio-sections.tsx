import { ArrowDownRight, ArrowRight, ArrowUpRight, Mail } from 'lucide-react';
import { Button } from '@/components/public/button';
import { Container } from '@/components/public/container';
import { ProjectCard } from '@/components/public/project-card';
import { Section } from '@/components/public/section';
import { SectionHeading } from '@/components/public/section-heading';
import { TechnologyBadge } from '@/components/public/technology-badge';
import { TimelineItem } from '@/components/public/timeline-item';
import type { PortfolioContent } from '@/types/portfolio';

type HeroProps = {
    portfolio: PortfolioContent;
};

function sectionContent(
    portfolio: PortfolioContent,
    key: PortfolioContent['sections'][number]['key'],
) {
    return portfolio.sections.find((section) => section.key === key)?.content ?? {};
}

export function HeroSection({ portfolio }: HeroProps) {
    const { hero, identity } = portfolio;

    return (
        <section
            id="top"
            className="relative overflow-hidden border-b border-line bg-canvas"
        >
            <Container className="grid min-h-[calc(100svh-5rem)] items-center gap-12 py-20 md:grid-cols-12 md:gap-8 md:py-28 lg:min-h-[42rem] lg:py-32">
                <div className="relative z-10 md:col-span-8 lg:col-span-8">
                    <p className="mb-6 inline-flex items-center gap-3 text-xs font-semibold tracking-[0.16em] text-portfolio-accent uppercase">
                        <span
                            className="h-px w-8 bg-portfolio-accent"
                            aria-hidden="true"
                        />
                        {hero.eyebrow}
                    </p>
                    <h1 className="max-w-4xl text-portfolio-display leading-[0.99] font-semibold tracking-[-0.065em] text-balance text-portfolio-ink motion-safe:animate-[portfolio-enter_700ms_ease-out_both]">
                        {identity.name}
                        <span className="mt-3 block text-[0.43em] leading-tight font-medium tracking-[-0.035em] text-portfolio-primary sm:mt-5">
                            {identity.role}
                        </span>
                    </h1>
                    <p className="mt-8 max-w-2xl text-lg leading-8 text-pretty text-portfolio-muted sm:text-xl sm:leading-9">
                        {hero.headline}
                    </p>
                    <p className="mt-4 max-w-xl text-base leading-7 text-portfolio-muted">
                        {hero.description}
                    </p>
                    <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                        {portfolio.sections.some(
                            (section) => section.key === 'projects' && section.visible,
                        ) && (
                            <Button asChild>
                                <a href="#projects">
                                    Ver proyectos
                                    <ArrowDownRight aria-hidden="true" />
                                </a>
                            </Button>
                        )}
                        {portfolio.sections.some(
                            (section) => section.key === 'contact' && section.visible,
                        ) && (
                            <Button asChild variant="outline">
                                <a href="#contact">
                                    Contactar
                                    <ArrowRight aria-hidden="true" />
                                </a>
                            </Button>
                        )}
                    </div>
                    <p className="mt-7 text-xs tracking-wide text-portfolio-muted">
                        {hero.availability}
                    </p>
                </div>

                <aside
                    aria-label={hero.experience}
                    className="relative mx-auto w-full max-w-sm md:col-span-4 md:mx-0 md:ml-auto md:max-w-none"
                >
                    <div className="relative flex min-h-72 flex-col justify-between overflow-hidden rounded-portfolio-card border border-line bg-surface p-7 sm:min-h-80 sm:p-9">
                        <span
                            aria-hidden="true"
                            className="absolute -right-8 -bottom-16 text-[15rem] leading-none font-semibold tracking-[-0.12em] text-portfolio-primary/[0.045] select-none"
                        >
                            IM.
                        </span>
                        <div className="relative flex items-center justify-between border-b border-line pb-5">
                            <span className="text-xs font-semibold tracking-[0.14em] text-portfolio-muted uppercase">
                                {identity.role}
                            </span>
                            {identity.photoUrl ? (
                                <img
                                    src={identity.photoUrl}
                                    alt={identity.name}
                                    loading="eager"
                                    referrerPolicy="no-referrer"
                                    className="size-10 rounded-full border border-line object-cover"
                                />
                            ) : (
                                <span
                                    className="h-2 w-2 rounded-full bg-portfolio-accent"
                                    aria-hidden="true"
                                />
                            )}
                        </div>
                        <div className="relative py-8">
                            <p className="font-mono text-6xl leading-none font-medium tracking-[-0.08em] text-portfolio-primary sm:text-7xl">
                                {hero.experienceYears === null
                                    ? '≈5'
                                    : `≈${hero.experienceYears}`}
                            </p>
                            <p className="mt-4 max-w-44 text-sm leading-6 text-portfolio-muted">
                                años de experiencia en desarrollo de software
                            </p>
                        </div>
                        <div className="relative flex items-end justify-between border-t border-line pt-5">
                            <span className="text-xs tracking-wide text-portfolio-muted">
                                {hero.experience}
                            </span>
                            <span className="font-mono text-xs text-portfolio-muted">
                                {identity.monogram}
                            </span>
                        </div>
                    </div>
                </aside>
            </Container>
        </section>
    );
}

export function ProjectsSection({ portfolio }: HeroProps) {
    const content = sectionContent(portfolio, 'projects');

    return (
        <Section id="projects" aria-labelledby="projects-heading">
            <Container>
                <SectionHeading
                    titleId="projects-heading"
                    eyebrow={content.eyebrow ?? ''}
                    title={content.title ?? ''}
                    description={content.description}
                    aside={
                        <span className="text-xs leading-5 text-portfolio-muted">
                            Contenido provisional
                        </span>
                    }
                />
                <div className="grid gap-4 sm:grid-cols-2 lg:gap-5">
                    {portfolio.projects.map((project, index) => (
                        <ProjectCard
                            key={project.name}
                            project={project}
                            index={index}
                        />
                    ))}
                </div>
                {portfolio.projects.length === 0 && <p className="rounded-xl border border-dashed border-line px-6 py-10 text-center text-sm text-portfolio-muted">Los proyectos destacados se publicarán aquí cuando sus fichas estén listas.</p>}
                <p className="mt-6 text-sm"><a href="/projects" className="font-medium text-portfolio-primary underline-offset-4 hover:underline">Ver todos los proyectos</a></p>
            </Container>
        </Section>
    );
}

export function ExperienceSection({ portfolio }: HeroProps) {
    const content = sectionContent(portfolio, 'experience');

    return (
        <Section
            id="experience"
            aria-labelledby="experience-heading"
            className="border-y border-line bg-surface"
        >
            <Container className="grid gap-10 md:grid-cols-12 md:gap-8">
                <div className="md:col-span-5">
                    <p className="mb-3 text-xs font-semibold tracking-[0.16em] text-portfolio-accent uppercase">
                        {content.eyebrow}
                    </p>
                    <h2
                        id="experience-heading"
                        className="max-w-md text-3xl leading-tight font-semibold tracking-[-0.04em] text-balance text-portfolio-ink sm:text-4xl"
                    >
                        {content.title}
                    </h2>
                    <p className="mt-4 max-w-md text-base leading-7 text-portfolio-muted">
                        {content.description}
                    </p>
                </div>
                <div className="md:col-span-7 md:pt-2">
                    <TimelineItem
                        label="Experiencia"
                        title={portfolio.hero.experience}
                        description={content.description ?? ''}
                        showConnector={false}
                    />
                    <div className="flex items-center gap-3 pl-0 text-xs text-portfolio-muted sm:ml-[10.25rem]">
                        <span className="h-px w-7 bg-line" aria-hidden="true" />
                        {content.note}
                    </div>
                </div>
            </Container>
        </Section>
    );
}

export function AboutSection({ portfolio }: HeroProps) {
    const content = sectionContent(portfolio, 'about');

    return (
        <Section id="about" aria-labelledby="about-heading">
            <Container className="grid gap-10 md:grid-cols-12 md:gap-8">
                <div className="md:col-span-4">
                    <p className="mb-3 text-xs font-semibold tracking-[0.16em] text-portfolio-accent uppercase">
                        {content.eyebrow}
                    </p>
                </div>
                <div className="md:col-span-8">
                    <h2
                        id="about-heading"
                        className="max-w-3xl text-3xl leading-tight font-semibold tracking-[-0.045em] text-balance text-portfolio-ink sm:text-4xl lg:text-5xl"
                    >
                        {content.title}
                    </h2>
                    <div className="mt-7 grid gap-5 sm:grid-cols-2">
                        {portfolio.about.paragraphs.map((paragraph) => (
                            <p
                                key={paragraph}
                                className="text-base leading-7 text-portfolio-muted"
                            >
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </div>
            </Container>
        </Section>
    );
}

export function StackSection({ portfolio }: HeroProps) {
    const content = sectionContent(portfolio, 'stack');

    return (
        <Section
            id="stack"
            aria-labelledby="stack-heading"
            className="border-y border-line bg-surface"
        >
            <Container>
                <SectionHeading
                    eyebrow={content.eyebrow ?? ''}
                    title={content.title ?? ''}
                    description={content.description}
                />
                <div className="grid gap-8 md:grid-cols-3 md:gap-10">
                    {portfolio.technologyGroups.map((group) => (
                        <div key={group.name}>
                            <h3 className="mb-4 text-sm font-semibold text-portfolio-ink">
                                {group.name}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {group.items.map((item) => (
                                    <TechnologyBadge key={item} name={item} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </Section>
    );
}

export function ContactSection({ portfolio }: HeroProps) {
    const { contact } = portfolio;
    const content = sectionContent(portfolio, 'contact');

    return (
        <Section id="contact" aria-labelledby="contact-heading">
            <Container>
                <div className="relative overflow-hidden rounded-portfolio-card border border-line bg-portfolio-primary px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-16 lg:py-16">
                    <span
                        aria-hidden="true"
                        className="absolute -right-10 -bottom-28 text-[clamp(12rem,32vw,25rem)] leading-none font-semibold tracking-[-0.12em] text-white/[0.045] select-none"
                    >
                        IM.
                    </span>
                    <div className="relative z-10 max-w-3xl">
                        <p className="mb-4 text-xs font-semibold tracking-[0.16em] text-teal-200 uppercase">
                            {content.eyebrow}
                        </p>
                        <h2
                            id="contact-heading"
                            className="text-3xl leading-tight font-semibold tracking-[-0.045em] text-balance sm:text-4xl lg:text-5xl"
                        >
                            {content.title}
                        </h2>
                        <p className="mt-5 max-w-xl text-base leading-7 text-white/75">
                            {content.description}
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            {contact.email ? (
                                <Button
                                    asChild
                                    className="bg-white text-portfolio-primary hover:bg-white/90"
                                >
                                    <a href={`mailto:${contact.email}`}>
                                        <Mail aria-hidden="true" />
                                        Escribir por email
                                    </a>
                                </Button>
                            ) : (
                                <Button
                                    disabled
                                    aria-label="Contacto pendiente de configurar"
                                    title="El correo de contacto está pendiente de configurar"
                                    className="cursor-not-allowed bg-white/15 text-white/75 opacity-100 hover:translate-y-0 hover:bg-white/15"
                                >
                                    Contacto pendiente
                                </Button>
                            )}
                            {contact.linkedin && (
                                <Button
                                    asChild
                                    variant="outline"
                                    className="border-white/30 bg-transparent text-white hover:border-white/50 hover:bg-white/10 hover:text-white"
                                >
                                    <a
                                        href={contact.linkedin}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        LinkedIn
                                        <ArrowUpRight aria-hidden="true" />
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </Container>
        </Section>
    );
}
