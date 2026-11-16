import { Badge } from '@/components/public/badge';

type Props = {
    name: string;
};

export function TechnologyBadge({ name }: Props) {
    return (
        <Badge className="rounded-md bg-white px-3 py-1.5 text-xs text-portfolio-ink">
            {name}
        </Badge>
    );
}
