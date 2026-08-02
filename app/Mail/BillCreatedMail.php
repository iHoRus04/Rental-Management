<?php

namespace App\Mail;

use App\Models\Bill;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\SerializesModels;

class BillCreatedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $bill;

    /**
     * Create a new message instance.
     */
    public function __construct(Bill $bill)
    {
        $this->bill = $bill;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $landlord = $this->bill->room->house->user;
        $month = $this->bill->month;
        $year = $this->bill->year;
        $roomName = $this->bill->room->name;

        return new Envelope(
            subject: "🔔 Thông báo đóng tiền phòng Tháng {$month}/{$year} - Phòng {$roomName}",
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
            view: 'emails.bill_created',
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
