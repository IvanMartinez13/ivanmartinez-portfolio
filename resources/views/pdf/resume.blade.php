<!doctype html>
<html lang="{{ $config['language'] ?? 'es' }}">
<head>
    <meta charset="utf-8">
    <title>{{ $profile['name'] }} · {{ ($config['language'] ?? 'es') === 'en' ? 'Resume' : 'Currículum' }}</title>
    <style>
        @page { margin: 35px 42px 58px; }
        * { box-sizing: border-box; }
        body { margin: 0; color: #182230; font-family: "DejaVu Sans", sans-serif; font-size: {{ ($config['target_length'] ?? 'auto') === 'one-page' ? '8.7pt' : ((($config['target_length'] ?? 'auto') === 'two-pages') ? '9.5pt' : '9pt') }}; line-height: 1.42; }
        a { color: {{ $variant === 'ats' || ($config['theme'] ?? 'editorial') === 'minimal' ? '#163a5f' : ($appearance['cssVariables']['--portfolio-primary'] ?? '#163a5f') }}; text-decoration: underline; word-wrap: break-word; }
        h1 { margin: 0; font-size: {{ $variant === 'ats' ? '22pt' : '27pt' }}; line-height: 1.1; letter-spacing: -0.4pt; color: #101828; }
        h2 { margin: 0 0 10px; padding-bottom: 5px; border-bottom: 1px solid {{ $variant === 'ats' || ($config['theme'] ?? 'editorial') === 'minimal' ? '#9299a3' : ($appearance['cssVariables']['--portfolio-primary'] ?? '#163a5f') }}; color: {{ $variant === 'ats' ? '#101828' : ($appearance['cssVariables']['--portfolio-primary'] ?? '#163a5f') }}; font-size: 12pt; line-height: 1.2; }
        h3 { margin: 0; color: #101828; font-size: 10pt; }
        p { margin: 4px 0 0; }
        .header { border-bottom: 2px solid {{ $variant === 'ats' || ($config['theme'] ?? 'editorial') === 'minimal' ? '#9299a3' : ($appearance['cssVariables']['--portfolio-primary'] ?? '#163a5f') }}; padding-bottom: 13px; margin-bottom: 17px; }
        .photo { float: right; width: 72px; height: 72px; border-radius: 36px; object-fit: cover; margin-left: 14px; }
        .specialty { margin-top: 5px; color: #526079; font-size: 11pt; font-weight: bold; }
        .summary { margin-top: 8px; color: #364152; }
        .contact { margin-top: 8px; color: #526079; font-size: 8pt; }
        .section { margin-top: {{ ($config['target_length'] ?? 'auto') === 'one-page' ? '11px' : '15px' }}; page-break-inside: avoid; }
        .entry { margin: 0 0 11px; page-break-inside: avoid; }
        .meta { margin-top: 2px; color: #526079; font-size: 8pt; }
        .description { margin-top: 5px; white-space: pre-line; }
        ul { margin: 5px 0 0; padding-left: 16px; }
        li { margin: 2px 0; }
        .small { color: #526079; font-size: 8pt; }
        .skills { margin-top: 4px; }
        .skills strong { color: #263449; }
        .project { margin-top: 6px; }
        .ats h2 { border-bottom: 1px solid #4d5560; color: #101828; text-transform: uppercase; letter-spacing: 0.4pt; }
    </style>
</head>
<body class="{{ $variant === 'ats' ? 'ats' : 'professional' }}">
@php
    $dateFormat = fn (?string $date): string => $date ? \Carbon\CarbonImmutable::parse($date)->locale(($config['language'] ?? 'es') === 'en' ? 'en' : 'es')->translatedFormat('M Y') : '';
    $period = function (?string $start, ?string $end, bool $current = false, ?int $startYear = null, ?int $endYear = null) use ($dateFormat, $config): string {
        $parts = array_filter([$startYear ? (string) $startYear : $dateFormat($start), $current ? (($config['language'] ?? 'es') === 'en' ? 'Present' : 'Actualidad') : ($endYear ? (string) $endYear : $dateFormat($end))]);
        return implode(' — ', $parts);
    };
    $visibleSections = $config['visible_sections'] ?? [];
@endphp
<header class="header">
    @if($variant === 'professional' && !empty($profile['photo_data']))<img class="photo" src="{{ $profile['photo_data'] }}" alt="">@endif
    <h1>{{ $profile['name'] }}</h1>
    <p class="specialty">{{ $profile['headline'] }}</p>
    @if(!empty($profile['specialty']))<p class="small">{{ $profile['specialty'] }}</p>@endif
    @if(!empty($profile['summary']))<p class="summary">{{ $profile['summary'] }}</p>@endif
    @if(!empty($profile['location']))<p class="small">{{ $profile['location'] }}</p>@endif
    <p class="contact">
        @if(!empty($profile['email']))<a href="mailto:{{ $profile['email'] }}">{{ $profile['email'] }}</a>@endif
        @foreach(($profile['links'] ?? []) as $label => $url)
            @if($url) @if(!empty($profile['email'])) · @endif<a href="{{ $url }}">{{ ucfirst($label) }}</a>@endif
        @endforeach
    </p>
</header>

@foreach(($config['section_order'] ?? []) as $section)
    @if(in_array($section, $visibleSections, true))
        @switch($section)
            @case('experience')
                @if(count($experiences))<section class="section"><h2>{{ ($config['language'] ?? 'es') === 'en' ? 'Professional experience' : 'Experiencia profesional' }}</h2>
                    @foreach($experiences as $experience)<article class="entry"><h3>{{ $experience['job_title'] }} · {{ $experience['company'] }}</h3><p class="meta">{{ $period($experience['started_at'], $experience['ended_at'], $experience['is_current'], $experience['started_year'] ?? null, $experience['ended_year'] ?? null) }}@if($experience['location']) · {{ $experience['location'] }}@endif</p>@if($experience['description'])<p class="description">{{ $experience['description'] }}</p>@endif
                        @if(count($experience['responsibilities']))<ul>@foreach($experience['responsibilities'] as $responsibility)<li>{{ $responsibility }}</li>@endforeach</ul>@endif
                        @if(count($experience['achievements']))<ul>@foreach($experience['achievements'] as $achievement)<li>{{ $achievement }}</li>@endforeach</ul>@endif
                        @if(count($experience['technologies']))<p class="small skills"><strong>{{ ($config['language'] ?? 'es') === 'en' ? 'Technologies:' : 'Tecnologías:' }}</strong> {{ collect($experience['technologies'])->pluck('name')->join(' · ') }}</p>@endif
                        @if(count($experience['projects']))<p class="small"><strong>{{ ($config['language'] ?? 'es') === 'en' ? 'Projects:' : 'Proyectos:' }}</strong> @foreach($experience['projects'] as $project)@if(!$loop->first) · @endif<a href="{{ url('/projects/'.$project['slug']) }}">{{ $project['name'] }}</a>@endforeach</p>@endif
                    </article>@endforeach
                </section>@endif
                @break
            @case('skills')
                @if(count($technology_groups) || count($competency_groups ?? []))<section class="section"><h2>{{ ($config['language'] ?? 'es') === 'en' ? 'Technical skills' : 'Competencias técnicas' }}</h2>@foreach($technology_groups as $group)<p class="skills"><strong>{{ $group['category'] }}:</strong> {{ collect($group['items'])->pluck('name')->join(' · ') }}</p>@endforeach @foreach(($competency_groups ?? []) as $group)<p class="skills"><strong>{{ $group['category'] }}:</strong> {{ collect($group['items'])->join(' · ') }}</p>@endforeach</section>@endif
                @break
            @case('education')
                @if(count($education))<section class="section"><h2>{{ ($config['language'] ?? 'es') === 'en' ? 'Education' : 'Formación' }}</h2>@foreach($education as $item)<article class="entry"><h3>{{ $item['qualification'] }}</h3><p class="meta">{{ $item['institution'] }}@if($item['started_at'] || $item['ended_at'] || ($item['started_year'] ?? null) || ($item['ended_year'] ?? null)) · {{ $period($item['started_at'] ?? null, $item['ended_at'] ?? null, false, $item['started_year'] ?? null, $item['ended_year'] ?? null) }}@endif</p>@if($item['description'])<p class="description">{{ $item['description'] }}</p>@endif</article>@endforeach</section>@endif
                @break
            @case('certifications')
                @if(count($certifications))<section class="section"><h2>{{ ($config['language'] ?? 'es') === 'en' ? 'Certifications' : 'Certificaciones' }}</h2>@foreach($certifications as $item)<article class="entry"><h3>{{ $item['name'] }}</h3><p class="meta">{{ $item['issuer'] }}@if($item['issued_at']) · {{ $dateFormat($item['issued_at']) }}@endif @if($item['credential_url']) · <a href="{{ $item['credential_url'] }}">{{ ($config['language'] ?? 'es') === 'en' ? 'Verify credential' : 'Ver credencial' }}</a>@endif</p></article>@endforeach</section>@endif
                @break
            @case('languages')
                @if(count($languages))<section class="section"><h2>{{ ($config['language'] ?? 'es') === 'en' ? 'Languages' : 'Idiomas' }}</h2>@foreach($languages as $item)<p class="entry"><strong>{{ $item['language'] }}</strong> · {{ $item['declared_level'] }}@if($item['certification_name']) · {{ $item['certification_name'] }}@endif @if($item['certification_url'])<a href="{{ $item['certification_url'] }}">{{ ($config['language'] ?? 'es') === 'en' ? 'Credential' : 'Credencial' }}</a>@endif</p>@endforeach</section>@endif
                @break
            @case('projects')
                @if(count($projects))<section class="section"><h2>{{ ($config['language'] ?? 'es') === 'en' ? 'Selected projects' : 'Proyectos destacados' }}</h2>@foreach($projects as $project)<p class="project"><strong><a href="{{ url('/projects/'.$project['slug']) }}">{{ $project['name'] }}</a></strong> · {{ $project['category'] }} — {{ $project['description'] }}</p>@endforeach</section>@endif
                @break
        @endswitch
    @endif
@endforeach
</body>
</html>
