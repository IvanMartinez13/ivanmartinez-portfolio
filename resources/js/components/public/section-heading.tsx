import type { ReactNode } from 'react';

type Props = {
    titleId?: string;
    eyebrow: string;
    title: string;
    description?: string;
    aside?: ReactNode;
};

export function SectionHeading({
    titleId,
    eyebrow,
    title,
    description,
    aside,
}: Props) {
    return (
        <div className="mb-9 flex flex-col gap-5 border-b border-line pb-6 md:mb-12 md:flex-row md:items-end md:justify-between md:gap-10">
            <div className="max-w-2xl">
                <p className="mb-3 text-xs font-semibold tracking-[0.16em] text-portfolio-accent uppercase">
                    {eyebrow}
                </p>
                <h2
                    id={titleId}
                    className="text-3xl leading-tight font-semibold tracking-[-0.04em] text-balance text-portfolio-ink sm:text-4xl md:text-[2.75rem]"
                >
                    {title}
                </h2>
                {description && (
                    <p className="mt-4 max-w-xl text-base leading-7 text-portfolio-muted">
                        {description}
                    </p>
                )}
            </div>
            {aside && <div className="shrink-0">{aside}</div>}
        </div>
    );
}
