<?php

namespace App\Mail;

use App\Models\RenterRequest;
use App\Models\Room;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\SerializesModels;

class RoomAlreadyRentedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $renterRequest;
    public $room;

    /**
     * Create a new message instance.
     */
    public function __construct(RenterRequest $renterRequest, Room $room)
    {
        $this->renterRequest = $renterRequest;
        $this->room = $room;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $house = $this->room->house;
        $landlord = $house->user;

        return new Envelope(
            subject: '📢 Thông Báo Trạng Thái Đăng Ký Thuê Phòng - ' . $this->room->name . ' (' . $house->name . ')',
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
            view: 'emails.room_already_rented',
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}
