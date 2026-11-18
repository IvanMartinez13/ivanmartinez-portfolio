import { useEffect, useRef, type ReactNode } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import {
    Bold,
    Heading2,
    Heading3,
    Italic,
    Link2,
    List,
    ListOrdered,
    Quote,
    Redo2,
    Undo2,
} from 'lucide-react';

type Props = {
    value: string;
    onChange: (value: string) => void;
    label?: string;
};

export function RichTextEditor({
    value,
    onChange,
    label = 'Contenido',
}: Props) {
    const onChangeRef = useRef(onChange);
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                autolink: true,
                protocols: ['https'],
            }),
        ],
        content: value,
        immediatelyRender: false,
        onUpdate: ({ editor: current }) =>
            onChangeRef.current(current.getHTML()),
        editorProps: {
            attributes: {
                'aria-label': label,
                class: 'min-h-40 rounded-b-lg px-3 py-3 text-sm leading-7 text-slate-800 outline-none [&_a]:text-teal-800 [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-6',
            },
        },
    });

    useEffect(() => {
        if (editor && editor.getHTML() !== value)
            editor.commands.setContent(value || '<p></p>', {
                emitUpdate: false,
            });
    }, [editor, value]);

    if (!editor)
        return (
            <div
                className="min-h-40 animate-pulse rounded-lg border border-slate-200 bg-slate-50"
                aria-label="Cargando editor"
            />
        );

    const button = (
        labelText: string,
        icon: ReactNode,
        action: () => void,
        active = false,
        disabled = false,
    ) => (
        <button
            type="button"
            aria-label={labelText}
            title={labelText}
            aria-pressed={active}
            disabled={disabled}
            onClick={action}
            className="inline-flex size-9 items-center justify-center rounded-md text-slate-600 hover:bg-white hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-teal-700 disabled:opacity-40"
            key={labelText}
        >
            {icon}
        </button>
    );

    return (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div
                role="toolbar"
                aria-label="Formato del texto"
                className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-1"
            >
                {button(
                    'Negrita',
                    <Bold className="size-4" />,
                    () => editor.chain().focus().toggleBold().run(),
                    editor.isActive('bold'),
                )}
                {button(
                    'Cursiva',
                    <Italic className="size-4" />,
                    () => editor.chain().focus().toggleItalic().run(),
                    editor.isActive('italic'),
                )}
                {button(
                    'Encabezado 2',
                    <Heading2 className="size-4" />,
                    () =>
                        editor
                            .chain()
                            .focus()
                            .toggleHeading({ level: 2 })
                            .run(),
                    editor.isActive('heading', { level: 2 }),
                )}
                {button(
                    'Encabezado 3',
                    <Heading3 className="size-4" />,
                    () =>
                        editor
                            .chain()
                            .focus()
                            .toggleHeading({ level: 3 })
                            .run(),
                    editor.isActive('heading', { level: 3 }),
                )}
                {button(
                    'Lista',
                    <List className="size-4" />,
                    () => editor.chain().focus().toggleBulletList().run(),
                    editor.isActive('bulletList'),
                )}
                {button(
                    'Lista numerada',
                    <ListOrdered className="size-4" />,
                    () => editor.chain().focus().toggleOrderedList().run(),
                    editor.isActive('orderedList'),
                )}
                {button(
                    'Cita',
                    <Quote className="size-4" />,
                    () => editor.chain().focus().toggleBlockquote().run(),
                    editor.isActive('blockquote'),
                )}
                {button(
                    'Enlace',
                    <Link2 className="size-4" />,
                    () => {
                        const current = editor.getAttributes('link').href as
                            | string
                            | undefined;
                        const href = window.prompt(
                            'URL HTTPS o ruta local',
                            current ?? 'https://',
                        );
                        if (href === null) return;
                        if (
                            !href.startsWith('/') &&
                            !href.startsWith('https://')
                        )
                            return;
                        if (href.startsWith('//')) return;
                        editor
                            .chain()
                            .focus()
                            .extendMarkRange('link')
                            .setLink({ href })
                            .run();
                    },
                    editor.isActive('link'),
                )}
                <span
                    className="mx-1 my-1 border-l border-slate-300"
                    aria-hidden="true"
                />
                {button(
                    'Deshacer',
                    <Undo2 className="size-4" />,
                    () => editor.chain().focus().undo().run(),
                    false,
                    !editor.can().undo(),
                )}
                {button(
                    'Rehacer',
                    <Redo2 className="size-4" />,
                    () => editor.chain().focus().redo().run(),
                    false,
                    !editor.can().redo(),
                )}
            </div>
            <EditorContent editor={editor} />
        </div>
    );
}
