<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Portfolio\BuildPublicPortfolio;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(BuildPublicPortfolio $portfolio): Response
    {
        return Inertia::render('admin/dashboard', [
            'summary' => $portfolio->dashboard(),
        ]);
    }
}
