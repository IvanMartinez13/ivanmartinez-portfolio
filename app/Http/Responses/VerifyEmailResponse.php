<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\VerifyEmailResponse as VerifyEmailResponseContract;

class VerifyEmailResponse implements VerifyEmailResponseContract
{
    public function toResponse($request)
    {
        if ($request->wantsJson()) {
            return response()->json('', 204);
        }

        $user = $request->user();
        $destination = $user?->canAccessAdmin() ? route('admin.dashboard') : route('home');

        return redirect()->intended($destination.'?verified=1');
    }
}
