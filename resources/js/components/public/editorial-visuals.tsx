import { ArrowUpRight } from 'lucide-react';
import type { PortfolioProject } from '@/types/portfolio';

export type EditorialProject = PortfolioProject & { demo?: boolean };
export type EditorialExperience = {
    id: number;
    job_title: string;
    company: string;
    location?: string | null;
    started_at?: string | null;
    ended_at?: string | null;
    started_year?: number | null;
    ended_year?: number | null;
    is_current?: boolean;
    description?: string | null;
    responsibilities?: string[];
    achievements?: string[];
    technologies?: { id: number; name: string; slug: string }[];
    projects?: EditorialProject[];
    demo?: boolean;
};

const fallbackColors = [
    'var(--portfolio-primary)',
    'var(--portfolio-secondary)',
    'var(--portfolio-navy)',
    'var(--portfolio-muted)',
];

export function ArchitectureGraphic({
    graphic = 'orbital',
}: {
    graphic?: string;
}) {
    return (
        <div
            aria-hidden="true"
            className="relative mx-auto mt-4 w-full max-w-[36rem] lg:mt-0 lg:max-w-none"
        >
            <svg
                viewBox="0 0 600 540"
                className="relative w-full overflow-visible"
                fill="none"
            >
                {graphic === 'grid' && (
                    <path
                        d="M0 90h600M0 180h600M0 270h600M0 360h600M0 450h600M100 0v540M200 0v540M300 0v540M400 0v540M500 0v540"
                        stroke="var(--portfolio-line)"
                        strokeOpacity=".38"
                    />
                )}
                {graphic === 'lines' && (
                    <path
                        d="M20 440 160 300l80 80 140-190 80 90 120-150M20 490h560"
                        stroke="var(--portfolio-secondary)"
                        strokeOpacity=".7"
                        strokeWidth="2"
                    />
                )}
                {graphic !== 'grid' && graphic !== 'lines' && (
                    <>
                        <circle
                            cx="300"
                            cy="260"
                            r="210"
                            stroke="var(--portfolio-line)"
                            strokeOpacity=".38"
                        />
                        <circle
                            cx="300"
                            cy="260"
                            r="150"
                            stroke="var(--portfolio-line)"
                            strokeOpacity=".24"
                        />
                        <path
                            d="M86 172h125v92h122v-60h144M211 264v124h122v-64h144M86 172v158h64m186 58h141"
                            stroke="var(--portfolio-muted)"
                            strokeOpacity=".7"
                            strokeWidth="1.5"
                        />
                        <path
                            d="M86 172h125v92h122v-60h144"
                            stroke="var(--portfolio-secondary)"
                            strokeWidth="2"
                            strokeDasharray="5 8"
                        />
                        <rect
                            x="34"
                            y="120"
                            width="104"
                            height="104"
                            rx="24"
                            fill="var(--portfolio-surface)"
                            fillOpacity=".08"
                            stroke="var(--portfolio-line)"
                        />
                        <rect
                            x="163"
                            y="210"
                            width="104"
                            height="108"
                            rx="24"
                            fill="var(--portfolio-primary)"
                        />
                        <rect
                            x="281"
                            y="158"
                            width="104"
                            height="104"
                            rx="24"
                            fill="var(--portfolio-surface)"
                            fillOpacity=".08"
                            stroke="var(--portfolio-line)"
                        />
                        <rect
                            x="425"
                            y="120"
                            width="104"
                            height="104"
                            rx="24"
                            fill="var(--portfolio-surface)"
                            fillOpacity=".08"
                            stroke="var(--portfolio-line)"
                        />
                        <rect
                            x="281"
                            y="330"
                            width="104"
                            height="104"
                            rx="24"
                            fill="var(--portfolio-surface)"
                            fillOpacity=".08"
                            stroke="var(--portfolio-line)"
                        />
                        <rect
                            x="425"
                            y="278"
                            width="104"
                            height="104"
                            rx="24"
                            fill="var(--portfolio-secondary)"
                            fillOpacity=".2"
                            stroke="var(--portfolio-secondary)"
                        />
                        <circle
                            cx="86"
                            cy="172"
                            r="7"
                            fill="var(--portfolio-secondary)"
                        />
                        <circle
                            cx="333"
                            cy="264"
                            r="7"
                            fill="var(--portfolio-secondary)"
                        />
                        <circle
                            cx="477"
                            cy="206"
                            r="7"
                            fill="var(--portfolio-secondary)"
                        />
                        <circle
                            cx="477"
                            cy="382"
                            r="7"
                            fill="var(--portfolio-secondary)"
                        />
                        <path
                            d="M69 175h34M86 158v34M194 251h42M194 265h42M194 279h25M311 200h42M311 214h28M311 372h42M311 386h28M451 162h42M451 176h28M451 320h42M451 334h27"
                            stroke="white"
                            strokeOpacity=".75"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                    </>
                )}
                <text
                    x="105"
                    y="486"
                    fill="var(--portfolio-muted)"
                    fontSize="11"
                    fontFamily="monospace"
                    letterSpacing="3"
                >
                    PRODUCT / SYSTEM / DELIVERY
                </text>
            </svg>
            {graphic === 'orbital' && (
                <span className="absolute right-[4%] bottom-[8%] hidden items-center gap-2 rounded-full border border-white/15 bg-portfolio-navy px-4 py-2 text-xs font-medium text-white/75 sm:flex">
                    <span className="size-2 rounded-full bg-portfolio-secondary" />
                    Full Stack Development
                </span>
            )}
        </div>
    );
}

