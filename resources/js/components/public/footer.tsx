import { ArrowUpRight, Mail } from 'lucide-react';
import { Container } from '@/components/public/container';
import type { PublicChromeContent } from '@/types/portfolio';

type Props = {
    portfolio: PublicChromeContent;
};

export function Footer({ portfolio }: Props) {
    const { contact, footer, identity } = portfolio;

    return (
        <footer className="border-t border-line bg-surface">
            <Container className="flex flex-col gap-5 py-7 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-semibold tracking-[-0.03em] text-portfolio-ink">
                        {footer.copyright}
                    </p>
                    <p className="mt-1 text-xs text-portfolio-muted">
                        {footer.note}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                    {contact.email && (
                        <a
                            href={`mailto:${contact.email}`}
                            className="inline-flex items-center gap-2 text-sm text-portfolio-muted transition-colors hover:text-portfolio-primary focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-portfolio-accent focus-visible:outline-none"
                        >
                            <Mail aria-hidden="true" className="size-4" />
                            Email
                        </a>
                    )}
                    {contact.linkedin && (
                        <a
                            href={contact.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-portfolio-muted transition-colors hover:text-portfolio-primary focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-portfolio-accent focus-visible:outline-none"
                        >
                            LinkedIn
                            <ArrowUpRight
                                aria-hidden="true"
                                className="size-3.5"
                            />
                        </a>
                    )}
                    {contact.github && (
                        <a href={contact.github} target="_blank" rel="noreferrer" className="text-sm text-portfolio-muted transition-colors hover:text-portfolio-primary focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-portfolio-accent focus-visible:outline-none">GitHub</a>
                    )}
                    {contact.website && (
                        <a href={contact.website} target="_blank" rel="noreferrer" className="text-sm text-portfolio-muted transition-colors hover:text-portfolio-primary focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-portfolio-accent focus-visible:outline-none">Sitio web</a>
                    )}
                    <a
                        href="#main-content"
                        className="text-sm text-portfolio-muted transition-colors hover:text-portfolio-primary focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-portfolio-accent focus-visible:outline-none"
                    >
                        Volver arriba
                    </a>
                    <span className="sr-only">{identity.name}</span>
                </div>
            </Container>
        </footer>
    );
}
