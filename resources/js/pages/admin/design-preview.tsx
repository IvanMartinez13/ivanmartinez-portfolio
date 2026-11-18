import { Head } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    Braces,
    Code2,
    Layers3,
    Menu,
    X,
} from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import {
    ArchitectureGraphic as SharedArchitectureGraphic,
    EditorialProjectCard,
    EditorialProfileVisual,
    EditorialSectionHeading,
    EditorialTimelineItem,
} from '@/components/public/editorial-visuals';

type Project = {
    name: string;
    slug: string;
    category: string;
    description: string;
    monogram: string;
    imageUrl: string | null;
    imageAlt: string | null;
    technologies: string[];
    isFeatured: boolean;
    demo?: boolean;
    visualColor?: string | null;
};
type TechnologyGroup = {
    category: string;
    items: { id: number; name: string; slug: string }[];
};
type Experience = {
    id: number;
    job_title: string;
    company: string;
    location: string | null;
    started_at: string | null;
    ended_at: string | null;
    is_current: boolean;
    description: string;
    responsibilities: string[];
    achievements: string[];
    technologies: { id: number; name: string; slug: string }[];
    projects: Project[];
    demo?: boolean;
};
type Props = {
    identity: {
        name: string;
        monogram: string;
        role: string;
        specialty: string;
        photoUrl: string | null;
    };
    headline: string;
    description: string;
    about: { eyebrow: string; title: string; paragraphs: string[] };
    contact: {
        description: string;
        email: string | null;
        linkedin: string | null;
        github: string | null;
        website: string | null;
    };
    resume: { published: boolean; experiences: Experience[] };
    technologies: TechnologyGroup[];
    projects: Project[];
};

const palette = {
    navy: '#101C31',
    blue: '#2459E0',
    turquoise: '#17B6A4',
    canvas: '#EFF3F9',
    white: '#FFFFFF',
    ink: '#15243B',
    muted: '#64748B',
};

const demoProjects: Project[] = [
    {
        name: 'Producto digital · ejemplo',
        slug: 'preview-demo-producto-digital',
        category: 'DEMO PRIVADA',
        description:
            'Contenido ficticio de demostración para evaluar la composición. No representa un proyecto publicado.',
        monogram: 'DEMO',
        imageUrl: null,
        imageAlt: null,
        technologies: ['Laravel', 'React'],
        isFeatured: false,
        visualColor: '#30527E',
        demo: true,
    },
    {
        name: 'Sistema de gestión · ejemplo',
        slug: 'preview-demo-sistema-gestion',
        category: 'DEMO PRIVADA',
        description:
            'Tarjeta de muestra sin métricas ni resultados atribuidos a un cliente real.',
        monogram: 'SYS',
        imageUrl: null,
        imageAlt: null,
        technologies: ['TypeScript', 'PostgreSQL'],
        isFeatured: false,
        visualColor: '#315E60',
        demo: true,
    },
];

const demoExperiences: Experience[] = [
    {
        id: -1,
        job_title: 'Experiencia de muestra · no publicada',
        company: 'Empresa de demostración',
        location: 'Solo para previsualización',
        started_at: null,
        ended_at: null,
        is_current: false,
        description:
            'Este contenido ficticio existe únicamente para evaluar el diseño de la timeline. No describe la trayectoria real.',
        responsibilities: [
            'Ejemplo de responsabilidad para revisar la jerarquía y la lectura en varias líneas.',
        ],
        achievements: [
            'Ejemplo de aportación demostrativa, sin resultados ni métricas reales.',
        ],
        technologies: [
            { id: -1, name: 'Laravel', slug: 'demo-laravel' },
            { id: -2, name: 'React', slug: 'demo-react' },
        ],
        projects: [],
        demo: true,
    },
];

