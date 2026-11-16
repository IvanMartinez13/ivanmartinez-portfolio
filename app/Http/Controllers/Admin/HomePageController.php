<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateHomePageRequest;
use App\Models\PortfolioPage;
use App\Models\PortfolioSection;
use App\Models\ProfessionalProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class HomePageController extends Controller
{
    public function edit(): RedirectResponse
    {
        return to_route('admin.pages.edit', PortfolioPage::query()->where('key', 'home')->firstOrFail());
    }

    public function update(UpdateHomePageRequest $request): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data): void {
            $page = PortfolioPage::query()->where('key', 'home')->firstOrFail();
            $page->title = $data['title'];
            $page->status = $data['status'];
            $page->published_at = $data['status'] === 'published'
                ? ($page->published_at ?? now())
                : null;
            $page->save();

            $profile = ProfessionalProfile::query()->where('key', 'primary')->firstOrFail();
            $profile->short_description = $data['profileSummary'];
            $profile->save();

            foreach ($data['sections'] as $sectionData) {
                $section = PortfolioSection::query()
                    ->where('portfolio_page_id', $page->id)
                    ->where('key', $sectionData['key'])
                    ->whereKey($sectionData['id'])
                    ->first();

                if (! $section) {
                    throw ValidationException::withMessages([
                        'sections' => 'La lista de secciones ha cambiado. Recarga el editor y vuelve a intentarlo.',
                    ]);
                }

                $section->nav_label = $sectionData['navLabel'];
                $section->position = $sectionData['position'];
                $section->is_visible = $sectionData['visible'];
                $section->content = array_merge($section->content ?? [], $sectionData['content']);
                $section->save();
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Portada guardada correctamente.']);

        return to_route('admin.home.edit');
    }
}
