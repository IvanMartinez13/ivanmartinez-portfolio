import { ArrowDownRight, ArrowRight, ArrowUpRight, Mail } from 'lucide-react';
import { Button } from '@/components/public/button';
import { Container } from '@/components/public/container';
import { ProjectCard } from '@/components/public/project-card';
import { Section } from '@/components/public/section';
import { SectionHeading } from '@/components/public/section-heading';
import type { PortfolioContent } from '@/types/portfolio';

type HeroProps = {
    portfolio: PortfolioContent;
};

function sectionContent(
    portfolio: PortfolioContent,
    key: PortfolioContent['sections'][number]['key'],
) {
    return (
        portfolio.sections.find((section) => section.key === key)?.content ?? {}
    );
}

export function HeroSection({ portfolio }: HeroProps) {
    const { hero, identity } = portfolio;

    return (
        <section
            id="top"
            className="hero-editorial relative isolate overflow-hidden bg-portfolio-navy text-white"
        >
            <Container className="relative grid min-h-[min(850px,calc(100svh-5rem))] items-center gap-6 py-16 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:gap-0 lg:py-24">
                <div className="relative z-10 max-w-4xl">
                    <p className="mb-7 inline-flex items-center gap-3 text-xs font-semibold tracking-[0.2em] text-teal-300 uppercase">
                        <span
                            className="h-px w-10 bg-teal-300"
                            aria-hidden="true"
                        />
                        {hero.eyebrow}
                    </p>
                    <h1 className="portfolio-enter max-w-4xl text-portfolio-display leading-[0.9] font-semibold tracking-[-0.075em] text-balance">
                        {identity.name}
                        <span className="text-blue-400">.</span>
                        <span className="mt-5 block text-[0.3em] leading-tight font-medium tracking-[-0.035em] text-white/75 sm:mt-7">
                            {identity.role}
                        </span>
                    </h1>
                    <p className="mt-8 max-w-2xl text-xl leading-8 text-pretty text-white/90 sm:text-2xl sm:leading-9">
                        {hero.headline}
                    </p>
                    <p className="mt-5 max-w-xl text-base leading-7 text-white/65">
                        {hero.description}
                    </p>
                    <div className="mt-9 flex flex-wrap gap-3">
                        {portfolio.sections.some(
                            (section) =>
                                section.key === 'projects' && section.visible,
                        ) && (
                            <Button
                                asChild
                                className="border-transparent bg-blue-600 text-white hover:bg-blue-500"
                            >
                                <a href="#projects">
                                    Ver proyectos
                                    <ArrowDownRight aria-hidden="true" />
                                </a>
                            </Button>
                        )}
                        {portfolio.sections.some(
                            (section) =>
                                section.key === 'contact' && section.visible,
                        ) && (
                            <Button
                                asChild
                                variant="outline"
                                className="border-white/30 bg-transparent text-white hover:border-white hover:bg-white/10 hover:text-white"
                            >
                                <a href="#contact">
                                    Contactar
                                    <ArrowRight aria-hidden="true" />
                                </a>
                            </Button>
                        )}
                    </div>
                    <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-white/15 pt-5 text-xs tracking-wide text-white/60">
                        <span>{hero.availability}</span>
                        <span
                            className="hidden h-1 w-1 rounded-full bg-teal-300 sm:block"
                            aria-hidden="true"
                        />
                        <span>
                            {hero.experienceYears === null
                                ? '≈5'
                                : `≈${hero.experienceYears}`}{' '}
                            años en desarrollo de software
                        </span>
                    </div>
                </div>

                <aside
                    aria-label="Composición gráfica abstracta sobre sistemas digitales"
                    className="relative mx-auto w-full max-w-[36rem] lg:col-start-2 lg:row-start-1 lg:-mr-16 lg:max-w-none"
                >
                    <img
                        src="/images/hero-systems.svg"
                        alt=""
                        aria-hidden="true"
                        fetchPriority="high"
                        className="portfolio-enter w-full"
                    />
                    <div className="absolute bottom-[12%] left-[8%] border-l border-teal-300/80 pl-3 text-[10px] font-semibold tracking-[0.18em] text-white/70 uppercase">
                        Build <span className="px-1 text-teal-300">/</span> Ship{' '}
                        <span className="px-1 text-teal-300">/</span> Refine
                    </div>
                </aside>
            </Container>
            <div
                className="pointer-events-none absolute -right-32 -bottom-56 size-[34rem] rounded-full border border-white/10"
                aria-hidden="true"
            />
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
                {portfolio.projects.length === 0 && (
                    <p className="rounded-xl border border-dashed border-line px-6 py-10 text-center text-sm text-portfolio-muted">
                        Los proyectos destacados se publicarán aquí cuando sus
                        fichas estén listas.
                    </p>
                )}
                <p className="mt-6 text-sm">
                    <a
                        href="/projects"
                        className="font-medium text-portfolio-primary underline-offset-4 hover:underline"
                    >
                        Ver todos los proyectos
                    </a>
                </p>
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
            <Container className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
                <div className="lg:pt-3">
                    <p className="mb-4 text-xs font-semibold tracking-[0.17em] text-portfolio-accent uppercase">
                        {content.eyebrow}
                    </p>
                    <h2
                        id="experience-heading"
                        className="max-w-md text-portfolio-section leading-tight font-semibold tracking-[-0.05em] text-balance text-portfolio-ink"
                    >
                        {content.title}
                    </h2>
                    <p className="mt-5 max-w-md text-base leading-7 text-portfolio-muted">
                        {content.description}
                    </p>
                </div>
                <div className="relative grid grid-cols-[5rem_1fr] gap-5 border-l border-portfolio-primary/20 pl-5 sm:grid-cols-[7rem_1fr] sm:gap-8 sm:pl-8">
                    <div className="relative">
                        <span
                            aria-hidden="true"
                            className="absolute top-2 -left-[1.72rem] size-3 rounded-full border-[3px] border-surface bg-portfolio-secondary ring-1 ring-portfolio-secondary sm:-left-[2.3rem]"
                        />
                        <p className="font-mono text-[2.6rem] leading-none font-medium tracking-[-0.09em] text-portfolio-primary sm:text-5xl">
                            ≈{portfolio.hero.experienceYears ?? 5}
                        </p>
                        <p className="mt-2 text-[0.65rem] font-semibold tracking-[0.12em] text-portfolio-muted uppercase">
                            Años
                        </p>
                    </div>
                    <div className="pb-3">
                        <p className="mb-3 text-xs font-semibold tracking-[0.15em] text-portfolio-muted uppercase">
                            Trayectoria
                        </p>
                        <h3 className="text-xl font-semibold tracking-[-0.035em] text-portfolio-ink sm:text-2xl">
                            {portfolio.hero.experience}
                        </h3>
                        <p className="mt-3 max-w-xl text-sm leading-7 text-portfolio-muted sm:text-base">
                            {content.description}
                        </p>
                        <p className="mt-6 border-t border-line pt-4 text-xs leading-5 text-portfolio-muted">
                            {content.note}
                        </p>
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
                <div className="border-t border-line">
                    {portfolio.technologyGroups.map((group, index) => (
                        <div
                            key={group.name}
                            className="grid gap-3 border-b border-line py-5 sm:grid-cols-[4rem_12rem_1fr] sm:items-baseline sm:py-6"
                        >
                            <span className="font-mono text-xs text-portfolio-accent">
                                0{index + 1}
                            </span>
                            <h3 className="text-sm font-semibold tracking-wide text-portfolio-ink">
                                {group.name}
                            </h3>
                            <p className="text-sm leading-7 text-portfolio-muted">
                                {group.items.join('  /  ')}
                            </p>
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
                <div className="relative overflow-hidden rounded-portfolio-card border border-white/10 bg-portfolio-navy px-6 py-10 text-white shadow-portfolio-soft sm:px-10 sm:py-14 lg:px-16 lg:py-16">
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
                                    className="bg-white text-portfolio-navy hover:bg-white/90"
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