const demoTechnologies: TechnologyGroup[] = [
    {
        category: 'Aplicaciones web · demo',
        items: [
            { id: -1, name: 'Laravel', slug: 'demo-laravel' },
            { id: -2, name: 'React', slug: 'demo-react' },
            { id: -3, name: 'TypeScript', slug: 'demo-typescript' },
        ],
    },
    {
        category: 'Datos e infraestructura · demo',
        items: [
            { id: -4, name: 'PostgreSQL', slug: 'demo-postgresql' },
            { id: -5, name: 'Docker', slug: 'demo-docker' },
        ],
    },
];

export default function DesignPreview({
    identity,
    headline,
    description,
    about,
    contact,
    resume,
    technologies,
    projects,
}: Props) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [demoEnabled, setDemoEnabled] = useState(false);
    const displayProjects = demoEnabled
        ? [...projects, ...demoProjects]
        : projects;
    const displayExperiences = resume.published
        ? resume.experiences
        : demoEnabled
          ? demoExperiences
          : [];
    const displayTechnologies =
        technologies.length > 0
            ? technologies
            : demoEnabled
              ? demoTechnologies
              : [];
    const primaryHref = resume.published ? '/cv' : '/projects';
    const primaryLabel = resume.published
        ? 'Explorar mi trayectoria'
        : 'Ver proyectos';
    const nav = [
        { label: 'Proyectos', href: '#work' },
        { label: 'Trayectoria', href: '#trajectory' },
        { label: 'Sobre mí', href: '#about' },
        { label: 'Stack', href: '#stack' },
        { label: 'Contacto', href: '#contact' },
    ];
    const style = {
        '--preview-navy': palette.navy,
        '--preview-blue': palette.blue,
        '--preview-turquoise': palette.turquoise,
        '--preview-canvas': palette.canvas,
        '--preview-ink': palette.ink,
        '--preview-muted': palette.muted,
    } as CSSProperties;

    return (
        <div
            style={style}
            className="min-h-screen overflow-x-clip bg-[var(--preview-canvas)] font-sans text-[var(--preview-ink)] antialiased selection:bg-[#17B6A4] selection:text-[#101C31]"
        >
            <Head title="Prototipo visual · ivanmartinez.dev">
                <meta name="robots" content="noindex,nofollow" />
            </Head>
            <div className="flex min-h-10 flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-[#17B6A4] px-4 py-2 text-center text-xs font-semibold tracking-wide text-[#101C31] sm:text-sm">
                <span className="inline-flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-[#101C31]" />
                    PREVISUALIZACIÓN PRIVADA
                </span>
                <span className="hidden h-4 w-px bg-[#101C31]/25 sm:block" />
                <span>No modifica la portada pública</span>
                <a
                    href="/admin"
                    className="ml-1 underline underline-offset-4 hover:no-underline"
                >
                    Volver al CMS
                </a>
                <label className="ml-2 inline-flex min-h-8 cursor-pointer items-center gap-2 rounded-full border border-[#101C31]/25 px-3 font-semibold">
                    <input
                        type="checkbox"
                        checked={demoEnabled}
                        onChange={(event) =>
                            setDemoEnabled(event.target.checked)
                        }
                        className="size-4 accent-[#101C31]"
                    />
                    Ejemplos de demostración
                </label>
            </div>
            <a
                href="#main-content"
                className="sr-only z-50 rounded-md bg-white px-4 py-3 text-[#101C31] focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:ring-2 focus:ring-[#2459E0] focus:outline-none"
            >
                Saltar al contenido
            </a>

            <header className="relative z-30 border-b border-[#D8E0EB] bg-white">
                <nav
                    aria-label="Navegación del prototipo"
                    className="mx-auto flex h-[4.5rem] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:h-[5.25rem] lg:px-12"
                >
                    <a
                        href="#top"
                        aria-label="Iván Martínez, inicio"
                        className="group inline-flex items-center gap-3 text-sm font-semibold tracking-tight text-[#101C31]"
                    >
                        <span className="grid size-10 place-items-center rounded-full bg-[#101C31] font-mono text-sm text-white transition-transform duration-300 group-hover:rotate-[-8deg]">
                            IM
                        </span>
                        <span className="hidden sm:inline">
                            ivanmartinez
                            <span className="text-[#2459E0]">.dev</span>
                        </span>
                    </a>
                    <div className="hidden items-center gap-7 lg:flex">
                        {nav.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className="text-sm font-medium text-[#526079] transition-colors hover:text-[#2459E0]"
                            >
                                {item.label}
                            </a>
                        ))}
                        {resume.published && (
                            <a
                                href="/cv"
                                className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#2459E0] px-5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#1949C5]"
                            >
                                Mi CV{' '}
                                <ArrowUpRight
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            </a>
                        )}
                    </div>
                    <button
                        type="button"
                        aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                        aria-expanded={menuOpen}
                        aria-controls="preview-mobile-navigation"
                        onClick={() => setMenuOpen((open) => !open)}
                        className="grid size-10 place-items-center rounded-full border border-[#D8E0EB] text-[#101C31] lg:hidden"
                    >
                        {menuOpen ? (
                            <X aria-hidden="true" className="size-5" />
                        ) : (
                            <Menu aria-hidden="true" className="size-5" />
                        )}
                    </button>
                </nav>
                {menuOpen && (
                    <div
                        id="preview-mobile-navigation"
                        className="border-t border-[#D8E0EB] bg-white px-5 py-3 lg:hidden"
                    >
                        <div className="mx-auto flex max-w-[1440px] flex-col">
                            {nav.map((item) => (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMenuOpen(false)}
                                    className="flex min-h-11 items-center border-b border-[#EEF1F5] text-sm font-medium text-[#526079]"
                                >
                                    {item.label}
                                </a>
                            ))}
                            {resume.published && (
                                <a
                                    href="/cv"
                                    onClick={() => setMenuOpen(false)}
                                    className="mt-3 flex min-h-11 items-center justify-center rounded-full bg-[#2459E0] text-sm font-semibold text-white"
                                >
                                    Mi CV
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </header>

            <main id="main-content">
                <section
                    id="top"
                    className="relative isolate overflow-hidden bg-[#101C31] text-white"
                >
                    <div className="mx-auto grid min-h-[680px] max-w-[1440px] items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:min-h-[760px] lg:grid-cols-[1.03fr_.97fr] lg:gap-2 lg:px-12 lg:py-24">
                        <div className="relative z-10 max-w-3xl">
                            <p className="mb-7 inline-flex items-center gap-3 text-xs font-semibold tracking-[0.2em] text-[#17B6A4] uppercase sm:text-sm">
                                <span
                                    className="h-px w-10 bg-[#17B6A4]"
                                    aria-hidden="true"
                                />
                                {identity.specialty}
                            </p>
                            <h1 className="max-w-4xl text-[clamp(3.5rem,10.8vw,9.4rem)] leading-[.84] font-semibold tracking-[-.075em] text-balance">
                                {identity.name
                                    .split(/\s+/)
                                    .map((part, index) => (
                                        <span
                                            key={`${part}-${index}`}
                                            className="block"
                                        >
                                            {part}
                                            {index ===
                                                identity.name.split(/\s+/)
                                                    .length -
                                                    1 && (
                                                <span className="text-[#17B6A4]">
                                                    .
                                                </span>
                                            )}
                                        </span>
                                    ))}
                            </h1>
                            <p className="mt-6 text-lg font-medium tracking-[-.02em] text-white/60 sm:text-xl">
                                {identity.role}
                            </p>
                            <p className="mt-8 max-w-2xl text-xl leading-8 text-pretty text-white/95 sm:text-2xl sm:leading-9">
                                {headline}
                            </p>
                            <p className="mt-5 max-w-xl text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
                                {description}
                            </p>
                            <div className="mt-9 flex flex-wrap items-center gap-3">
                                <a
                                    href={primaryHref}
                                    className="inline-flex min-h-12 items-center gap-3 rounded-full bg-[#2459E0] px-6 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#3568EA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17B6A4]"
                                >
                                    {primaryLabel}
                                    <ArrowDownRight
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                </a>
                                {resume.published && (
                                    <a
                                        href="/projects"
                                        className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/25 px-6 text-sm font-semibold text-white transition-colors hover:border-white/70 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17B6A4]"
                                    >
                                        Ver proyectos
                                        <ArrowRight
                                            aria-hidden="true"
                                            className="size-4"
                                        />
                                    </a>
                                )}
                                {!resume.published && (
                                    <a
                                        href="#contact"
                                        className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/25 px-6 text-sm font-semibold text-white transition-colors hover:border-white/70 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17B6A4]"
                                    >
                                        Contactar
                                        <ArrowRight
                                            aria-hidden="true"
                                            className="size-4"
                                        />
                                    </a>
                                )}
                            </div>
                            <div className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/15 pt-5 text-xs font-medium tracking-wide text-white/55 sm:text-sm">
                                <span>{identity.role}</span>
                                <span
                                    className="size-1 rounded-full bg-[#17B6A4]"
                                    aria-hidden="true"
                                />
                                <span>Portfolio profesional</span>
                            </div>
                        </div>
                        <ArchitectureGraphic />
                    </div>
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-44 -bottom-64 size-[36rem] rounded-full border border-white/[.07]"
                    />
                </section>

                <section
                    id="work"
                    className="scroll-mt-20 py-20 sm:py-28 lg:py-36"
                >
                    <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
                        <SectionHeading
                            eyebrow="01 / Trabajo seleccionado"
                            title="Proyectos con propósito."
                            description="Productos y sistemas digitales construidos para resolver necesidades reales."
                        />
                        {demoEnabled && (
                            <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#DBEAFE] px-3 py-1.5 text-xs font-semibold text-[#1E40AF]">
                                <span className="size-1.5 rounded-full bg-[#2459E0]" />
                                Las tarjetas con la etiqueta DEMO son muestras
                                privadas y no están publicadas.
                            </p>
                        )}
                        {displayProjects.length > 0 ? (
                            <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-9 md:grid-cols-2 lg:grid-cols-12 lg:gap-y-16">
                                {displayProjects.map((project, index) => (
                                    <ProjectFeature
                                        key={project.slug}
                                        project={project}
                                        index={index}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="mt-12 rounded-2xl border border-dashed border-[#C9D4E2] bg-white/60 p-8 text-sm text-[#64748B]">
                                Aún no hay proyectos publicados. Activa los
                                ejemplos privados para revisar el diseño.
                            </div>
                        )}
                    </div>
                </section>

                <section
                    id="trajectory"
                    className="scroll-mt-20 border-y border-[#DDE4ED] bg-white py-20 sm:py-28 lg:py-32"
                >
                    <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
                        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
                            <div className="max-w-xl">
                                <p className="mb-4 text-xs font-bold tracking-[.18em] text-[#2459E0] uppercase">
                                    02 / Trayectoria
                                </p>
                                <h2 className="text-4xl leading-[.98] font-semibold tracking-[-.06em] text-balance text-[#101C31] sm:text-5xl lg:text-6xl">
                                    Experiencia que conecta producto y
                                    tecnología.
                                </h2>
                                <p className="mt-6 text-base leading-7 text-[#64748B]">
                                    Una mirada concreta al trabajo y las
                                    competencias profesionales.
                                </p>
                                {resume.published && (
                                    <a
                                        href="/cv"
                                        className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#2459E0] px-5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#1949C5]"
                                    >
                                        Ver currículum completo
                                        <ArrowUpRight
                                            aria-hidden="true"
                                            className="size-4"
                                        />
                                    </a>
                                )}
                                {!resume.published && demoEnabled && (
                                    <p className="mt-6 text-xs font-semibold tracking-wide text-[#2459E0]">
                                        DEMO PRIVADA · EXPERIENCIA FICTICIA
                                    </p>
                                )}
                            </div>
                            <div className="relative pl-4 sm:pl-6">
                                {displayExperiences.length > 0 ? (
                                    <div className="border-l border-[#C9D4E2] pl-5 sm:pl-8">
                                        {displayExperiences.map(
                                            (item, index) => (
                                                <ExperienceCard
                                                    key={`${item.id}-${index}`}
                                                    item={item}
                                                    index={index}
                                                />
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-dashed border-[#C9D4E2] bg-[#EFF3F9]/70 p-6 text-sm leading-6 text-[#64748B]">
                                        La trayectoria publicada aparecerá aquí
                                        cuando exista una versión pública del
                                        currículum. Activa los ejemplos privados
                                        para probar la timeline.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    id="about"
                    className="scroll-mt-20 py-20 sm:py-28 lg:py-32"
                >
                    <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 sm:px-8 lg:grid-cols-[.72fr_1.28fr] lg:gap-20 lg:px-12">
                        <div>
                            <p className="mb-4 text-xs font-bold tracking-[.18em] text-[#2459E0] uppercase">
                                03 / Sobre mí
                            </p>
                            <p className="text-sm font-medium text-[#64748B]">
                                {about.eyebrow}
                            </p>
                            <AboutVisual
                                name={identity.name}
                                role={identity.role}
                                specialty={identity.specialty}
                                photoUrl={identity.photoUrl}
                            />
                        </div>
                        <div>
                            <h2 className="max-w-4xl text-4xl leading-[1.02] font-semibold tracking-[-.055em] text-balance text-[#101C31] sm:text-5xl lg:text-6xl">
                                {about.title || 'Tecnología con intención.'}
                            </h2>
                            <div className="mt-7 max-w-3xl space-y-5">
                                {about.paragraphs.map((paragraph, index) => (
                                    <p
                                        key={index}
                                        className="text-base leading-8 text-[#526079] sm:text-lg"
                                    >
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    id="stack"
                    className="scroll-mt-20 border-y border-[#DDE4ED] bg-white py-20 sm:py-28 lg:py-32"
                >
                    <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
                        <SectionHeading
                            eyebrow="04 / Herramientas"
                            title="Un stack para construir y hacer crecer."
                            description="Tecnologías visibles en el catálogo del portfolio, agrupadas por disciplina."
                        />
                        {demoEnabled && technologies.length === 0 && (
                            <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#DBEAFE] px-3 py-1.5 text-xs font-semibold text-[#1E40AF]">
                                Tecnologías de muestra · solo en esta preview
                            </p>
                        )}
                        {displayTechnologies.length > 0 ? (
                            <div className="mt-12 divide-y divide-[#DDE4ED] border-y border-[#DDE4ED]">
                                {displayTechnologies.map((group, index) => (
                                    <article
                                        key={group.category}
                                        className="grid gap-4 py-6 sm:grid-cols-[4.5rem_.75fr_1.25fr] sm:items-start sm:gap-6 sm:py-8"
                                    >
                                        <span className="font-mono text-xs font-semibold tracking-widest text-[#2459E0]">
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#EFF3F9] text-[#2459E0]">
                                                {index % 3 === 0 ? (
                                                    <Code2
                                                        aria-hidden="true"
                                                        className="size-4"
                                                    />
                                                ) : index % 3 === 1 ? (
                                                    <Layers3
                                                        aria-hidden="true"
                                                        className="size-4"
                                                    />
                                                ) : (
                                                    <Braces
                                                        aria-hidden="true"
                                                        className="size-4"
                                                    />
                                                )}
                                            </span>
                                            <h3 className="text-lg font-semibold tracking-[-.025em] text-[#101C31]">
                                                {group.category}
                                            </h3>
                                        </div>
                                        <ul className="flex flex-wrap gap-2 sm:justify-end">
                                            {group.items.map((technology) => (
                                                <li
                                                    key={technology.slug}
                                                    className="rounded-full border border-[#DDE4ED] bg-white px-3.5 py-2 text-xs font-medium text-[#334155]"
                                                >
                                                    {technology.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-10 text-sm text-[#64748B]">
                                No hay tecnologías visibles en el catálogo.
                                Activa los ejemplos privados para revisar esta
                                sección.
                            </p>
                        )}
                    </div>
                </section>

                <section
                    id="contact"
                    className="scroll-mt-20 bg-[#101C31] py-20 text-white sm:py-28 lg:py-32"
                >
                    <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
                        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
                            <div className="max-w-4xl">
                                <p className="mb-4 text-xs font-bold tracking-[.18em] text-[#17B6A4] uppercase">
                                    05 / Contacto
                                </p>
                                <h2 className="text-5xl leading-[.92] font-semibold tracking-[-.065em] text-balance sm:text-6xl lg:text-8xl">
                                    Hablemos de lo que podemos construir.
                                </h2>
                                <p className="mt-6 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
                                    {contact.description}
                                </p>
                            </div>
                            {primaryContact(contact) && (
                                <a
                                    href={primaryContact(contact)!}
                                    className="inline-flex min-h-12 w-fit items-center gap-3 rounded-full bg-[#17B6A4] px-6 text-sm font-bold text-[#101C31] transition duration-200 hover:-translate-y-0.5 hover:bg-[#39C7B7]"
                                >
                                    {contact.email
                                        ? 'Escríbeme'
                                        : 'Conectar profesionalmente'}
                                    <ArrowUpRight
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                </a>
                            )}
                        </div>
                        <div className="mt-14 flex flex-wrap gap-x-7 gap-y-3 border-t border-white/15 pt-6 text-sm text-white/65">
                            {contact.email && (
                                <a
                                    href={`mailto:${contact.email}`}
                                    className="hover:text-white"
                                >
                                    {contact.email}
                                </a>
                            )}
                            {contact.linkedin && (
                                <ExternalLink
                                    href={contact.linkedin}
                                    label="LinkedIn"
                                />
                            )}
                            {contact.github && (
                                <ExternalLink
                                    href={contact.github}
                                    label="GitHub"
                                />
                            )}
                            {contact.website && (
                                <ExternalLink
                                    href={contact.website}
                                    label="Sitio web"
                                />
                            )}
                        </div>
                    </div>
                </section>
            </main>
            <footer className="bg-[#101C31] px-5 pb-8 text-xs text-white/45 sm:px-8 lg:px-12">
                <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                    <span>
                        {identity.name} · {identity.role}
                    </span>
                    <a href="#top" className="hover:text-white">
                        Volver arriba ↑
                    </a>
                </div>
            </footer>
        </div>
    );
}

function SectionHeading({
    eyebrow,
    title,
    description,
}: {
    eyebrow: string;
    title: string;
    description: string;
}) {
    return (
        <EditorialSectionHeading
            eyebrow={eyebrow}
            title={title}
            description={description}
        />
    );
}

function ArchitectureGraphic() {
    return <SharedArchitectureGraphic />;
}

function ProjectFeature({
    project,
    index,
}: {
    project: Project;
    index: number;
}) {
    return <EditorialProjectCard project={project} index={index} />;
}

function ExperienceCard({ item, index }: { item: Experience; index: number }) {
    return <EditorialTimelineItem item={item} index={index} />;
}

function AboutVisual({
    name,
    role,
    specialty,
    photoUrl,
}: {
    name: string;
    role: string;
    specialty: string;
    photoUrl: string | null;
}) {
    return (
        <EditorialProfileVisual
            name={name}
            role={role}
            specialty={specialty}
            photoUrl={photoUrl}
        />
    );
}

function ExternalLink({ href, label }: { href: string; label: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 hover:text-white"
        >
            {label}
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </a>
    );
}

function primaryContact(contact: Props['contact']): string | null {
    if (contact.email) return `mailto:${contact.email}`;
    return contact.linkedin || contact.github || contact.website || null;
}
