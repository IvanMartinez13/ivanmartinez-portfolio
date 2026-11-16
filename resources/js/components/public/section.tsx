import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Props = HTMLAttributes<HTMLElement> & {
    id: string;
};

export function Section({ id, className, ...props }: Props) {
    return (
        <section
            id={id}
            className={cn(
                'scroll-mt-24 py-portfolio-section md:scroll-mt-28',
                className,
            )}
            {...props}
        />
    );
}
