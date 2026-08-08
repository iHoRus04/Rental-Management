<?php

namespace App\Http\Controllers\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class FeedbackController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        $feedbacks = Feedback::where('user_id', $user->id)
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
                ];
            });

        return Inertia::render('Landlord/Feedbacks/Index', [
            'feedbacks' => $feedbacks
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string|max:2000',
            'type' => 'required|string|in:bug,suggestion,support',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            // Lưu vào storage/app/public/feedbacks
            $file->storeAs('feedbacks', $filename, 'public');
            $imagePath = 'storage/feedbacks/' . $filename;
        }

        $validated['user_id'] = auth()->id();
        $validated['status'] = 'pending';
        $validated['image'] = $imagePath;

        Feedback::create($validated);

        return redirect()->back()->with('success', 'Phản hồi của bạn đã được gửi tới ban quản trị thành công.');
    }

    public function update(Request $request, Feedback $feedback)
    {
        // Ràng buộc bảo mật và nghiệp vụ
        if ($feedback->user_id !== auth()->id() || $feedback->status !== 'pending') {
            return redirect()->back()->with('error', 'Không thể chỉnh sửa phản hồi này (phản hồi không tồn tại hoặc đã được xử lý).');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string|max:2000',
            'type' => 'required|string|in:bug,suggestion,support',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Nếu có upload hình ảnh mới
        if ($request->hasFile('image')) {
            // Xóa ảnh cũ
            if ($feedback->image) {
                $oldPath = str_replace('storage/', 'public/', $feedback->image);
                Storage::delete($oldPath);
            }
            
            $file = $request->file('image');
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->storeAs('feedbacks', $filename, 'public');
            $validated['image'] = 'storage/feedbacks/' . $filename;
        } elseif ($request->input('remove_image') === 'true') {
            // Trường hợp người dùng chủ động xóa ảnh cũ
            if ($feedback->image) {
                $oldPath = str_replace('storage/', 'public/', $feedback->image);
                Storage::delete($oldPath);
            }
            $validated['image'] = null;
        }

        $feedback->update($validated);

        return redirect()->back()->with('success', 'Cập nhật phản hồi thành công.');
    }

    public function destroy(Feedback $feedback)
    {
        // Ràng buộc bảo mật và nghiệp vụ
        if ($feedback->user_id !== auth()->id() || $feedback->status !== 'pending') {
            return redirect()->back()->with('error', 'Không thể xóa phản hồi này (phản hồi không tồn tại hoặc đã được xử lý).');
        }

        // Xóa ảnh đính kèm trong storage
        if ($feedback->image) {
            $oldPath = str_replace('storage/', 'public/', $feedback->image);
            Storage::delete($oldPath);
        }

        $feedback->delete();

        return redirect()->back()->with('success', 'Xóa phản hồi thành công.');
    }
}