export function EditorialSectionHeading({
    eyebrow,
    title,
    description,
}: {
    eyebrow: string;
    title: string;
    description?: string;
}) {
    return (
        <div className="grid gap-4 lg:grid-cols-[1fr_.7fr] lg:items-end">
            <div>
                <p className="mb-4 text-xs font-bold tracking-[.18em] text-portfolio-accent uppercase">
                    {eyebrow}
                </p>
                <h2 className="max-w-3xl text-[length:var(--portfolio-font-section)] leading-[.98] font-semibold tracking-[-.06em] text-balance text-portfolio-ink">
                    {title}
                </h2>
            </div>
            {description && (
                <p className="max-w-lg text-base leading-7 text-portfolio-muted lg:justify-self-end">
                    {description}
                </p>
            )}
        </div>
    );
}

export function EditorialProjectCard({
    project,
    index,
    asymmetric = true,
}: {
    project: EditorialProject;
    index: number;
    asymmetric?: boolean;
}) {
    const color =
        project.visualColor || fallbackColors[index % fallbackColors.length];
    const content = (
        <>
            <div
                className="relative isolate flex aspect-[1.42] min-h-64 items-end overflow-hidden rounded-[var(--portfolio-radius-card)] p-5 text-white sm:p-8"
                style={{ backgroundColor: color }}
            >
                {project.imageUrl ? (
                    <img
                        src={project.imageUrl}
                        alt={project.imageAlt || project.name}
                        loading="lazy"
                        className="absolute inset-0 -z-10 size-full object-cover transition-transform duration-[var(--portfolio-transition)] motion-safe:group-hover:scale-[1.025]"
                    />
                ) : (
                    <ProjectArtwork project={project} index={index} />
                )}
                <div className="absolute inset-0 -z-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute top-5 left-5 flex flex-wrap gap-2 sm:top-7 sm:left-7">
                    <span className="rounded-full border border-white/35 bg-black/15 px-3 py-1.5 text-[10px] font-bold tracking-[.15em] text-white uppercase">
                        {project.category}
                    </span>
                    {project.demo ? (
                        <span className="rounded-full bg-portfolio-secondary px-3 py-1.5 text-[10px] font-bold tracking-wide text-portfolio-navy">
                            DEMO · NO PUBLICADO
                        </span>
                    ) : (
                        project.isFeatured && (
                            <span className="rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold tracking-wide text-portfolio-ink">
                                Destacado
                            </span>
                        )
                    )}
                </div>
                <span className="relative z-10 font-mono text-[clamp(4rem,13vw,9rem)] leading-none font-medium tracking-[-.13em] text-white/90 transition-transform duration-500 group-hover:-translate-y-1">
                    {project.monogram}
                </span>
                <span className="relative z-10 ml-auto grid size-11 place-items-center rounded-full border border-white/50 transition-all duration-200 group-hover:rotate-45 group-hover:bg-white group-hover:text-portfolio-ink">
                    <ArrowUpRight aria-hidden="true" className="size-5" />
                </span>
            </div>
            <div className="flex flex-wrap items-start justify-between gap-3 px-1 pt-5">
                <div className="min-w-0">
                    <h3 className="text-2xl font-semibold tracking-[-.04em] text-portfolio-ink sm:text-3xl">
                        {project.name}
                    </h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-portfolio-muted">
                        {project.description}
                    </p>
                </div>
                {project.technologies.length > 0 && (
                    <p className="max-w-sm text-right text-[11px] leading-5 text-portfolio-muted">
                        {project.technologies.slice(0, 4).join(' · ')}
                    </p>
                )}
            </div>
        </>
    );
    return (
        <article
            className={`group min-w-0 ${asymmetric ? (index % 2 === 0 ? 'lg:col-span-7' : 'lg:col-span-5 lg:mt-20') : 'lg:col-span-6'}`}
        >
            {project.demo ? (
                <div className="block rounded-2xl">
                    <div>{content}</div>
                </div>
            ) : (
                <a
                    href={`/projects/${project.slug}`}
                    aria-label={`Ver caso de estudio: ${project.name}`}
                    className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-portfolio-primary"
                >
                    <div>{content}</div>
                </a>
            )}
        </article>
    );
}

