import { Head, Link } from '@inertiajs/react';
import {
    ArrowDownToLine,
    ArrowUpRight,
    BriefcaseBusiness,
    Code2,
    Database,
    GraduationCap,
    Languages,
    Layers3,
    Smartphone,
    ShieldCheck,
    UsersRound,
    Wrench,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Container } from '@/components/public/container';
import {
    ArchitectureGraphic,
    EditorialTimelineItem,
} from '@/components/public/editorial-visuals';
import { ProjectCard } from '@/components/public/project-card';
import { Badge } from '@/components/public/badge';
import { Button } from '@/components/ui/button';
import PublicLayout from '@/layouts/public-layout';
import type { PortfolioProject, PublicChromeContent } from '@/types/portfolio';

type ResumeLink = { linkedin?: string; github?: string; website?: string };
type ResumeExperience = {
    id: number;
    job_title: string;
    company: string;
    location: string | null;
    started_at: string | null;
    ended_at: string | null;
    started_year: number | null;
    ended_year: number | null;
    is_current: boolean;
    description: string | null;
    responsibilities: string[];
    achievements: string[];
    technologies: {
        id: number;
        name: string;
        slug: string;
        category: string;
    }[];
    projects: PortfolioProject[];
};
type ResumeSection =
    | 'experience'
    | 'skills'
    | 'education'
    | 'certifications'
    | 'languages'
    | 'projects';
type Props = {
    profile: {
        name: string;
        headline: string;
        specialty: string;
        summary: string;
        location: string | null;
        email: string | null;
        links: ResumeLink;
        photo_url: string | null;
    };
    config: {
        section_order: ResumeSection[];
        visible_sections: ResumeSection[];
        language: string;
        theme: string;
        target_length: string;
    };
    experiences: ResumeExperience[];
    technology_groups: {
        category: string;
        items: { id: number; name: string; slug: string }[];
    }[];
    competency_groups: { category: string; items: string[] }[];
    education: {
        qualification: string;
        institution: string;
        started_at: string | null;
        ended_at: string | null;
        started_year: number | null;
        ended_year: number | null;
        description: string | null;
    }[];
    certifications: {
        name: string;
        issuer: string;
        issued_at: string | null;
        credential_url: string | null;
    }[];
    languages: {
        language: string;
        declared_level: string;
        certification_name: string | null;
        certification_url: string | null;
    }[];
    projects: PortfolioProject[];
    portfolio: PublicChromeContent;
    preview?: boolean;
    publicationVersion?: number;
    publishedAt?: string | null;
};

