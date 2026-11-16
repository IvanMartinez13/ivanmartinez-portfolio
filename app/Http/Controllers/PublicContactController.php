<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactMessageRequest;
use App\Mail\PortfolioContactMessage;
use App\Models\ProfessionalProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;

class PublicContactController extends Controller
{
    public function store(StoreContactMessageRequest $request): RedirectResponse
    {
        $recipient = ProfessionalProfile::query()->where('key', 'primary')->value('contact_email');
        abort_unless($recipient, 503, 'El formulario de contacto no está configurado todavía.');

        $data = $request->validated();
        Mail::to($recipient)->send(new PortfolioContactMessage($data['name'], $data['email'], $data['message']));

        return back()->with('contact_message_sent', true);
    }
}
