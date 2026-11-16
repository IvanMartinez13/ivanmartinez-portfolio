import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/public/button';
import type { PortfolioLink } from '@/types/portfolio';

type Props = {
    brand: string;
    links: PortfolioLink[];
    cvUrl: string | null;
};

export function Navigation({ brand, links, cvUrl }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="sticky top-0 z-40 border-b border-line bg-canvas">
            <nav
                aria-label="Navegación principal"
                className="mx-auto flex h-[4.5rem] w-full max-w-portfolio items-center justify-between px-5 sm:px-8 lg:h-20 lg:px-10"
            >
                <a
                    href="#main-content"
                    aria-label={`${brand} — inicio`}
                    className="rounded-sm text-xl font-semibold tracking-[-0.09em] text-portfolio-primary focus-visible:ring-2 focus-visible:ring-portfolio-accent focus-visible:outline-none"
                >
                    {brand}
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
                    {cvUrl ? (
                        <Button asChild size="sm" className="h-10 px-4">
                            <a href={cvUrl} target="_blank" rel="noreferrer">
                                Ver CV
                            </a>
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            variant="outline"
                            disabled
                            title="El enlace al CV está pendiente de configurar"
                            aria-label="CV: enlace pendiente de configurar"
                            className="h-10 cursor-not-allowed px-4 opacity-65"
                        >
                            CV pendiente
                        </Button>
                    )}
                </div>

                <button
                    type="button"
                    className="inline-flex size-10 items-center justify-center rounded-full border border-line bg-white text-portfolio-primary transition-colors hover:bg-portfolio-tint focus-visible:ring-2 focus-visible:ring-portfolio-accent focus-visible:outline-none md:hidden"
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
                        {cvUrl ? (
                            <a
                                href={cvUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 inline-flex min-h-11 items-center justify-center rounded-full bg-portfolio-primary px-5 text-sm font-medium text-white focus-visible:ring-2 focus-visible:ring-portfolio-accent focus-visible:ring-offset-2 focus-visible:outline-none"
                            >
                                Ver CV
                            </a>
                        ) : (
                            <span
                                aria-label="CV: enlace pendiente de configurar"
                                className="mt-2 inline-flex min-h-11 items-center justify-center rounded-full border border-line px-5 text-sm font-medium text-portfolio-muted"
                            >
                                CV pendiente de configurar
                            </span>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
