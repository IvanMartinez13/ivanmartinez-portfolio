<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PortfolioContactMessage extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public string $name, public string $email, public string $message) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Nuevo mensaje desde ivanmartinez.dev',
            replyTo: [new Address($this->email, $this->name)],
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.portfolio-contact');
    }
}
