import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { JsonValue } from '@/types/page-builder';

type Props = { blockType: string; field: string; value: JsonValue; onChange: (value: JsonValue[]) => void };
type Field = { key: string; label: string; multiline?: boolean; commaSeparated?: boolean };
const specs: Record<string, Record<string, { title: string; fields: Field[]; create: Record<string, JsonValue> }>> = {
    gallery: { images: { title: 'Imágenes', fields: [{ key: 'url', label: 'URL' }, { key: 'alt', label: 'Texto alternativo' }, { key: 'caption', label: 'Pie de imagen' }], create: { url: '', alt: '', caption: '' } } },
    statistics: { items: { title: 'Estadísticas', fields: [{ key: 'value', label: 'Valor' }, { key: 'label', label: 'Descripción' }], create: { value: '', label: '' } } },
    timeline: { items: { title: 'Experiencias', fields: [{ key: 'role', label: 'Cargo' }, { key: 'company', label: 'Empresa' }, { key: 'period', label: 'Periodo' }, { key: 'description', label: 'Descripción', multiline: true }], create: { role: '', company: '', period: '', description: '' } } },
    technologies: { groups: { title: 'Grupos de tecnologías', fields: [{ key: 'category', label: 'Categoría' }, { key: 'items', label: 'Tecnologías (separadas por comas)', commaSeparated: true }], create: { category: '', items: [] } } },
    columns: { columns: { title: 'Columnas', fields: [{ key: 'title', label: 'Título' }, { key: 'body', label: 'Contenido', multiline: true }], create: { title: '', body: '' } } },
};

const asRecord = (value: JsonValue): Record<string, JsonValue> => value !== null && typeof value === 'object' && !Array.isArray(value) ? value : {};

export function StructuredBlockField({ blockType, field, value, onChange }: Props) {
    const spec = specs[blockType]?.[field];
    if (!spec) return null;
    const rows = Array.isArray(value) ? value : [];

    const setValue = (rowIndex: number, key: string, input: string, commaSeparated: boolean) => {
        onChange(rows.map((row, index) => {
            if (index !== rowIndex) return row;
            return { ...asRecord(row), [key]: commaSeparated ? input.split(',').map((item) => item.trim()).filter(Boolean) : input };
        }));
    };

    return <section className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3"><div className="flex items-center justify-between"><h3 className="text-xs font-semibold text-slate-700">{spec.title}</h3><span className="text-xs text-slate-400">{rows.length}</span></div>{rows.map((row, index) => { const item = asRecord(row); return <div key={index} className="rounded-md border border-slate-200 bg-white p-3"><div className="mb-3 flex items-center justify-between"><p className="text-xs font-medium text-slate-500">Elemento {index + 1}</p><Button type="button" variant="ghost" size="icon" aria-label={`Eliminar elemento ${index + 1}`} onClick={() => onChange(rows.filter((_, rowIndex) => rowIndex !== index))}><Trash2 className="size-3.5 text-red-600" /></Button></div><div className="space-y-2.5">{spec.fields.map((fieldSpec) => { const fieldValue = item[fieldSpec.key] ?? (fieldSpec.key === 'category' ? item.name : undefined); const shown = fieldSpec.commaSeparated ? (Array.isArray(fieldValue) ? fieldValue.join(', ') : '') : String(fieldValue ?? ''); const controlClass = 'w-full rounded-md border border-slate-200 px-2.5 py-2 text-xs text-slate-800 focus-visible:outline-2 focus-visible:outline-teal-600'; return <label key={fieldSpec.key} className="block space-y-1 text-xs text-slate-600">{fieldSpec.label}{fieldSpec.multiline ? <textarea rows={3} value={shown} onChange={(event) => setValue(index, fieldSpec.key, event.target.value, !!fieldSpec.commaSeparated)} className={controlClass} /> : <input value={shown} onChange={(event) => setValue(index, fieldSpec.key, event.target.value, !!fieldSpec.commaSeparated)} className={controlClass} />}</label>; })}</div></div>; })}<Button type="button" variant="outline" size="sm" onClick={() => onChange([...rows, { ...spec.create }])}><Plus className="mr-1.5 size-3.5" />Añadir elemento</Button></section>;
}
