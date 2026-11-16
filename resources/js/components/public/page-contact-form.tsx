import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';

export function PageContactForm({ title, description }: { title: string; description: string }) {
    const form = useForm({ name: '', email: '', message: '' });
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post('/contact', { preserveScroll: true, onSuccess: () => form.reset() });
    };

    return <section className="py-14 sm:py-18"><div className="mx-auto max-w-2xl px-5"><h2 className="text-3xl font-semibold text-portfolio-ink">{title || 'Contacto'}</h2>{description && <p className="mt-3 text-portfolio-muted">{description}</p>}<form onSubmit={submit} className="mt-7 space-y-4"><label className="block space-y-1.5 text-sm font-medium text-portfolio-ink">Nombre<input required maxLength={120} autoComplete="name" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} className="h-11 w-full rounded-md border border-line bg-white px-3 font-normal" />{form.errors.name && <span className="text-xs text-red-600">{form.errors.name}</span>}</label><label className="block space-y-1.5 text-sm font-medium text-portfolio-ink">Correo electrónico<input required type="email" maxLength={254} autoComplete="email" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} className="h-11 w-full rounded-md border border-line bg-white px-3 font-normal" />{form.errors.email && <span className="text-xs text-red-600">{form.errors.email}</span>}</label><label className="block space-y-1.5 text-sm font-medium text-portfolio-ink">Mensaje<textarea required minLength={10} maxLength={5000} rows={5} value={form.data.message} onChange={(event) => form.setData('message', event.target.value)} className="w-full rounded-md border border-line bg-white px-3 py-2 font-normal" />{form.errors.message && <span className="text-xs text-red-600">{form.errors.message}</span>}</label>{form.errors.email && <p role="alert" className="text-sm text-red-600">No se ha podido enviar el mensaje. Comprueba los datos e inténtalo de nuevo.</p>}<Button type="submit" disabled={form.processing}>{form.processing ? 'Enviando…' : 'Enviar mensaje'}</Button>{form.recentlySuccessful && <p role="status" className="text-sm text-teal-700">Mensaje enviado. Gracias por contactar.</p>}</form></div></section>;
}
