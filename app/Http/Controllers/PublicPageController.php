<?php

namespace App\Http\Controllers;

use App\Models\PortfolioPage;
use App\Services\Pages\BuildPageBlocks;
use Inertia\Inertia;
use Inertia\Response;

class PublicPageController extends Controller
{
    public function show(string $slug, BuildPageBlocks $builder): Response
    {
        $page = PortfolioPage::query()->published()->where('published_slug', $slug)->where('key', '<>', 'home')->firstOrFail();

        return Inertia::render('public/page', $builder->page($page));
    }
}
