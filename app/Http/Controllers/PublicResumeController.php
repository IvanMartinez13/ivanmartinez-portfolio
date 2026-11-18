<?php

namespace App\Http\Controllers;

use App\Models\ResumePublication;
use App\Services\Portfolio\BuildPublicPortfolio;
use App\Services\Resume\BuildResume;
use Inertia\Inertia;
use Inertia\Response;

class PublicResumeController extends Controller
{
    public function show(BuildResume $resume, BuildPublicPortfolio $portfolio): Response
    {
        $publication = ResumePublication::query()->orderByDesc('version')->firstOrFail();

        return Inertia::render('cv/show', $resume->publicData($publication->snapshot, false) + [
            'portfolio' => $portfolio->chrome(),
            'publicationVersion' => $publication->version,
            'publishedAt' => $publication->created_at?->toIso8601String(),
        ]);
    }
}
