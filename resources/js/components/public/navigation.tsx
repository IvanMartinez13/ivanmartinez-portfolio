import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/public/button';
import type { PortfolioLink } from '@/types/portfolio';

type Props = {
    brand: string;
    brandName?: string;
    links: PortfolioLink[];
    resume: {
        published: boolean;
        showNavigation: boolean;
        navigationLabel: string;
    };
};

export function Navigation({ brand, brandName, links, resume }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="relative z-40 border-b border-line bg-canvas">
            <nav
                aria-label="Navegación principal"
                className="mx-auto flex h-[4.5rem] w-full max-w-portfolio items-center justify-between px-5 sm:px-8 lg:h-[5.25rem] lg:px-10"
            >
                <a
                    href="#main-content"
                    aria-label={`${brand} — inicio`}
                    className="group inline-flex items-center gap-3 rounded-sm text-sm font-semibold tracking-tight text-portfolio-ink focus-visible:ring-2 focus-visible:ring-portfolio-accent focus-visible:outline-none"
                >
                    <span className="grid size-10 place-items-center rounded-full bg-portfolio-navy font-mono text-sm text-white transition-transform duration-[var(--portfolio-transition)] group-hover:rotate-[-8deg]">
                        {brand}
                    </span>
                    {brandName && (
                        <span className="hidden sm:inline">
                            {brandName
                                .normalize('NFD')
                                .replace(/[\u0300-\u036f]/g, '')
                                .replace(/\s+/g, '')
                                .toLowerCase()}
                            <span className="text-portfolio-primary">.dev</span>
                        </span>
                    )}
                </a>

                <div className="hidden items-center gap-7 md:flex">
                    {links.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-portfolio-muted transition-colors hover:text-portfolio-primary focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-portfolio-accent focus-visible:outline-none"
                        >
                            {link.label}
                        </a>
                    ))}
                    {resume.published && resume.showNavigation && (
                        <Button asChild size="sm" className="h-10 px-4">
                            <a href="/cv">{resume.navigationLabel}</a>
                        </Button>
                    )}
                </div>

                <button
                    type="button"
                    className="inline-flex size-11 items-center justify-center rounded-full border border-line bg-surface text-portfolio-primary transition-colors hover:bg-portfolio-tint focus-visible:ring-2 focus-visible:ring-portfolio-accent focus-visible:outline-none md:hidden"
                    aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
                    aria-expanded={isOpen}
                    aria-controls="mobile-navigation"
                    onClick={() => setIsOpen((open) => !open)}
                >
                    {isOpen ? (
                        <X aria-hidden="true" className="size-5" />
                    ) : (
                        <Menu aria-hidden="true" className="size-5" />
                    )}
                </button>
            </nav>

            {isOpen && (
                <div
                    id="mobile-navigation"
                    className="border-t border-line bg-canvas px-5 py-4 sm:px-8 md:hidden"
                >
                    <div className="mx-auto flex max-w-portfolio flex-col gap-1">
                        {links.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className="rounded-md px-3 py-3 text-sm font-medium text-portfolio-ink transition-colors hover:bg-portfolio-tint focus-visible:ring-2 focus-visible:ring-portfolio-accent focus-visible:outline-none"
                            >
                                {link.label}
                            </a>
                        ))}
                        {resume.published && resume.showNavigation && (
                            <a
                                href="/cv"
                                className="mt-2 inline-flex min-h-11 items-center justify-center rounded-full bg-portfolio-primary px-5 text-sm font-medium text-white focus-visible:ring-2 focus-visible:ring-portfolio-accent focus-visible:ring-offset-2 focus-visible:outline-none"
                            >
                                {resume.navigationLabel}
                            </a>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
