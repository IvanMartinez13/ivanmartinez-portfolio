<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request)
    {
        if ($request->wantsJson()) {
            return response()->json(['two_factor' => false]);
        }

        $user = $request->user();
        $destination = $user?->canAccessAdmin() ? route('admin.dashboard') : route('home');

        return redirect()->intended($destination);
    }
}