export function ProjectArtwork({
    project,
    index,
}: {
    project: Pick<EditorialProject, 'demo' | 'isFeatured'>;
    index: number;
}) {
    return (
        <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 overflow-hidden"
        >
            <div
                className="absolute inset-0 opacity-[.18]"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,.38) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.38) 1px, transparent 1px)',
                    backgroundSize: '36px 36px',
                }}
            />
            <div
                className={`absolute top-[14%] right-[13%] aspect-square w-[42%] rounded-full border border-white/35 ${index % 2 ? 'translate-y-8' : ''}`}
            />
            <div className="absolute top-[22%] right-[21%] aspect-square w-[26%] rounded-full border border-white/45" />
            <div className="absolute top-[30%] right-[29%] aspect-square w-[10%] rounded-full bg-white/15" />
            <div className="absolute top-[48%] right-[12%] h-px w-[58%] rotate-[-28deg] bg-white/35" />
            <p className="absolute top-[20%] left-6 max-w-[42%] text-xs leading-5 font-medium text-white/80 sm:left-8">
                {project.demo
                    ? 'Muestra visual · privada'
                    : project.isFeatured
                      ? 'Selección destacada'
                      : 'Caso de estudio'}
            </p>
            <div className="absolute right-[10%] bottom-[25%] flex items-center gap-2 font-mono text-[10px] tracking-widest text-white/75">
                <span>0{index + 1}</span>
                <span className="h-px w-10 bg-white/50" />
                <span>IM / WORK</span>
            </div>
        </div>
    );
}

