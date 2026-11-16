<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateProfessionalProfileRequest;
use App\Models\ProfessionalProfile;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProfessionalProfileController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('admin/profile', [
            'profile' => ProfessionalProfile::query()->where('key', 'primary')->firstOrFail(),
        ]);
    }

    public function update(UpdateProfessionalProfileRequest $request): RedirectResponse
    {
        $profile = ProfessionalProfile::query()->where('key', 'primary')->firstOrFail();
        $profile->fill($request->validated())->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Perfil profesional actualizado.']);

        return to_route('admin.profile.edit');
    }
}
