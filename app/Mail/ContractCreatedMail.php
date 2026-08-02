<?php

namespace App\Mail;

use App\Models\Contract;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\SerializesModels;
use Barryvdh\DomPDF\Facade\Pdf;

use Illuminate\Mail\Mailables\Address;

class ContractCreatedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $contract;

    /**
     * Create a new message instance.
     */
    public function __construct(Contract $contract)
    {
        $this->contract = $contract;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $landlord = $this->contract->room->house->user;

        return new Envelope(
            subject: '🔔 Hợp Đồng Thuê Phòng Đã Được Thiết Lập - Phòng ' . $this->contract->room->name,
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
            view: 'emails.contract_created',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        $contract = $this->contract;
        $room = $contract->room;
        $landlord = $room->house->user;
        $renter = $contract->renterRequest;

        $pdf = Pdf::loadView('landlord.contracts.pdf', compact('contract', 'room', 'landlord', 'renter'))
            ->setPaper('a4', 'portrait')
            ->setOptions([
                'defaultFont'  => 'DejaVu Sans',
                'isRemoteEnabled' => true,
                'isHtml5ParserEnabled' => true,
                'chroot' => public_path(),
            ]);

        $filename = 'HopDong_' . str_pad($contract->id, 4, '0', STR_PAD_LEFT)
            . '_Phong' . str_replace(' ', '', $room->name)
            . '.pdf';

        return [
            Attachment::fromData(fn () => $pdf->output(), $filename)
                ->withMime('application/pdf'),
        ];
    }
}
