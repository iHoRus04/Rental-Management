<?php

namespace App\Mail;

use App\Models\TenantRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\SerializesModels;

class TenantRequestUpdatedMail extends Mailable implements ShouldQueue
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
        $landlord = $this->tenantRequest->landlord;
        $title = $this->tenantRequest->title;
        
        $statusLabels = [
            'pending' => 'Chờ xử lý',
            'processing' => 'Đang xử lý',
            'resolved' => 'Đã giải quyết',
            'rejected' => 'Bị từ chối',
        ];
        $statusLabel = $statusLabels[$this->tenantRequest->status] ?? $this->tenantRequest->status;

        return new Envelope(
            subject: "⚡ Cập nhật yêu cầu hỗ trợ: {$title} - Trạng thái: {$statusLabel}",
            replyTo: [
                new Address($landlord->email, $landlord->name),
            ],
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.request_updated',
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
