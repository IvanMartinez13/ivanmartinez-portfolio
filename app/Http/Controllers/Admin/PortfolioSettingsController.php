<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdatePortfolioSettingsRequest;
use App\Models\PortfolioSetting;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioSettingsController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('admin/settings', [
            'settings' => PortfolioSetting::query()->where('key', 'primary')->firstOrFail(),
        ]);
    }

    public function update(UpdatePortfolioSettingsRequest $request): RedirectResponse
    {
        $settings = PortfolioSetting::query()->where('key', 'primary')->firstOrFail();
        $settings->fill($request->validated())->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Configuración general actualizada.']);

        return to_route('admin.settings.edit');
    }
}
