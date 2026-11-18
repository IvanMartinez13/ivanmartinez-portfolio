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
    visualColor?: string | null;
};

export type AppearanceConfig = {
    preset: string;
    colors: {
        navy: string;
        primary: string;
        secondary: string;
        background: string;
        surface: string;
        text: string;
        muted: string;
        accent: string;
        tint: string;
        line: string;
    };
    fontFamily: 'Geist' | 'Inter' | 'System';
    typeScale: 'compact' | 'balanced' | 'expressive';
    radius: 'sharp' | 'soft' | 'round';
    shadow: 'none' | 'subtle' | 'editorial';
    container: 'compact' | 'standard' | 'wide';
    buttonStyle: 'solid' | 'outline' | 'editorial';
    spacing: 'compact' | 'comfortable' | 'generous';
    motion: 'reduced' | 'subtle' | 'full';
    headerVariant: 'editorial' | 'minimal';
    footerVariant: 'editorial' | 'minimal';
};

export type AppearanceTheme = AppearanceConfig & {
    cssVariables: Record<string, string>;
};

export type PublicChromeContent = {
    identity: { monogram: string; name: string };
    navigation: PortfolioLink[];
    resume: {
        published: boolean;
        showNavigation: boolean;
        navigationLabel: string;
    };
    contact: {
        email: string | null;
        linkedin: string | null;
        github: string | null;
        website: string | null;
    };
    footer: { copyright: string; note: string };
    appearance: AppearanceTheme;
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
    visualColor?: string | null;
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
    media: {
        kind: 'image' | 'video';
        url: string;
        alt: string | null;
        caption: string | null;
    }[];
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
    resume: {
        published: boolean;
        showNavigation: boolean;
        navigationLabel: string;
    };
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
    appearance: AppearanceTheme;
};
