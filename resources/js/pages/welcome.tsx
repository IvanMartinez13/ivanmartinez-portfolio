import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import {
    AboutSection,
    ContactSection,
    ExperienceSection,
    HeroSection,
    ProjectsSection,
    StackSection,
} from '@/components/public/portfolio-sections';
import PublicLayout from '@/layouts/public-layout';
import { PageBlockRenderer } from '@/components/public/page-block-renderer';
import type { PageBlock } from '@/types/page-builder';
import type { PortfolioContent, PortfolioSectionKey } from '@/types/portfolio';

type Props = {
    portfolio: PortfolioContent;
    builderBlocks?: PageBlock[];
    pagePreview?: boolean;
    pageSeo?: { title: string | null; description: string | null };
};

export default function Welcome({ portfolio, builderBlocks, pagePreview = false, pageSeo }: Props) {
    const sections: Record<PortfolioSectionKey, ReactNode> = {
        hero: <HeroSection portfolio={portfolio} />,
        projects: <ProjectsSection portfolio={portfolio} />,
        experience: <ExperienceSection portfolio={portfolio} />,
        about: <AboutSection portfolio={portfolio} />,
        stack: <StackSection portfolio={portfolio} />,
        contact: <ContactSection portfolio={portfolio} />,
    };

    const visibleSections = portfolio.sections
        .filter(({ visible }) => visible)
        .sort((first, second) => first.order - second.order);

    return (
        <PublicLayout portfolio={portfolio}>
            <Head
                title={`${pageSeo?.title || portfolio.settings.siteTitle} · ${portfolio.identity.role}`}
            >
                <meta name="description" content={pageSeo?.description || portfolio.settings.metaDescription} />
            </Head>
            <main id="main-content">
                {builderBlocks ? <PageBlockRenderer blocks={builderBlocks} portfolio={portfolio} preview={pagePreview} /> : visibleSections.map((section) => (
                    <div key={section.key}>{sections[section.key]}</div>
                ))}
            </main>
        </PublicLayout>
    );
}
