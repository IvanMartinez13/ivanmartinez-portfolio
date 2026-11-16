import { Head } from '@inertiajs/react';
import { PageBlockRenderer } from '@/components/public/page-block-renderer';
import PublicLayout from '@/layouts/public-layout';
import type { PageBlock } from '@/types/page-builder';
import type { PublicChromeContent } from '@/types/portfolio';

type Props = { page: { title: string; slug: string; seoTitle: string; seoDescription: string | null }; blocks: PageBlock[]; portfolio: PublicChromeContent; preview: boolean };

export default function PublicPage({ page, blocks, portfolio, preview }: Props) {
    return <PublicLayout portfolio={portfolio}><Head title={`${page.seoTitle} · ivanmartinez.dev`}>{page.seoDescription && <meta name="description" content={page.seoDescription} />}</Head><main id="main-content"><PageBlockRenderer blocks={blocks} portfolio={portfolio} preview={preview} /></main></PublicLayout>;
}
