import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Monitor, Smartphone, Tablet } from 'lucide-react';
import { useState } from 'react';

type Props = { title: string; editUrl: string; previewUrl: string };
const widths = { desktop: '100%', tablet: '768px', mobile: '390px' } as const;

export default function PagePreview({ title, editUrl, previewUrl }: Props) {
    const [viewport, setViewport] = useState<keyof typeof widths>('desktop');
    return <><Head title={`Vista previa · ${title}`} /><div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3"><div><Link href={editUrl} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"><ArrowLeft className="size-4" />Volver al editor</Link><p className="mt-1 text-xs text-slate-500">Previsualización privada · {title}</p></div><div className="flex gap-1 rounded-lg bg-slate-100 p-1">{([['desktop', Monitor, 'Escritorio'], ['tablet', Tablet, 'Tablet'], ['mobile', Smartphone, 'Móvil']] as const).map(([value, Icon, label]) => <button key={value} type="button" aria-label={label} aria-pressed={viewport === value} onClick={() => setViewport(value)} className={`rounded-md p-2 ${viewport === value ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}><Icon className="size-4" /></button>)}</div></div><div className="flex justify-center overflow-auto rounded-xl border border-slate-200 bg-slate-100 p-3 sm:p-5"><iframe title={`Vista previa de ${title}`} src={previewUrl} style={{ width: widths[viewport], maxWidth: '100%' }} className="h-[78vh] min-h-[620px] border-0 bg-white shadow-sm transition-[width] duration-200" /></div></>;
}
