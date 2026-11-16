import type { HTMLAttributes } from 'react';
import { Badge as ShadcnBadge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function Badge({
    className,
    ...props
}: HTMLAttributes<HTMLSpanElement>) {
    return (
        <ShadcnBadge
            variant="outline"
            className={cn(
                'h-auto rounded-full border-line bg-white px-3 py-1 text-[11px] font-medium tracking-wide text-portfolio-muted',
                className,
            )}
            {...props}
        />
    );
}
