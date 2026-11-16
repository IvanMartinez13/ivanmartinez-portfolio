export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export type PageBlock = {
    id: string;
    type: string;
    position: number;
    visible: boolean;
    variant: 'default' | 'subtle' | 'bordered';
    spacing: 'none' | 'compact' | 'default' | 'relaxed';
    nav_label?: string | null;
    content: Record<string, JsonValue>;
    data?: Record<string, JsonValue> | JsonValue[];
};

export type PageBuilderPage = {
    id: number | null;
    key?: string;
    title: string;
    slug: string;
    seo_title: string;
    seo_description: string;
    status: 'draft' | 'published';
    blocks: PageBlock[];
};
