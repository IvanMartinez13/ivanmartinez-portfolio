import type { CSSProperties, PropsWithChildren } from 'react';
import { Footer } from '@/components/public/footer';
import { Navigation } from '@/components/public/navigation';
import type { PublicChromeContent } from '@/types/portfolio';

type Props = PropsWithChildren<{
    portfolio: PublicChromeContent;
    appearancePreview?: boolean;
}>;

export default function PublicLayout({
    children,
    portfolio,
    appearancePreview = false,
}: Props) {
    const style = Object.fromEntries(
        Object.entries(portfolio.appearance.cssVariables).map(
            ([key, value]) => [key, value],
        ),
    ) as CSSProperties;

    return (
        <div
            className="min-h-screen bg-canvas font-sans text-portfolio-ink antialiased"
            style={style}
            data-header-variant={portfolio.appearance.headerVariant}
            data-footer-variant={portfolio.appearance.footerVariant}
            data-button-style={portfolio.appearance.buttonStyle}
            data-motion={portfolio.appearance.motion}
        >
            {appearancePreview && (
                <div className="appearance-preview-banner">
                    Previsualización de apariencia · solo visible en
                    administración
                </div>
            )}
            <a
                href="#main-content"
                className="sr-only z-50 rounded-md bg-white px-4 py-3 text-portfolio-primary focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:ring-2 focus:ring-portfolio-accent focus:outline-none"
            >
                Saltar al contenido
            </a>
            <Navigation
                brand={portfolio.identity.monogram}
                brandName={portfolio.identity.name}
                links={portfolio.navigation}
                resume={portfolio.resume}
            />
            {children}
            <Footer portfolio={portfolio} />
        </div>
    );
}
