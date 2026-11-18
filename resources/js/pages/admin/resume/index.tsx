import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    Copy,
    Eye,
    Plus,
    Save,
    Send,
    Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type Section =
    | 'experience'
    | 'skills'
    | 'education'
    | 'certifications'
    | 'languages'
    | 'projects';
type ResumeProfile = {
    name: string;
    headline: string;
    specialty: string;
    summary: string;
    location: string;
    email: string;
    links: Record<string, string>;
    photo_url: string;
};
type CompetencyGroup = { category: string; items: string[] };
type ResumeConfig = {
    section_order: Section[];
    visible_sections: Section[];
    experience_ids: number[];
    project_ids: number[];
    technology_ids: number[];
    language: 'es' | 'en';
    visible_links: ('linkedin' | 'github' | 'website')[];
    show_email: boolean;
    theme: 'editorial' | 'minimal';
    target_length: 'one-page' | 'two-pages' | 'auto';
    include_photo: boolean;
    resume_profile: ResumeProfile;
    professional_competencies: CompetencyGroup[];
};
type Experience = {
    id: number | null;
    job_title: string;
    company: string;
    location: string;
    started_at: string;
    ended_at: string;
    started_year: number | null;
    ended_year: number | null;
    is_current: boolean;
    description: string;
    responsibilities: string[];
    achievements: string[];
    sort_order: number;
    is_visible: boolean;
    technology_ids: number[];
    project_ids: number[];
};
type Education = {
    id: number | null;
    qualification: string;
    institution: string;
    started_at: string;
    ended_at: string;
    started_year: number | null;
    ended_year: number | null;
    description: string;
    sort_order: number;
    is_visible: boolean;
};
type Certification = {
    id: number | null;
    name: string;
    issuer: string;
    issued_at: string;
    credential_url: string;
    sort_order: number;
    is_visible: boolean;
};
type Language = {
    id: number | null;
    language: string;
    declared_level: string;
    certification_name: string;
    certification_url: string;
    sort_order: number;
    is_visible: boolean;
};
type Profile = {
    public_name: string;
    headline: string;
    specialty: string;
    short_description: string;
    location: string | null;
    contact_email: string | null;
    photo_url: string | null;
    links: Record<string, string> | null;
};
type Technology = {
    id: number;
    name: string;
    category: string;
    is_visible: boolean;
};
type Project = {
    id: number;
    name: string;
    slug: string;
    publication_status: string;
    is_visible: boolean;
};
type Reconciliation = {
    title: string;
    status: string;
    warning: string | null;
    differences: { field: string; stored: string; provided: string }[];
};
type Props = {
    profile: Profile;
    config: ResumeConfig;
    experiences: Experience[];
    education: Education[];
    certifications: Certification[];
    languages: Language[];
    technologies: Technology[];
    projects: Project[];
    publishedVersion: number | null;
    reconciliation: Reconciliation[];
};
type FormData = Omit<
    Props,
    'profile' | 'technologies' | 'projects' | 'publishedVersion' | 'reconciliation'
>;

const sectionLabels: Record<Section, string> = {
    experience: 'Experiencia profesional',
    skills: 'Competencias técnicas',
    education: 'Formación',
    certifications: 'Certificaciones',
    languages: 'Idiomas',
    projects: 'Proyectos destacados',
};
const inputClass =
    'min-h-10 w-full min-w-0 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-teal-700';
const labelClass = 'block space-y-1.5 text-xs font-medium text-slate-600';

function TextField({
    label,
    value,
    onChange,
    type = 'text',
    multiline = false,
    disabled = false,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    multiline?: boolean;
    disabled?: boolean;
}) {
    return (
        <label className={labelClass}>
            {label}
            {multiline ? (
                <textarea
                    rows={3}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className={inputClass}
                    disabled={disabled}
                />
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className={inputClass}
                    disabled={disabled}
                />
            )}
        </label>
    );
}

function normalizeLines(lines: string[]): string[] {
    return lines
        .flatMap((line) => line.split(/\r?\n/))
        .map((line) => line.trim())
        .filter(Boolean);
}

function normalizeResumeForm(data: FormData): FormData {
    return {
        ...data,
        experiences: data.experiences.map((experience) => ({
            ...experience,
            responsibilities: normalizeLines(experience.responsibilities),
            achievements: normalizeLines(experience.achievements),
        })),
    };
}

function Checkbox({
    label,
    checked,
    onChange,
    disabled = false,
}: {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}) {
    return (
        <label className="flex min-h-10 items-center gap-2 text-sm text-slate-700">
            <input
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                disabled={disabled}
                className="size-4 accent-teal-700"
            />
            {label}
        </label>
    );
}

