import type { ComponentProps } from 'react';
import { Button as ShadcnButton } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Button({
    className,
    variant = 'default',
    size = 'lg',
    ...props
}: ComponentProps<typeof ShadcnButton>) {
    return (
        <ShadcnButton
            variant={variant}
            size={size}
            className={cn(
                'h-12 rounded-portfolio-control px-5 font-medium shadow-none transition duration-[var(--portfolio-transition)] ease-out hover:-translate-y-0.5 focus-visible:ring-portfolio-accent/35',
                variant === 'default' &&
                    'bg-portfolio-primary text-white hover:bg-portfolio-primary/90',
                variant === 'outline' &&
                    'border-line bg-transparent text-portfolio-ink hover:border-portfolio-primary/30 hover:bg-portfolio-tint hover:text-portfolio-primary',
                className,
            )}
            {...props}
        />
    );
}
