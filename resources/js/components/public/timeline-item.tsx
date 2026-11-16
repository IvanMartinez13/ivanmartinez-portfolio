import { Check } from 'lucide-react';

type Props = {
    label: string;
    title: string;
    description: string;
    showConnector?: boolean;
};

export function TimelineItem({
    label,
    title,
    description,
    showConnector = true,
}: Props) {
    const connectorClass = showConnector
        ? 'after:absolute after:top-9 after:left-1/2 after:h-16 after:w-px after:-translate-x-1/2 after:bg-line sm:after:h-20'
        : '';

    return (
        <div className="relative grid grid-cols-[2.25rem_1fr] gap-4 sm:grid-cols-[8rem_2.25rem_1fr] sm:gap-6">
            <p className="hidden pt-1 text-sm font-medium text-portfolio-muted sm:block">
                {label}
            </p>
            <span
                className={`relative flex size-9 items-center justify-center rounded-full border border-portfolio-accent/25 bg-white text-portfolio-accent ${connectorClass}`}
            >
                <Check aria-hidden="true" className="size-4" />
            </span>
            <div className="pb-14 sm:pb-16">
                <p className="mb-1 text-xs font-medium tracking-[0.12em] text-portfolio-accent uppercase sm:hidden">
                    {label}
                </p>
                <h3 className="text-xl font-semibold tracking-[-0.03em] text-portfolio-ink sm:text-2xl">
                    {title}
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-portfolio-muted sm:text-base sm:leading-7">
                    {description}
                </p>
            </div>
        </div>
    );
}