function dateLabel(date: string | null, locale: string) {
    if (!date) return '';
    return new Intl.DateTimeFormat(locale, {
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(new Date(`${date}T00:00:00Z`));
}

function period(
    start: string | null,
    end: string | null,
    current: boolean,
    locale: string,
    startYear: number | null = null,
    endYear: number | null = null,
) {
    const from = startYear ? String(startYear) : dateLabel(start, locale);
    const to = current
        ? locale === 'en'
            ? 'Present'
            : 'Actualidad'
        : endYear
          ? String(endYear)
          : dateLabel(end, locale);
    return [from, to].filter(Boolean).join(' — ');
}

export default function ResumePage({
    profile,
    config,
    experiences,
    technology_groups,
    competency_groups,
    education,
    certifications,
    languages,
    projects,
    portfolio,
    preview = false,
    publicationVersion,
}: Props) {
    const contactHref =
        portfolio.navigation.find((item) => /contact/i.test(item.label))
            ?.href ?? '/#main-content';
    const visible = new Set(config.visible_sections);
    const sections: Record<
        ResumeSection,
        { title: string; icon: typeof BriefcaseBusiness; content: ReactNode }
    > = {
        experience: {
            title:
                config.language === 'en'
                    ? 'Experience'
                    : 'Experiencia profesional',
            icon: BriefcaseBusiness,
            content: (
                <div className="relative ml-1 border-l border-portfolio-primary/25 pl-6 sm:ml-2 sm:pl-8">
                    {experiences.map((item, index) => (
                        <EditorialTimelineItem
                            key={item.id}
                            item={item}
                            index={index}
                        />
                    ))}
                </div>
            ),
        },
        skills: {
            title:
                config.language === 'en'
                    ? 'Technical skills'
                    : 'Competencias técnicas',
            icon: Wrench,
            content: (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {technology_groups.map((group) => (
                        <article
                            key={group.category}
                            className="rounded-2xl border border-line bg-surface p-5 sm:p-6"
                        >
                            <div className="flex items-center gap-3">
                                {(() => {
                                    const category =
                                        group.category.toLowerCase();
                                    const Icon =
                                        /backend|base|database|sql/.test(
                                            category,
                                        )
                                            ? Database
                                            : /m[oó]vil|mobile/.test(category)
                                              ? Smartphone
                                              : /arquitect|architecture/.test(
                                                      category,
                                                  )
                                                ? Layers3
                                                : /lider|lead|management/.test(
                                                        category,
                                                    )
                                                  ? UsersRound
                                                  : Code2;
                                    return (
                                        <span className="grid size-10 place-items-center rounded-xl bg-portfolio-tint text-portfolio-primary">
                                            <Icon
                                                aria-hidden="true"
                                                className="size-5"
                                            />
                                        </span>
                                    );
                                })()}
                                <h3 className="font-semibold text-portfolio-ink">
                                    {group.category}
                                </h3>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {group.items.map((technology) => (
                                    <Badge key={technology.id}>
                                        {technology.name}
                                    </Badge>
                                ))}
                            </div>
                        </article>
                    ))}
                    {competency_groups.map((group) => (
                        <article
                            key={group.category}
                            className="rounded-xl border border-line bg-surface p-5"
                        >
                            <h3 className="font-semibold text-portfolio-ink">
                                {group.category}
                            </h3>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {group.items.map((item) => (
                                    <Badge key={item}>{item}</Badge>
                                ))}
                            </div>
                        </article>
                    ))}
                </div>
            ),
        },
        education: {
            title: config.language === 'en' ? 'Education' : 'Formación',
            icon: GraduationCap,
            content: (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {education.map((item, index) => (
                        <article
                            key={`${item.institution}-${index}`}
                            className="rounded-2xl border border-line bg-surface p-5 sm:p-6"
                        >
                            <p className="text-xs font-medium text-portfolio-muted">
                                {period(
                                    item.started_at,
                                    item.ended_at,
                                    false,
                                    config.language === 'en' ? 'en' : 'es',
                                    item.started_year,
                                    item.ended_year,
                                )}
                            </p>
                            <h3 className="mt-2 font-semibold text-portfolio-ink">
                                {item.qualification}
                            </h3>
                            <p className="mt-1 text-sm text-portfolio-primary">
                                {item.institution}
                            </p>
                            {item.description && (
                                <p className="mt-3 text-sm leading-6 text-portfolio-muted">
                                    {item.description}
                                </p>
                            )}
                        </article>
                    ))}
                </div>
            ),
        },
        certifications: {
            title:
                config.language === 'en' ? 'Certifications' : 'Certificaciones',
            icon: ShieldCheck,
            content: (
                <ul className="divide-y divide-line rounded-xl border border-line bg-surface px-5">
                    {certifications.map((item, index) => (
                        <li
                            key={`${item.name}-${index}`}
                            className="flex flex-wrap items-center justify-between gap-3 py-4"
                        >
                            <div>
                                <h3 className="font-semibold text-portfolio-ink">
                                    {item.name}
                                </h3>
                                <p className="mt-1 text-sm text-portfolio-muted">
                                    {item.issuer}
                                    {item.issued_at
                                        ? ` · ${dateLabel(item.issued_at, config.language === 'en' ? 'en' : 'es')}`
                                        : ''}
                                </p>
                            </div>
                            {item.credential_url && (
                                <a
                                    href={item.credential_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-portfolio-primary hover:underline"
                                >
                                    {config.language === 'en'
                                        ? 'Verify'
                                        : 'Verificar'}
                                    <ArrowUpRight
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                </a>
                            )}
                        </li>
                    ))}
                </ul>
            ),
        },
        languages: {
            title: config.language === 'en' ? 'Languages' : 'Idiomas',
            icon: Languages,
            content: (
                <div className="grid gap-3 sm:grid-cols-2">
                    {languages.map((item, index) => (
                        <article
                            key={`${item.language}-${index}`}
                            className="flex min-w-0 items-start justify-between gap-4 rounded-2xl border border-line bg-surface p-5 sm:p-6"
                        >
                            <div>
                                <h3 className="font-semibold text-portfolio-ink">
                                    {item.language}
                                </h3>
                                {item.certification_name && (
                                    <p className="mt-1 text-sm text-portfolio-muted">
                                        {item.certification_name}
                                    </p>
                                )}
                            </div>
                            <span className="rounded-full bg-portfolio-tint px-3 py-1 text-sm text-portfolio-ink">
                                {item.declared_level}
                            </span>
                        </article>
                    ))}
                </div>
            ),
        },
        projects: {
            title:
                config.language === 'en'
                    ? 'Selected projects'
                    : 'Proyectos destacados',
            icon: BriefcaseBusiness,
            content: (
                <div className="grid gap-4 sm:grid-cols-2">
                    {projects.map((project, index) => (
                        <ProjectCard
                            key={project.slug}
                            project={project}
                            index={index}
                        />
                    ))}
                </div>
            ),
        },
    };

    return (
        <PublicLayout portfolio={portfolio}>
            <Head
                title={`${config.language === 'en' ? 'Resume' : 'Currículum'} · ${profile.name}`}
            >
                <meta name="description" content={profile.summary} />
                <meta
                    name="robots"
                    content={preview ? 'noindex,nofollow' : 'index,follow'}
                />
            </Head>
            {preview && (
                <div className="border-b border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm font-medium text-amber-900">
                    Vista previa privada · contenido todavía no publicado.
                </div>
            )}
            <main id="main-content" data-cv-theme={config.theme}>
                <section
                    className={
                        config.theme === 'minimal'
                            ? 'border-b border-line bg-surface'
                            : 'overflow-hidden bg-portfolio-navy text-white'
                    }
                >
                    <Container className="py-12 sm:py-16 lg:py-20">
                        <div
                            className={`grid items-center gap-8 ${profile.photo_url ? 'md:grid-cols-[minmax(0,1fr)_auto]' : 'lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,.9fr)]'}`}
                        >
                            <div className="min-w-0">
                                <p
                                    className={`mb-3 text-xs font-semibold tracking-[0.16em] uppercase ${config.theme === 'minimal' ? 'text-portfolio-accent' : 'text-portfolio-secondary'}`}
                                >
                                    {profile.specialty}
                                </p>
                                <h1
                                    className={`max-w-4xl text-4xl font-semibold tracking-[-0.055em] text-balance sm:text-5xl lg:text-7xl ${config.theme === 'minimal' ? 'text-portfolio-ink' : 'text-white'}`}
                                >
                                    {profile.name}
                                </h1>
                                <p
                                    className={`mt-3 text-xl font-medium sm:text-2xl ${config.theme === 'minimal' ? 'text-portfolio-primary' : 'text-white/85'}`}
                                >
                                    {profile.headline}
                                </p>
                                <p
                                    className={`mt-5 max-w-3xl text-base leading-8 sm:text-lg ${config.theme === 'minimal' ? 'text-portfolio-muted' : 'text-white/75'}`}
                                >
                                    {profile.summary}
                                </p>
                                {profile.location && (
                                    <p
                                        className={`mt-3 text-sm ${config.theme === 'minimal' ? 'text-portfolio-muted' : 'text-white/65'}`}
                                    >
                                        {profile.location}
                                    </p>
                                )}
                                <div className="mt-7 flex flex-wrap gap-3">
                                    {!preview && (
                                        <>
                                            <Button
                                                asChild
                                                className={
                                                    config.theme === 'minimal'
                                                        ? ''
                                                        : 'border-0 bg-white text-portfolio-navy hover:bg-white/90'
                                                }
                                            >
                                                <a href="/cv/pdf/professional">
                                                    <ArrowDownToLine className="mr-2 size-4" />
                                                    {config.language === 'en'
                                                        ? 'Download PDF'
                                                        : 'Descargar CV PDF'}
                                                </a>
                                            </Button>
                                            <Button
                                                asChild
                                                variant="outline"
                                                className={
                                                    config.theme === 'minimal'
                                                        ? ''
                                                        : 'border-white/35 bg-transparent text-white hover:bg-white/10 hover:text-white'
                                                }
                                            >
                                                <a href="/cv/pdf/ats">
                                                    {config.language === 'en'
                                                        ? 'ATS version'
                                                        : 'Versión ATS'}
                                                </a>
                                            </Button>
                                        </>
                                    )}
                                    <Button
                                        asChild
                                        variant="ghost"
                                        className={
                                            config.theme === 'minimal'
                                                ? ''
                                                : 'text-white hover:bg-white/10 hover:text-white'
                                        }
                                    >
                                        <a href={contactHref}>
                                            {config.language === 'en'
                                                ? 'Contact'
                                                : 'Contactar'}
                                            <ArrowUpRight className="ml-2 size-4" />
                                        </a>
                                    </Button>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                                    {profile.email && (
                                        <a
                                            href={`mailto:${profile.email}`}
                                            className={`text-sm font-medium hover:underline ${config.theme === 'minimal' ? 'text-portfolio-primary' : 'text-white/85'}`}
                                        >
                                            {profile.email}
                                        </a>
                                    )}
                                    {Object.entries(profile.links).map(
                                        ([key, url]) =>
                                            url && (
                                                <a
                                                    key={key}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`inline-flex min-h-10 items-center gap-1 text-sm font-medium hover:underline ${config.theme === 'minimal' ? 'text-portfolio-primary' : 'text-white/85'}`}
                                                >
                                                    {key}
                                                    <ArrowUpRight
                                                        aria-hidden="true"
                                                        className="size-3.5"
                                                    />
                                                </a>
                                            ),
                                    )}
                                </div>
                            </div>
                            {profile.photo_url ? (
                                <img
                                    src={profile.photo_url}
                                    alt={profile.name}
                                    className="mx-auto size-36 rounded-2xl border border-white/15 object-cover md:size-52"
                                />
                            ) : config.theme !== 'minimal' ? (
                                <div className="mx-auto w-full max-w-[26rem] opacity-90">
                                    <ArchitectureGraphic />
                                </div>
                            ) : null}
                        </div>
                    </Container>
                </section>
                <Container className="py-10 sm:py-14">
                    <nav
                        aria-label="Secciones del currículum"
                        className="mb-10 flex flex-wrap gap-2"
                    >
                        {config.section_order
                            .filter(
                                (section) =>
                                    visible.has(section) &&
                                    hasContent(
                                        section,
                                        experiences.length,
                                        technology_groups.length +
                                            competency_groups.length,
                                        education.length,
                                        certifications.length,
                                        languages.length,
                                        projects.length,
                                    ),
                            )
                            .map((section) => (
                                <a
                                    key={section}
                                    href={`#resume-${section}`}
                                    className="inline-flex min-h-10 items-center rounded-full border border-line bg-surface px-4 text-sm font-medium text-portfolio-muted hover:border-portfolio-primary hover:text-portfolio-primary focus-visible:outline-2 focus-visible:outline-portfolio-accent"
                                >
                                    {sections[section].title}
                                </a>
                            ))}
                    </nav>
                    <div className="space-y-12 sm:space-y-16">
                        {config.section_order
                            .filter((section) => visible.has(section))
                            .map((section) => {
                                const item = sections[section];
                                const Icon = item.icon;
                                if (
                                    !hasContent(
                                        section,
                                        experiences.length,
                                        technology_groups.length +
                                            competency_groups.length,
                                        education.length,
                                        certifications.length,
                                        languages.length,
                                        projects.length,
                                    )
                                )
                                    return null;
                                return (
                                    <section
                                        key={section}
                                        id={`resume-${section}`}
                                        className="scroll-mt-28"
                                    >
                                        <div className="mb-5 flex items-center gap-3">
                                            <span className="grid size-10 place-items-center rounded-xl bg-portfolio-tint text-portfolio-primary">
                                                <Icon
                                                    aria-hidden="true"
                                                    className="size-5"
                                                />
                                            </span>
                                            <h2 className="text-2xl font-semibold tracking-tight text-portfolio-ink sm:text-3xl">
                                                {item.title}
                                            </h2>
                                        </div>
                                        {item.content}
                                    </section>
                                );
                            })}
                    </div>
                </Container>
            </main>
            {preview && (
                <div className="fixed right-4 bottom-4 z-40">
                    <Button asChild>
                        <Link href="/admin/resume">Volver a editar</Link>
                    </Button>
                </div>
            )}
            {preview && (
                <span className="sr-only">
                    Vista previa de la versión actual del editor.
                </span>
            )}
            {publicationVersion && !preview && (
                <span className="sr-only">
                    Versión publicada {publicationVersion}
                </span>
            )}
        </PublicLayout>
    );
}

function hasContent(
    section: ResumeSection,
    experienceCount: number,
    skillGroupCount: number,
    educationCount: number,
    certificationCount: number,
    languageCount: number,
    projectCount: number,
): boolean {
    return (
        {
            experience: experienceCount,
            skills: skillGroupCount,
            education: educationCount,
            certifications: certificationCount,
            languages: languageCount,
            projects: projectCount,
        }[section] > 0
    );
}
