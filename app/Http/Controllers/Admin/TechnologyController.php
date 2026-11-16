<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveTechnologyRequest;
use App\Models\Technology;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TechnologyController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Technology::class);

        return Inertia::render('admin/technologies/index', [
            'technologies' => Technology::query()->withCount('projects')->orderBy('category')->orderBy('position')->orderBy('name')->get(),
            'selected' => $request->filled('edit') ? Technology::query()->findOrFail($request->integer('edit')) : null,
        ]);
    }

    public function store(SaveTechnologyRequest $request): RedirectResponse
    {
        $technology = Technology::query()->create($request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tecnología añadida al catálogo.']);

        return to_route('admin.technologies.index', ['edit' => $technology->id]);
    }

    public function update(SaveTechnologyRequest $request, Technology $technology): RedirectResponse
    {
        $technology->update($request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tecnología actualizada.']);

        return to_route('admin.technologies.index', ['edit' => $technology->id]);
    }

    public function destroy(Technology $technology): RedirectResponse
    {
        $this->authorize('delete', $technology);
        $technology->delete();
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tecnología eliminada del catálogo.']);

        return to_route('admin.technologies.index');
    }
}
