<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminFeedbackController extends Controller
{
    public function index()
    {
        $feedbacks = Feedback::with('user')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'title' => $item->title,
                    'content' => $item->content,
                    'type' => $item->type,
                    'status' => $item->status,
                    'image' => $item->image ? '/' . $item->image : null,
                    'created_at' => $item->created_at->format('d/m/Y H:i'),
                    'sender' => [
                        'name' => $item->user->name ?? 'N/A',
                        'email' => $item->user->email ?? 'N/A',
                        'phone' => $item->user->phone ?? 'N/A',
                    ]
                ];
            });

        return Inertia::render('Admin/Feedbacks/Index', [
            'feedbacks' => $feedbacks
        ]);
    }

    public function update(Request $request, Feedback $feedback)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,processed'
        ]);

        $feedback->update($validated);

        return redirect()->back()->with('success', 'Trạng thái phản hồi đã được cập nhật.');
    }
}
