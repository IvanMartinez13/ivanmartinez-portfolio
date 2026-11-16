<?php

return [
    'identity' => [
        'name' => 'Iván Martínez',
        'monogram' => 'IM.',
        'role' => 'Full Stack Developer',
    ],

    'hero' => [
        'eyebrow' => 'Desarrollo full stack · Producto digital',
        'headline' => 'Software útil, bien pensado y preparado para crecer.',
        'description' => 'Diseño y desarrollo productos digitales y software empresarial con atención al detalle, desde la arquitectura hasta la experiencia de uso.',
        'experience' => '≈ 5 años de experiencia',
        'availability' => 'Portfolio personal · Contenido inicial',
    ],

    'navigation' => [
        ['label' => 'Proyectos', 'href' => '#proyectos'],
        ['label' => 'Experiencia', 'href' => '#experiencia'],
        ['label' => 'Sobre mí', 'href' => '#sobre-mi'],
        ['label' => 'Stack', 'href' => '#stack'],
        ['label' => 'Contacto', 'href' => '#contacto'],
    ],

    'sections' => [
        ['key' => 'projects', 'visible' => true, 'order' => 10],
        ['key' => 'experience', 'visible' => true, 'order' => 20],
        ['key' => 'about', 'visible' => true, 'order' => 30],
        ['key' => 'stack', 'visible' => true, 'order' => 40],
        ['key' => 'contact', 'visible' => true, 'order' => 50],
    ],

    'projects' => [
        [
            'name' => 'ESG Suite Solutions',
            'category' => 'Proyecto destacado',
            'monogram' => 'ESG',
            'description' => 'Descripción provisional: alcance y contribución pendientes de validar.',
        ],
        [
            'name' => 'Balón Control',
            'category' => 'Proyecto destacado',
            'monogram' => 'BC',
            'description' => 'Descripción provisional: alcance y contribución pendientes de validar.',
        ],
        [
            'name' => 'Baleares Sport Club',
            'category' => 'Proyecto destacado',
            'monogram' => 'BSC',
            'description' => 'Descripción provisional: alcance y contribución pendientes de validar.',
        ],
        [
            'name' => 'Legislación Online',
            'category' => 'Proyecto destacado',
            'monogram' => 'LO',
            'description' => 'Descripción provisional: alcance y contribución pendientes de validar.',
        ],
    ],

    'about' => [
        'eyebrow' => 'Perfil',
        'title' => 'Tecnología con criterio. Producto con propósito.',
        'paragraphs' => [
            'Soy Iván Martínez, desarrollador Full Stack. Trabajo en productos digitales y software empresarial, cuidando tanto la solidez técnica como la claridad de la experiencia.',
            'Me interesa construir soluciones mantenibles, entender el problema antes de programar y colaborar de cerca con las personas que usan el producto.',
        ],
    ],

    'technologyGroups' => [
        [
            'name' => 'Frontend',
            'items' => ['React', 'TypeScript', 'Inertia', 'Tailwind CSS'],
        ],
        [
            'name' => 'Backend',
            'items' => ['Laravel', 'PHP'],
        ],
        [
            'name' => 'Datos y entorno',
            'items' => ['PostgreSQL', 'Docker', 'DDEV'],
        ],
    ],

    'contact' => [
        'eyebrow' => 'Siguiente paso',
        'title' => '¿Hablamos de lo que quieres construir?',
        'description' => 'Estoy preparando este espacio. Los canales de contacto se publicarán cuando estén confirmados.',
        'email' => env('PORTFOLIO_EMAIL'),
        'linkedin' => env('PORTFOLIO_LINKEDIN'),
        'cvUrl' => env('PORTFOLIO_CV_URL'),
    ],

    'footer' => [
        'copyright' => 'Iván Martínez',
        'note' => 'Portfolio personal · Contenido en preparación',
    ],
];