export function EditorialTimelineItem({
    item,
    index,
}: {
    item: EditorialExperience;
    index: number;
}) {
    const start = item.started_year
        ? String(item.started_year)
        : formatDate(item.started_at ?? null);
    const end = item.is_current
        ? 'Actualidad'
        : item.ended_year
          ? String(item.ended_year)
          : formatDate(item.ended_at ?? null);
    const responsibilities = item.responsibilities ?? [];
    const achievements = item.achievements ?? [];
    return (
        <article className="relative pb-8 last:pb-2 sm:pb-10">
            <span
                aria-hidden="true"
                className={`absolute top-1 -left-[1.66rem] size-3 rounded-full border-[3px] border-surface ring-1 ring-portfolio-primary sm:-left-[2.16rem] ${index === 0 ? 'bg-portfolio-primary' : 'bg-portfolio-secondary'}`}
            />
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <p className="min-w-0 text-xs font-bold tracking-[.14em] break-words text-portfolio-primary uppercase">
                    {item.company}
                </p>
                {(start || end) && (
                    <span className="rounded-full bg-portfolio-tint px-3 py-1.5 text-[11px] font-medium text-portfolio-muted">
                        {start}
                        {start && end ? ' — ' : ''}
                        {end}
                    </span>
                )}
            </div>
            <div className="mt-2 flex min-w-0 flex-wrap items-start justify-between gap-3">
                <h3 className="min-w-0 text-xl font-semibold tracking-[-.035em] break-words text-portfolio-ink sm:text-2xl">
                    {item.job_title}
                </h3>
                {item.demo && (
                    <span className="rounded-full bg-portfolio-tint px-2.5 py-1 text-[10px] font-bold tracking-wide text-portfolio-primary">
                        DEMO · NO PUBLICADO
                    </span>
                )}
            </div>
            {item.description && (
                <p className="mt-3 max-w-none text-sm leading-7 break-words text-portfolio-muted">
                    {item.description}
                </p>
            )}
            {(responsibilities.length > 0 || achievements.length > 0) && (
                <details className="group mt-4">
                    <summary className="inline-flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-md text-sm font-semibold text-portfolio-primary hover:text-portfolio-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-portfolio-primary [&::-webkit-details-marker]:hidden">
                        <span>Ver responsabilidades y aportaciones</span>
                        <span
                            aria-hidden="true"
                            className="transition-transform group-open:rotate-180"
                        >
                            ⌄
                        </span>
                    </summary>
                    <div className="mt-3 grid min-w-0 gap-5 border-t border-line pt-4 sm:grid-cols-2">
                        <ListBlock
                            title="Responsabilidades"
                            items={responsibilities}
                        />
                        <ListBlock title="Aportaciones" items={achievements} />
                    </div>
                </details>
            )}
            {(item.technologies ?? []).length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {item.technologies?.map((technology) => (
                        <span
                            key={technology.id}
                            className="rounded-full border border-line bg-surface px-3 py-1.5 text-[11px] font-medium text-portfolio-muted"
                        >
                            {technology.name}
                        </span>
                    ))}
                </div>
            )}
            {(item.projects ?? []).length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {item.projects?.map((project) => (
                        <a
                            key={project.slug}
                            href={`/projects/${project.slug}`}
                            className="inline-flex min-h-9 items-center gap-1 rounded-full bg-portfolio-navy px-3.5 text-xs font-semibold text-white transition-colors hover:bg-portfolio-primary focus-visible:outline-2 focus-visible:outline-portfolio-primary"
                        >
                            {project.name}
                            <ArrowUpRight
                                aria-hidden="true"
                                className="size-3.5"
                            />
                        </a>
                    ))}
                </div>
            )}
        </article>
    );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
    if (items.length === 0) return null;
    return (
        <div className="min-w-0">
            <h4 className="text-[10px] font-bold tracking-[.15em] text-portfolio-muted uppercase">
                {title}
            </h4>
            <ul className="mt-2 space-y-1.5 text-sm leading-6 text-portfolio-muted">
                {items.map((item, index) => (
                    <li
                        key={`${title}-${index}`}
                        className="flex min-w-0 gap-2 break-words"
                    >
                        <span
                            className="mt-2 size-1.5 shrink-0 rounded-full bg-portfolio-secondary"
                            aria-hidden="true"
                        />
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function EditorialProfileVisual({
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
        <div className="relative mt-8 aspect-[1.15] overflow-hidden rounded-[var(--portfolio-radius-card)] bg-portfolio-navy p-6 text-white sm:max-w-md sm:p-8">
            {photoUrl ? (
                <img
                    src={photoUrl}
                    alt={name}
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover opacity-50"
                />
            ) : (
                <svg
                    aria-hidden="true"
                    viewBox="0 0 360 300"
                    className="absolute inset-0 size-full"
                >
                    <path
                        d="M25 250 145 40l72 123 48-76 70 123"
                        fill="none"
                        stroke="var(--portfolio-secondary)"
                        strokeOpacity=".5"
                        strokeWidth="1.5"
                    />
                    <circle
                        cx="180"
                        cy="150"
                        r="102"
                        fill="none"
                        stroke="white"
                        strokeOpacity=".16"
                    />
                    <circle
                        cx="180"
                        cy="150"
                        r="72"
                        fill="none"
                        stroke="white"
                        strokeOpacity=".1"
                    />
                    <path
                        d="M0 75h360M0 150h360M0 225h360M90 0v300M180 0v300M270 0v300"
                        stroke="white"
                        strokeOpacity=".07"
                    />
                </svg>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-portfolio-navy via-portfolio-navy/25 to-transparent" />
            <div className="relative flex h-full flex-col justify-between">
                <span className="font-mono text-xs font-semibold tracking-[.2em] text-portfolio-secondary">
                    IM / PROFILE
                </span>
                <div>
                    <p className="text-4xl font-semibold tracking-[-.07em] sm:text-5xl">
                        {name}
                    </p>
                    <p className="mt-3 text-sm font-medium text-white/80">
                        {role}
                    </p>
                    <p className="mt-1 text-xs text-white/55">{specialty}</p>
                </div>
            </div>
        </div>
    );
}

export function formatDate(value: string | null): string {
    if (!value) return '';
    const date = new Date(`${value}T00:00:00`);
    return new Intl.DateTimeFormat('es', {
        month: 'short',
        year: 'numeric',
    }).format(date);
}