export default function ResumeAdmin({
    profile,
    config,
    experiences,
    education,
    certifications,
    languages,
    technologies,
    projects,
    publishedVersion,
    reconciliation,
}: Props) {
    const form = useForm<FormData>({
        config,
        experiences,
        education,
        certifications,
        languages,
    });
    const updateRow = <T extends { id: number | null }>(
        key: 'experiences' | 'education' | 'certifications' | 'languages',
        index: number,
        values: Partial<T>,
    ) => {
        const rows = form.data[key] as unknown as T[];
        form.setData(
            key,
            rows.map((row, itemIndex) =>
                itemIndex === index ? { ...row, ...values } : row,
            ) as unknown as FormData[typeof key],
        );
    };
    const moveRow = (
        key: 'experiences' | 'education' | 'certifications' | 'languages',
        index: number,
        direction: -1 | 1,
    ) => {
        const rows = [...form.data[key]];
        const next = index + direction;
        if (next < 0 || next >= rows.length) return;
        [rows[index], rows[next]] = [rows[next]!, rows[index]!];
        form.setData(
            key,
            rows.map((row, position) => ({
                ...row,
                sort_order: position * 10,
            })) as FormData[typeof key],
        );
    };
    const save = () => {
        form.transform(normalizeResumeForm);
        form.put('/admin/resume', { onSuccess: () => form.setDefaults() });
    };
    const publish = () => {
        if (!window.confirm('¿Publicar el contenido guardado del currículum?'))
            return;
        form.transform(normalizeResumeForm);
        form.post('/admin/resume/publish', {
            onSuccess: () => form.setDefaults(),
        });
    };
    const addExperience = () =>
        form.setData('experiences', [
            ...form.data.experiences,
            {
                id: null,
                job_title: '',
                company: '',
                location: '',
                started_at: '',
                ended_at: '',
                started_year: null,
                ended_year: null,
                is_current: false,
                description: '',
                responsibilities: [],
                achievements: [],
                sort_order: form.data.experiences.length * 10,
                is_visible: true,
                technology_ids: [],
                project_ids: [],
            },
        ]);
    const addEducation = () =>
        form.setData('education', [
            ...form.data.education,
            {
                id: null,
                qualification: '',
                institution: '',
                started_at: '',
                ended_at: '',
                started_year: null,
                ended_year: null,
                description: '',
                sort_order: form.data.education.length * 10,
                is_visible: true,
            },
        ]);
    const addCertification = () =>
        form.setData('certifications', [
            ...form.data.certifications,
            {
                id: null,
                name: '',
                issuer: '',
                issued_at: '',
                credential_url: '',
                sort_order: form.data.certifications.length * 10,
                is_visible: true,
            },
        ]);
    const addLanguage = () =>
        form.setData('languages', [
            ...form.data.languages,
            {
                id: null,
                language: '',
                declared_level: '',
                certification_name: '',
                certification_url: '',
                sort_order: form.data.languages.length * 10,
                is_visible: true,
            },
        ]);
    const duplicate = (
        key: 'experiences' | 'education' | 'certifications' | 'languages',
        index: number,
    ) => {
        const rows = [...form.data[key]];
        const source = rows[index];
        if (!source) return;
        rows.splice(index + 1, 0, {
            ...source,
            id: null,
            sort_order: (index + 1) * 10,
        } as (typeof rows)[number]);
        form.setData(
            key,
            rows.map((row, position) => ({
                ...row,
                sort_order: position * 10,
            })) as FormData[typeof key],
        );
    };
    const remove = (
        key: 'experiences' | 'education' | 'certifications' | 'languages',
        index: number,
    ) => {
        if (
            !window.confirm(
                '¿Quitar este elemento del borrador? La versión publicada no cambia hasta volver a publicar.',
            )
        )
            return;
        form.setData(
            key,
            form.data[key]
                .filter((_, itemIndex) => itemIndex !== index)
                .map((row, position) => ({
                    ...row,
                    sort_order: position * 10,
                })) as FormData[typeof key],
        );
    };
    const toggleConfig = (
        key:
            | 'experience_ids'
            | 'project_ids'
            | 'technology_ids'
            | 'visible_links'
            | 'visible_sections',
        value: number | string,
        checked: boolean,
    ) => {
        const current = form.data.config[key] as (number | string)[];
        form.setData('config', {
            ...form.data.config,
            [key]: checked
                ? [...current, value]
                : current.filter((item) => item !== value),
        } as ResumeConfig);
    };
    const updateConfig = <K extends keyof ResumeConfig>(
        key: K,
        value: ResumeConfig[K],
    ) => form.setData('config', { ...form.data.config, [key]: value });
    const resumeProfile = form.data.config.resume_profile;
    const updateResumeProfile = <K extends keyof ResumeProfile>(
        key: K,
        value: ResumeProfile[K],
    ) => updateConfig('resume_profile', { ...resumeProfile, [key]: value });
    const updateResumeLink = (key: string, value: string) =>
        updateResumeProfile('links', { ...resumeProfile.links, [key]: value });

    const rowActions = (
        key: 'experiences' | 'education' | 'certifications' | 'languages',
        index: number,
    ) => (
        <div className="flex flex-wrap items-center gap-1">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Subir elemento"
                disabled={index === 0}
                onClick={() => moveRow(key, index, -1)}
            >
                <ArrowUp className="size-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Bajar elemento"
                disabled={index === form.data[key].length - 1}
                onClick={() => moveRow(key, index, 1)}
            >
                <ArrowDown className="size-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Duplicar elemento"
                onClick={() => duplicate(key, index)}
            >
                <Copy className="size-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Eliminar del borrador"
                onClick={() => remove(key, index)}
            >
                <Trash2 className="size-4 text-red-700" />
            </Button>
        </div>
    );

    return (
        <>
            <Head title="Currículum · Administración" />
            <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="mb-2 text-sm font-medium text-teal-700">
                        Contenido
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Currículum profesional
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                        El perfil del CV se guarda como borrador independiente.
                        El contenido público y los PDF solo cambian al publicar
                        una nueva versión.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {publishedVersion && (
                        <Button asChild variant="outline">
                            <a href="/cv" target="_blank" rel="noreferrer">
                                Abrir versión publicada
                            </a>
                        </Button>
                    )}
                    <Button asChild variant="outline">
                        <a
                            href="/admin/resume/preview"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Eye className="mr-2 size-4" />
                            Vista previa privada
                        </a>
                    </Button>
                </div>
            </header>
            {reconciliation.length > 0 && (
                <section
                    aria-labelledby="resume-reconciliation-title"
                    className="mb-6 space-y-4 rounded-xl border border-amber-300 bg-amber-50 p-4 sm:p-5"
                >
                    <div>
                        <h2
                            id="resume-reconciliation-title"
                            className="font-semibold text-amber-950"
                        >
                            Datos pendientes de reconciliación
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-amber-900">
                            Se muestran las diferencias con el CV proporcionado.
                            Los registros guardados se mantienen hasta que
                            apruebes los cambios.
                        </p>
                    </div>
                    {reconciliation.map((item) => (
                        <article
                            key={item.title}
                            className="rounded-lg border border-amber-200 bg-white p-4"
                        >
                            <h3 className="font-semibold text-slate-900">
                                {item.title}
                            </h3>
                            <p className="mt-1 text-sm text-slate-600">
                                {item.status}
                            </p>
                            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                                {item.differences.map((difference) => (
                                    <div
                                        key={difference.field}
                                        className="min-w-0 rounded-md bg-slate-50 p-3"
                                    >
                                        <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                            {difference.field}
                                        </dt>
                                        <dd className="mt-1 text-sm break-words text-slate-800">
                                            <span className="font-medium">
                                                Guardado:
                                            </span>{' '}
                                            {difference.stored}
                                        </dd>
                                        <dd className="mt-1 text-sm break-words text-slate-800">
                                            <span className="font-medium">
                                                Proporcionado:
                                            </span>{' '}
                                            {difference.provided}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                            {item.warning && (
                                <p className="mt-3 text-sm font-medium text-amber-900">
                                    {item.warning}
                                </p>
                            )}
                        </article>
                    ))}
                </section>
            )}
            <section className="mb-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 sm:p-5">
                <div>
                    <h2 className="font-semibold">Perfil compartido</h2>
                    <p className="mt-1 text-sm text-slate-600">
                        {profile.public_name} · {profile.headline}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                        {profile.short_description}
                    </p>
                </div>
                <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-500">
                        El perfil público se mantiene independiente del
                        currículum.
                    </p>
                    <Button asChild variant="outline">
                        <Link href="/admin/profile">Editar perfil público</Link>
                    </Button>
                </div>
            </section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p
                    role="status"
                    aria-live="polite"
                    className={`text-sm ${form.isDirty ? 'text-amber-800' : 'text-emerald-800'}`}
                >
                    {form.isDirty
                        ? 'Borrador con cambios pendientes'
                        : publishedVersion
                          ? `Borrador guardado · versión pública ${publishedVersion}`
                          : 'Sin versión pública todavía'}
                </p>
                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={form.processing || !form.isDirty}
                        onClick={save}
                    >
                        <Save className="mr-2 size-4" />
                        Guardar borrador
                    </Button>
                    <Button
                        type="button"
                        disabled={form.processing}
                        onClick={publish}
                    >
                        <Send className="mr-2 size-4" />
                        {form.processing ? 'Publicando…' : 'Guardar y publicar'}
                    </Button>
                </div>
            </div>
            {Object.keys(form.errors).length > 0 && (
                <div
                    role="alert"
                    className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                >
                    Hay campos que necesitan revisión antes de guardar.
                </div>
            )}
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    save();
                }}
                className="space-y-6"
            >
                <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Perfil para este currículum · borrador
                        </h2>
                        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                            Estos datos se guardan en el borrador del CV y no
                            cambian el perfil público. Solo pasan a /cv y a los
                            PDF al publicar una versión.
                        </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <TextField
                            label="Nombre"
                            value={resumeProfile.name}
                            onChange={(value) =>
                                updateResumeProfile('name', value)
                            }
                        />
                        <TextField
                            label="Titular profesional"
                            value={resumeProfile.headline}
                            onChange={(value) =>
                                updateResumeProfile('headline', value)
                            }
                        />
                        <TextField
                            label="Especialización"
                            value={resumeProfile.specialty}
                            onChange={(value) =>
                                updateResumeProfile('specialty', value)
                            }
                        />
                        <TextField
                            label="Ubicación pública"
                            value={resumeProfile.location}
                            onChange={(value) =>
                                updateResumeProfile('location', value)
                            }
                        />
                        <TextField
                            label="Email"
                            type="email"
                            value={resumeProfile.email}
                            onChange={(value) =>
                                updateResumeProfile('email', value)
                            }
                        />
                        <TextField
                            label="GitHub"
                            type="url"
                            value={resumeProfile.links.github ?? ''}
                            onChange={(value) =>
                                updateResumeLink('github', value)
                            }
                        />
                        <TextField
                            label="Portfolio"
                            type="url"
                            value={resumeProfile.links.website ?? ''}
                            onChange={(value) =>
                                updateResumeLink('website', value)
                            }
                        />
                        <div className="sm:col-span-2 lg:col-span-3">
                            <TextField
                                label="Resumen profesional"
                                value={resumeProfile.summary}
                                multiline
                                onChange={(value) =>
                                    updateResumeProfile('summary', value)
                                }
                            />
                        </div>
                    </div>
                    <p className="text-xs leading-5 text-slate-500">
                        El teléfono no se almacena ni se muestra. No hay
                        fotografía autorizada en la biblioteca multimedia; se
                        mantiene la composición gráfica alternativa.
                    </p>
                </section>
                <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Prácticas de ingeniería y competencias profesionales
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Se mantienen separadas del catálogo de tecnologías.
                        </p>
                    </div>
                    {form.data.config.professional_competencies.map(
                        (group, index) => (
                            <article
                                key={`${group.category}-${index}`}
                                className="grid gap-3 rounded-lg border border-slate-200 p-4 sm:grid-cols-[minmax(0,.7fr)_minmax(0,1.3fr)_auto] sm:items-start"
                            >
                                <TextField
                                    label="Categoría"
                                    value={group.category}
                                    onChange={(value) =>
                                        updateConfig(
                                            'professional_competencies',
                                            form.data.config.professional_competencies.map(
                                                (item, itemIndex) =>
                                                    itemIndex === index
                                                        ? {
                                                              ...item,
                                                              category: value,
                                                          }
                                                        : item,
                                            ),
                                        )
                                    }
                                />
                                <label className={labelClass}>
                                    Competencias (una por línea)
                                    <textarea
                                        rows={4}
                                        value={group.items.join('\n')}
                                        onChange={(event) =>
                                            updateConfig(
                                                'professional_competencies',
                                                form.data.config.professional_competencies.map(
                                                    (item, itemIndex) =>
                                                        itemIndex === index
                                                            ? {
                                                                  ...item,
                                                                  items: event.target.value
                                                                      .split(
                                                                          /\r?\n/,
                                                                      )
                                                                      .map(
                                                                          (
                                                                              line,
                                                                          ) =>
                                                                              line.trim(),
                                                                      )
                                                                      .filter(
                                                                          Boolean,
                                                                      ),
                                                              }
                                                            : item,
                                                ),
                                            )
                                        }
                                        className={inputClass}
                                    />
                                </label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    aria-label={`Eliminar categoría ${group.category}`}
                                    onClick={() =>
                                        updateConfig(
                                            'professional_competencies',
                                            form.data.config.professional_competencies.filter(
                                                (_, itemIndex) =>
                                                    itemIndex !== index,
                                            ),
                                        )
                                    }
                                >
                                    <Trash2 className="size-4 text-red-700" />
                                </Button>
                            </article>
                        ),
                    )}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                            updateConfig('professional_competencies', [
                                ...form.data.config.professional_competencies,
                                { category: '', items: [] },
                            ])
                        }
                    >
                        <Plus className="mr-2 size-4" />
                        Añadir categoría
                    </Button>
                </section>
                <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Experiencia profesional
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Añade solo cargos, fechas y aportaciones
                            verificables.
                        </p>
                    </div>
                    {form.data.experiences.map((item, index) => (
                        <article
                            key={item.id ?? `new-experience-${index}`}
                            className="space-y-4 rounded-lg border border-slate-200 p-4"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold">
                                        {item.job_title ||
                                            `Experiencia ${index + 1}`}
                                    </h3>
                                    <Checkbox
                                        label="Visible"
                                        checked={item.is_visible}
                                        onChange={(value) =>
                                            updateRow<Experience>(
                                                'experiences',
                                                index,
                                                { is_visible: value },
                                            )
                                        }
                                    />
                                </div>
                                {rowActions('experiences', index)}
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <TextField
                                    label="Cargo"
                                    value={item.job_title}
                                    onChange={(value) =>
                                        updateRow<Experience>(
                                            'experiences',
                                            index,
                                            { job_title: value },
                                        )
                                    }
                                />
                                <TextField
                                    label="Empresa"
                                    value={item.company}
                                    onChange={(value) =>
                                        updateRow<Experience>(
                                            'experiences',
                                            index,
                                            { company: value },
                                        )
                                    }
                                />
                                <TextField
                                    label="Ubicación"
                                    value={item.location}
                                    onChange={(value) =>
                                        updateRow<Experience>(
                                            'experiences',
                                            index,
                                            { location: value },
                                        )
                                    }
                                />
                                <TextField
                                    label="Año de inicio"
                                    type="number"
                                    value={item.started_year?.toString() ?? ''}
                                    onChange={(value) =>
                                        updateRow<Experience>(
                                            'experiences',
                                            index,
                                            {
                                                started_year: value
                                                    ? Number(value)
                                                    : null,
                                                started_at: '',
                                            },
                                        )
                                    }
                                />
                                <TextField
                                    label="Año de finalización"
                                    type="number"
                                    value={item.ended_year?.toString() ?? ''}
                                    disabled={item.is_current}
                                    onChange={(value) =>
                                        updateRow<Experience>(
                                            'experiences',
                                            index,
                                            {
                                                ended_year: value
                                                    ? Number(value)
                                                    : null,
                                                ended_at: '',
                                            },
                                        )
                                    }
                                />
                                <details className="sm:col-span-2 lg:col-span-3">
                                    <summary className="cursor-pointer text-xs font-medium text-slate-600">
                                        Usar fechas completas si se conocen
                                    </summary>
                                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                                        <TextField
                                            label="Fecha de inicio completa"
                                            type="date"
                                            value={item.started_at}
                                            onChange={(value) =>
                                                updateRow<Experience>(
                                                    'experiences',
                                                    index,
                                                    {
                                                        started_at: value,
                                                        started_year: null,
                                                    },
                                                )
                                            }
                                        />
                                        <TextField
                                            label="Fecha de finalización completa"
                                            type="date"
                                            value={item.ended_at}
                                            disabled={item.is_current}
                                            onChange={(value) =>
                                                updateRow<Experience>(
                                                    'experiences',
                                                    index,
                                                    {
                                                        ended_at: value,
                                                        ended_year: null,
                                                    },
                                                )
                                            }
                                        />
                                    </div>
                                </details>
                                <div className="flex items-end">
                                    <Checkbox
                                        label="Puesto actual"
                                        checked={item.is_current}
                                        onChange={(value) =>
                                            updateRow<Experience>(
                                                'experiences',
                                                index,
                                                {
                                                    is_current: value,
                                                    ended_at: value
                                                        ? ''
                                                        : item.ended_at,
                                                    ended_year: value
                                                        ? null
                                                        : item.ended_year,
                                                },
                                            )
                                        }
                                    />
                                </div>
                                <div className="sm:col-span-2 lg:col-span-3">
                                    <TextField
                                        label="Descripción"
                                        value={item.description}
                                        multiline
                                        onChange={(value) =>
                                            updateRow<Experience>(
                                                'experiences',
                                                index,
                                                { description: value },
                                            )
                                        }
                                    />
                                </div>
                                <div className="sm:col-span-2 lg:col-span-3">
                                    <TextField
                                        label="Responsabilidades (una por línea)"
                                        value={item.responsibilities.join('\n')}
                                        multiline
                                        onChange={(value) =>
                                            updateRow<Experience>(
                                                'experiences',
                                                index,
                                                { responsibilities: [value] },
                                            )
                                        }
                                    />
                                </div>
                                <div className="sm:col-span-2 lg:col-span-3">
                                    <TextField
                                        label="Aportaciones y logros verificables (una por línea)"
                                        value={item.achievements.join('\n')}
                                        multiline
                                        onChange={(value) =>
                                            updateRow<Experience>(
                                                'experiences',
                                                index,
                                                { achievements: [value] },
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <div className="grid gap-4 lg:grid-cols-2">
                                <fieldset className="space-y-1">
                                    <legend className="text-xs font-semibold text-slate-700">
                                        Tecnologías utilizadas
                                    </legend>
                                    <div className="grid gap-x-3 sm:grid-cols-2">
                                        {technologies.map((technology) => (
                                            <Checkbox
                                                key={technology.id}
                                                label={`${technology.name} · ${technology.category}`}
                                                checked={item.technology_ids.includes(
                                                    technology.id,
                                                )}
                                                onChange={(checked) =>
                                                    updateRow<Experience>(
                                                        'experiences',
                                                        index,
                                                        {
                                                            technology_ids:
                                                                checked
                                                                    ? [
                                                                          ...item.technology_ids,
                                                                          technology.id,
                                                                      ]
                                                                    : item.technology_ids.filter(
                                                                          (
                                                                              id,
                                                                          ) =>
                                                                              id !==
                                                                              technology.id,
                                                                      ),
                                                        },
                                                    )
                                                }
                                            />
                                        ))}
                                    </div>
                                </fieldset>
                                <fieldset className="space-y-1">
                                    <legend className="text-xs font-semibold text-slate-700">
                                        Proyectos relacionados
                                    </legend>
                                    <div className="grid gap-x-3 sm:grid-cols-2">
                                        {projects.map((project) => (
                                            <Checkbox
                                                key={project.id}
                                                label={`${project.name} · ${project.publication_status === 'published' && project.is_visible ? 'publicado' : 'borrador/oculto'}`}
                                                checked={item.project_ids.includes(
                                                    project.id,
                                                )}
                                                onChange={(checked) =>
                                                    updateRow<Experience>(
                                                        'experiences',
                                                        index,
                                                        {
                                                            project_ids: checked
                                                                ? [
                                                                      ...item.project_ids,
                                                                      project.id,
                                                                  ]
                                                                : item.project_ids.filter(
                                                                      (id) =>
                                                                          id !==
                                                                          project.id,
                                                                  ),
                                                        },
                                                    )
                                                }
                                            />
                                        ))}
                                    </div>
                                </fieldset>
                            </div>
                        </article>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={addExperience}
                    >
                        <Plus className="mr-2 size-4" />
                        Añadir experiencia
                    </Button>
                </section>

                <EntitySection
                    title="Formación"
                    description="Titulación, institución y fechas declaradas."
                    onAdd={addEducation}
                    addLabel="Añadir formación"
                >
                    {form.data.education.map((item, index) => (
                        <article
                            key={item.id ?? `new-education-${index}`}
                            className="space-y-4 rounded-lg border border-slate-200 p-4"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <h3 className="font-semibold">
                                    {item.qualification ||
                                        `Formación ${index + 1}`}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        label="Visible"
                                        checked={item.is_visible}
                                        onChange={(value) =>
                                            updateRow<Education>(
                                                'education',
                                                index,
                                                { is_visible: value },
                                            )
                                        }
                                    />
                                    {rowActions('education', index)}
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <TextField
                                    label="Titulación"
                                    value={item.qualification}
                                    onChange={(value) =>
                                        updateRow<Education>(
                                            'education',
                                            index,
                                            { qualification: value },
                                        )
                                    }
                                />
                                <TextField
                                    label="Institución"
                                    value={item.institution}
                                    onChange={(value) =>
                                        updateRow<Education>(
                                            'education',
                                            index,
                                            { institution: value },
                                        )
                                    }
                                />
                                <TextField
                                    label="Año de inicio"
                                    type="number"
                                    value={item.started_year?.toString() ?? ''}
                                    onChange={(value) =>
                                        updateRow<Education>(
                                            'education',
                                            index,
                                            {
                                                started_year: value
                                                    ? Number(value)
                                                    : null,
                                                started_at: '',
                                            },
                                        )
                                    }
                                />
                                <TextField
                                    label="Año de finalización"
                                    type="number"
                                    value={item.ended_year?.toString() ?? ''}
                                    onChange={(value) =>
                                        updateRow<Education>(
                                            'education',
                                            index,
                                            {
                                                ended_year: value
                                                    ? Number(value)
                                                    : null,
                                                ended_at: '',
                                            },
                                        )
                                    }
                                />
                                <details className="sm:col-span-2 lg:col-span-4">
                                    <summary className="cursor-pointer text-xs font-medium text-slate-600">
                                        Usar fechas completas si se conocen
                                    </summary>
                                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                                        <TextField
                                            label="Fecha de inicio completa"
                                            type="date"
                                            value={item.started_at}
                                            onChange={(value) =>
                                                updateRow<Education>(
                                                    'education',
                                                    index,
                                                    {
                                                        started_at: value,
                                                        started_year: null,
                                                    },
                                                )
                                            }
                                        />
                                        <TextField
                                            label="Fecha de finalización completa"
                                            type="date"
                                            value={item.ended_at}
                                            onChange={(value) =>
                                                updateRow<Education>(
                                                    'education',
                                                    index,
                                                    {
                                                        ended_at: value,
                                                        ended_year: null,
                                                    },
                                                )
                                            }
                                        />
                                    </div>
                                </details>
                                <div className="sm:col-span-2 lg:col-span-4">
                                    <TextField
                                        label="Descripción"
                                        value={item.description}
                                        multiline
                                        onChange={(value) =>
                                            updateRow<Education>(
                                                'education',
                                                index,
                                                { description: value },
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </article>
                    ))}
                </EntitySection>
                <EntitySection
                    title="Certificaciones"
                    description="No añadas credenciales hasta poder verificarlas."
                    onAdd={addCertification}
                    addLabel="Añadir certificación"
                >
                    {form.data.certifications.map((item, index) => (
                        <article
                            key={item.id ?? `new-cert-${index}`}
                            className="space-y-4 rounded-lg border border-slate-200 p-4"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <h3 className="font-semibold">
                                    {item.name || `Certificación ${index + 1}`}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        label="Visible"
                                        checked={item.is_visible}
                                        onChange={(value) =>
                                            updateRow<Certification>(
                                                'certifications',
                                                index,
                                                { is_visible: value },
                                            )
                                        }
                                    />
                                    {rowActions('certifications', index)}
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <TextField
                                    label="Nombre"
                                    value={item.name}
                                    onChange={(value) =>
                                        updateRow<Certification>(
                                            'certifications',
                                            index,
                                            { name: value },
                                        )
                                    }
                                />
                                <TextField
                                    label="Entidad emisora"
                                    value={item.issuer}
                                    onChange={(value) =>
                                        updateRow<Certification>(
                                            'certifications',
                                            index,
                                            { issuer: value },
                                        )
                                    }
                                />
                                <TextField
                                    label="Fecha"
                                    type="date"
                                    value={item.issued_at}
                                    onChange={(value) =>
                                        updateRow<Certification>(
                                            'certifications',
                                            index,
                                            { issued_at: value },
                                        )
                                    }
                                />
                                <TextField
                                    label="Credencial HTTPS (opcional)"
                                    type="url"
                                    value={item.credential_url}
                                    onChange={(value) =>
                                        updateRow<Certification>(
                                            'certifications',
                                            index,
                                            { credential_url: value },
                                        )
                                    }
                                />
                            </div>
                        </article>
                    ))}
                </EntitySection>
                <EntitySection
                    title="Idiomas"
                    description="Usa niveles declarados, sin puntuaciones arbitrarias."
                    onAdd={addLanguage}
                    addLabel="Añadir idioma"
                >
                    {form.data.languages.map((item, index) => (
                        <article
                            key={item.id ?? `new-language-${index}`}
                            className="space-y-4 rounded-lg border border-slate-200 p-4"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <h3 className="font-semibold">
                                    {item.language || `Idioma ${index + 1}`}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        label="Visible"
                                        checked={item.is_visible}
                                        onChange={(value) =>
                                            updateRow<Language>(
                                                'languages',
                                                index,
                                                { is_visible: value },
                                            )
                                        }
                                    />
                                    {rowActions('languages', index)}
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <TextField
                                    label="Idioma"
                                    value={item.language}
                                    onChange={(value) =>
                                        updateRow<Language>(
                                            'languages',
                                            index,
                                            { language: value },
                                        )
                                    }
                                />
                                <TextField
                                    label="Nivel declarado"
                                    value={item.declared_level}
                                    onChange={(value) =>
                                        updateRow<Language>(
                                            'languages',
                                            index,
                                            { declared_level: value },
                                        )
                                    }
                                />
                                <TextField
                                    label="Certificación (opcional)"
                                    value={item.certification_name}
                                    onChange={(value) =>
                                        updateRow<Language>(
                                            'languages',
                                            index,
                                            { certification_name: value },
                                        )
                                    }
                                />
                                <div className="sm:col-span-2 lg:col-span-3">
                                    <TextField
                                        label="Enlace de certificación HTTPS (opcional)"
                                        type="url"
                                        value={item.certification_url}
                                        onChange={(value) =>
                                            updateRow<Language>(
                                                'languages',
                                                index,
                                                { certification_url: value },
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </article>
                    ))}
                </EntitySection>

                <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Publicación y descarga
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Estos ajustes se aplican a /cv y a las dos variantes
                            PDF al publicar.
                        </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <label className={labelClass}>
                            Idioma del documento
                            <select
                                value={form.data.config.language}
                                onChange={(event) =>
                                    updateConfig(
                                        'language',
                                        event.target
                                            .value as ResumeConfig['language'],
                                    )
                                }
                                className={inputClass}
                            >
                                <option value="es">Español</option>
                                <option value="en">
                                    Inglés (contenido introducido manualmente)
                                </option>
                            </select>
                        </label>
                        <label className={labelClass}>
                            Tema del CV
                            <select
                                value={form.data.config.theme}
                                onChange={(event) =>
                                    updateConfig(
                                        'theme',
                                        event.target
                                            .value as ResumeConfig['theme'],
                                    )
                                }
                                className={inputClass}
                            >
                                <option value="editorial">Editorial</option>
                                <option value="minimal">Minimal</option>
                            </select>
                        </label>
                        <label className={labelClass}>
                            Longitud objetivo
                            <select
                                value={form.data.config.target_length}
                                onChange={(event) =>
                                    updateConfig(
                                        'target_length',
                                        event.target
                                            .value as ResumeConfig['target_length'],
                                    )
                                }
                                className={inputClass}
                            >
                                <option value="one-page">
                                    Una página · densidad compacta
                                </option>
                                <option value="two-pages">
                                    Dos páginas · densidad equilibrada
                                </option>
                                <option value="auto">Automática</option>
                            </select>
                        </label>
                    </div>
                    <div className="grid gap-5 lg:grid-cols-2">
                        <div>
                            <h3 className="mb-2 text-sm font-semibold">
                                Datos de contacto
                            </h3>
                            <Checkbox
                                label="Mostrar email de contacto"
                                checked={form.data.config.show_email}
                                disabled={!resumeProfile.email}
                                onChange={(value) =>
                                    updateConfig('show_email', value)
                                }
                            />
                            {(['linkedin', 'github', 'website'] as const).map(
                                (key) => (
                                    <Checkbox
                                        key={key}
                                        label={`Mostrar ${key}`}
                                        checked={form.data.config.visible_links.includes(
                                            key,
                                        )}
                                        disabled={!resumeProfile.links?.[key]}
                                        onChange={(checked) =>
                                            toggleConfig(
                                                'visible_links',
                                                key,
                                                checked,
                                            )
                                        }
                                    />
                                ),
                            )}
                            <Checkbox
                                label="Incluir fotografía en la versión editorial"
                                checked={form.data.config.include_photo}
                                disabled={!profile.photo_url}
                                onChange={(value) =>
                                    updateConfig('include_photo', value)
                                }
                            />
                        </div>
                        <div>
                            <h3 className="mb-2 text-sm font-semibold">
                                Secciones visibles y orden
                            </h3>
                            {form.data.config.section_order.map(
                                (section, index) => (
                                    <div
                                        key={section}
                                        className="flex min-h-11 items-center gap-2 border-b border-slate-100 py-1"
                                    >
                                        <Checkbox
                                            label={sectionLabels[section]}
                                            checked={form.data.config.visible_sections.includes(
                                                section,
                                            )}
                                            onChange={(checked) =>
                                                toggleConfig(
                                                    'visible_sections',
                                                    section,
                                                    checked,
                                                )
                                            }
                                        />
                                        <div className="ml-auto flex">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                aria-label="Subir sección"
                                                disabled={index === 0}
                                                onClick={() =>
                                                    updateConfig(
                                                        'section_order',
                                                        form.data.config.section_order.map(
                                                            (item, i, rows) =>
                                                                i === index - 1
                                                                    ? rows[
                                                                          index
                                                                      ]!
                                                                    : i ===
                                                                        index
                                                                      ? rows[
                                                                            index -
                                                                                1
                                                                        ]!
                                                                      : item,
                                                        ),
                                                    )
                                                }
                                            >
                                                <ArrowUp className="size-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                aria-label="Bajar sección"
                                                disabled={
                                                    index ===
                                                    form.data.config
                                                        .section_order.length -
                                                        1
                                                }
                                                onClick={() =>
                                                    updateConfig(
                                                        'section_order',
                                                        form.data.config.section_order.map(
                                                            (item, i, rows) =>
                                                                i === index
                                                                    ? rows[
                                                                          index +
                                                                              1
                                                                      ]!
                                                                    : i ===
                                                                        index +
                                                                            1
                                                                      ? rows[
                                                                            index
                                                                        ]!
                                                                      : item,
                                                        ),
                                                    )
                                                }
                                            >
                                                <ArrowDown className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                    <div className="grid gap-5 lg:grid-cols-3">
                        <fieldset>
                            <legend className="mb-2 text-sm font-semibold">
                                Experiencias incluidas
                            </legend>
                            <div className="max-h-52 overflow-y-auto rounded-lg border border-slate-200 p-3">
                                {form.data.experiences.map(
                                    (item) =>
                                        item.id && (
                                            <Checkbox
                                                key={item.id}
                                                label={`${item.job_title || 'Cargo pendiente'} · ${item.company || 'Empresa pendiente'}`}
                                                checked={form.data.config.experience_ids.includes(
                                                    item.id,
                                                )}
                                                disabled={!item.is_visible}
                                                onChange={(checked) =>
                                                    toggleConfig(
                                                        'experience_ids',
                                                        item.id!,
                                                        checked,
                                                    )
                                                }
                                            />
                                        ),
                                )}
                                {form.data.experiences.length === 0 && (
                                    <p className="text-sm text-slate-500">
                                        Añade experiencias para seleccionarlas.
                                    </p>
                                )}
                            </div>
                        </fieldset>
                        <fieldset>
                            <legend className="mb-2 text-sm font-semibold">
                                Tecnologías incluidas
                            </legend>
                            <div className="max-h-52 overflow-y-auto rounded-lg border border-slate-200 p-3">
                                {technologies.map((item) => (
                                    <Checkbox
                                        key={item.id}
                                        label={`${item.name} · ${item.category}`}
                                        checked={form.data.config.technology_ids.includes(
                                            item.id,
                                        )}
                                        disabled={!item.is_visible}
                                        onChange={(checked) =>
                                            toggleConfig(
                                                'technology_ids',
                                                item.id,
                                                checked,
                                            )
                                        }
                                    />
                                ))}
                            </div>
                        </fieldset>
                        <fieldset>
                            <legend className="mb-2 text-sm font-semibold">
                                Proyectos seleccionados
                            </legend>
                            <div className="max-h-52 overflow-y-auto rounded-lg border border-slate-200 p-3">
                                {projects.map((item) => (
                                    <Checkbox
                                        key={item.id}
                                        label={`${item.name} · ${item.publication_status === 'published' && item.is_visible ? 'público' : 'borrador/oculto'}`}
                                        checked={form.data.config.project_ids.includes(
                                            item.id,
                                        )}
                                        onChange={(checked) =>
                                            toggleConfig(
                                                'project_ids',
                                                item.id,
                                                checked,
                                            )
                                        }
                                    />
                                ))}
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                                Solo los proyectos publicados y visibles
                                aparecen fuera de administración.
                            </p>
                        </fieldset>
                    </div>
                </section>
                <div className="sticky bottom-2 z-20 flex flex-wrap justify-end gap-2 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={form.processing || !form.isDirty}
                        onClick={save}
                    >
                        <Save className="mr-2 size-4" />
                        Guardar borrador
                    </Button>
                    <Button
                        type="button"
                        disabled={form.processing}
                        onClick={publish}
                    >
                        <Send className="mr-2 size-4" />
                        Guardar y publicar
                    </Button>
                </div>
            </form>
        </>
    );
}

function EntitySection({
    title,
    description,
    addLabel,
    onAdd,
    children,
}: {
    title: string;
    description: string;
    addLabel: string;
    onAdd: () => void;
    children: React.ReactNode;
}) {
    return (
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
            <div>
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="mt-1 text-sm text-slate-500">{description}</p>
            </div>
            {children}
            <Button type="button" variant="outline" onClick={onAdd}>
                <Plus className="mr-2 size-4" />
                {addLabel}
            </Button>
        </section>
    );
}
