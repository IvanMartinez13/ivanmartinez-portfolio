import type { PropsWithChildren } from 'react';
import { Footer } from '@/components/public/footer';
import { Navigation } from '@/components/public/navigation';
import type { PublicChromeContent } from '@/types/portfolio';

type Props = PropsWithChildren<{
    portfolio: PublicChromeContent;
}>;

export default function PublicLayout({ children, portfolio }: Props) {
    return (
        <div className="min-h-screen bg-canvas font-sans text-portfolio-ink antialiased">
            <a
                href="#main-content"
                className="sr-only z-50 rounded-md bg-white px-4 py-3 text-portfolio-primary focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:ring-2 focus:ring-portfolio-accent focus:outline-none"
            >
                Saltar al contenido
            </a>
            <Navigation
                brand={portfolio.identity.monogram}
                links={portfolio.navigation}
                cvUrl={portfolio.contact.cvUrl}
            />
            {children}
            <Footer portfolio={portfolio} />
        </div>
    );
}
