import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLElement>) {
    return (
        <article
            className={cn(
                'rounded-portfolio-card border border-line bg-surface transition-colors duration-[var(--portfolio-transition)] ease-out hover:border-portfolio-primary/20',
                className,
            )}
            {...props}
        />
    );
}
