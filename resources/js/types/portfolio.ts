export type PortfolioLink = {
    label: string;
    href: string;
};

export type PortfolioProject = {
    name: string;
    slug: string;
    category: string;
    monogram: string;
    description: string;
    imageUrl: string | null;
    imageAlt: string | null;
    technologies: string[];
    isFeatured: boolean;
};

export type PublicChromeContent = {
    identity: { monogram: string; name: string };
    navigation: PortfolioLink[];
    contact: { cvUrl: string | null; email: string | null; linkedin: string | null; github: string | null; website: string | null };
    footer: { copyright: string; note: string };
};

export type ProjectCaseStudySection = {
    key: string;
    title: string;
    body: string;
    position: number;
};

export type ProjectDetail = {
    name: string;
    slug: string;
    summary: string;
    description: string | null;
    category: string;
    projectType: string;
    role: string;
    clientCompany: string | null;
    developmentStatus: string;
    mainImageUrl: string | null;
    mainImageAlt: string | null;
    startedAt: string | null;
    completedAt: string | null;
    publicUrl: string | null;
    repositoryUrl: string | null;
    seoTitle: string;
    seoDescription: string;
    preview: boolean;
    technologies: { name: string; slug: string; category: string }[];
    sections: ProjectCaseStudySection[];
    media: { kind: 'image' | 'video'; url: string; alt: string | null; caption: string | null }[];
};

export type TechnologyGroup = {
    name: string;
    items: string[];
};

export type PortfolioSectionKey =
    | 'hero'
    | 'projects'
    | 'experience'
    | 'about'
    | 'stack'
    | 'contact';

export type PortfolioSectionConfig = {
    key: PortfolioSectionKey;
    visible: boolean;
    order: number;
    content: {
        eyebrow?: string;
        headline?: string;
        title?: string;
        description?: string;
        note?: string;
        items?: PortfolioProject[];
        groups?: TechnologyGroup[];
    };
};

export type PortfolioContent = {
    identity: {
        name: string;
        monogram: string;
        role: string;
        specialty: string;
        location: string | null;
        photoUrl: string | null;
    };
    hero: {
        eyebrow: string;
        headline: string;
        description: string;
        experience: string;
        experienceYears: number | null;
        availability: string;
    };
    navigation: PortfolioLink[];
    sections: PortfolioSectionConfig[];
    projects: PortfolioProject[];
    about: {
        eyebrow: string;
        title: string;
        paragraphs: string[];
    };
    technologyGroups: TechnologyGroup[];
    contact: {
        eyebrow: string;
        title: string;
        description: string;
        email: string | null;
        linkedin: string | null;
        github: string | null;
        website: string | null;
        cvUrl: string | null;
    };
    footer: {
        copyright: string;
        note: string;
    };
    settings: {
        siteTitle: string;
        metaDescription: string;
        locale: string;
    };
};
