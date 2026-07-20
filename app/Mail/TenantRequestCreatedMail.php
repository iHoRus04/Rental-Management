<?php

namespace App\Mail;

use App\Models\TenantRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Queue\SerializesModels;

class TenantRequestCreatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $tenantRequest;

    /**
     * Create a new message instance.
     */
    public function __construct(TenantRequest $tenantRequest)
    {
        $this->tenantRequest = $tenantRequest;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $tenant = $this->tenantRequest->tenant;
        $roomName = $this->tenantRequest->room->name ?? 'N/A';
        $title = $this->tenantRequest->title;

        return new Envelope(
            subject: "🛠️ Yêu cầu sửa chữa mới từ [Phòng {$roomName}] - {$title}",
            replyTo: [
                new Address($tenant->email, $tenant->name),
            ],
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.request_created',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
