<?php

namespace App\Http\Controllers\Landlord;

use App\Http\Controllers\Controller;
use App\Models\House;
use App\Models\Room;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class RoomController extends Controller
{
    /**
     * Kiểm tra quyền sở hữu house
     */
    private function authorizeHouseOwnership(House $house)
    {
        if ($house->user_id !== Auth::id()) {
            abort(403, 'Bạn không có quyền truy cập nhà trọ này.');
        }
    }

    public function index(House $house)
    {
        $this->authorizeHouseOwnership($house);
        
        $rooms = $house->rooms()->get();

        return Inertia::render('Landlord/Rooms/Index', [
            'house' => $house,
            'rooms' => $rooms,
        ]);
    }

    public function create(House $house)
    {
        $this->authorizeHouseOwnership($house);
        
        return Inertia::render('Landlord/Rooms/Create', [
            'house' => $house,
        ]);
    }

    public function store(Request $request, House $house)
    {
        $this->authorizeHouseOwnership($house);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'status' => 'required|in:available,occupied,maintenance',
            'floor' => 'nullable|integer',
            'area' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'images' => 'nullable|array|max:5',
        ]);

        // Handle image uploads
        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                if (count($imagePaths) < 5) {
                    $path = $image->store('rooms', 'public');
                    $imagePaths[] = $path;
                }
            }
        }

        $validated['images'] = json_encode($imagePaths);
        $house->rooms()->create($validated);

        return redirect()->route('landlord.houses.rooms.index', $house->id)
                         ->with('success', 'Thêm phòng thành công!');
    }

    public function show(House $house, Room $room)
    {
        $this->authorizeHouseOwnership($house);
        
        // Kiểm tra room có thuộc house không
        if ($room->house_id !== $house->id) {
            abort(404, 'Phòng không tồn tại trong nhà trọ này.');
        }

        // Get active contract with renter request
        $activeContract = $room->contracts()
            ->with('renterRequest')
            ->where('status', 'active')
            ->first();
        
        // Ensure data is properly serialized
        if ($activeContract) {
            $activeContract = [
                'id' => $activeContract->id,
                'room_id' => $activeContract->room_id,
                'renter_request_id' => $activeContract->renter_request_id,
                'start_date' => $activeContract->start_date,
                'end_date' => $activeContract->end_date,
                'monthly_rent' => $activeContract->monthly_rent,
                'deposit' => $activeContract->deposit,
                'payment_date' => $activeContract->payment_date,
                'status' => $activeContract->status,
                'renterRequest' => $activeContract->renterRequest,
            ];
        }
        
        return Inertia::render('Landlord/Rooms/Show', [
            'house' => $house,
            'room' => $room,
            'activeContract' => $activeContract,
        ]);
    }

    public function edit(House $house, Room $room)
    {
        $this->authorizeHouseOwnership($house);
        
        if ($room->house_id !== $house->id) {
            abort(404, 'Phòng không tồn tại trong nhà trọ này.');
        }
        
        return Inertia::render('Landlord/Rooms/Edit', [
            'house' => $house,
            'room' => $room,
        ]);
    }

    public function update(Request $request, House $house, Room $room)
    {
        $this->authorizeHouseOwnership($house);
        
        if ($room->house_id !== $house->id) {
            abort(404, 'Phòng không tồn tại trong nhà trọ này.');
        }

        Log::info('Room update request:', $request->all());

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'status' => 'required|in:available,occupied,maintenance',
            'floor' => 'nullable|integer',
            'area' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'images' => 'nullable|array|max:5',
        ]);

        // ✅ Xử lý images đúng cách - merge với ảnh cũ
        if ($request->hasFile('images')) {
            // Lấy ảnh cũ
            $existingImages = $room->images ? json_decode($room->images, true) : [];
            
            // Upload ảnh mới
            $newImagePaths = [];
            foreach ($request->file('images') as $image) {
                // Giới hạn tổng số ảnh là 5
                if (count($existingImages) + count($newImagePaths) < 5) {
                    $path = $image->store('rooms', 'public');
                    $newImagePaths[] = $path;
                }
            }
            
            // Merge ảnh cũ với ảnh mới
            $allImages = array_merge($existingImages, $newImagePaths);
            
            // Đảm bảo không vượt quá 5 ảnh
            $allImages = array_slice($allImages, 0, 5);
            
            $validated['images'] = json_encode($allImages);
        } else {
            // ✅ Không có ảnh mới, bỏ images khỏi validated để không update
            unset($validated['images']);
        }

        $room->update($validated);

        return redirect()->route('landlord.houses.rooms.show', [$house->id, $room->id])
                        ->with('success', 'Cập nhật phòng thành công!');
    }

    public function destroy(House $house, Room $room)
    {
        $this->authorizeHouseOwnership($house);
        
        if ($room->house_id !== $house->id) {
            abort(404, 'Phòng không tồn tại trong nhà trọ này.');
        }

        // ✅ Xóa tất cả ảnh trước khi xóa room
        if ($room->images) {
            $images = json_decode($room->images, true);
            foreach ($images as $image) {
                Storage::disk('public')->delete($image);
            }
        }

        $room->delete();

        return redirect()->route('landlord.houses.rooms.index', $house->id)
            ->with('success', 'Đã xóa phòng thành công!');
    }

    /**
     * Remove an image from a room
     */
    public function removeImage(Request $request, House $house, Room $room)
    {
        $this->authorizeHouseOwnership($house);
        
        if ($room->house_id !== $house->id) {
            abort(404, 'Phòng không tồn tại trong nhà trọ này.');
        }

        // Validate input
        $validated = $request->validate([
            'index' => 'required|integer|min:0'
        ]);

        $imageIndex = $validated['index'];
        
        // Get current images
        $images = $room->images ? json_decode($room->images, true) : [];
        
        Log::info('Removing image', [
            'room_id' => $room->id,
            'image_index' => $imageIndex,
            'total_images' => count($images),
            'current_images' => $images,
        ]);
        
        // Check if image index exists
        if (isset($images[$imageIndex])) {
            $imagePath = $images[$imageIndex];
            
            // Delete the image file from storage
            if (Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);
                Log::info('Image file deleted', ['path' => $imagePath]);
            }
            
            // Remove image from array
            array_splice($images, $imageIndex, 1);
            
            // Re-index array (array_values)
            $images = array_values($images);
            
            // Update room with new images array
            $room->update(['images' => json_encode($images)]);
            
            Log::info('Image removed from room', [
                'room_id' => $room->id,
                'remaining_images' => count($images),
            ]);
            
            // ✅ Trả JSON response cho DELETE request từ JavaScript
            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json(['success' => true, 'message' => 'Đã xóa hình ảnh thành công!']);
            }
            
            return redirect()->back()->with('success', 'Đã xóa hình ảnh thành công!');
        }
        
        Log::warning('Image index not found', [
            'room_id' => $room->id,
            'requested_index' => $imageIndex,
            'total_images' => count($images),
        ]);
        
        // Return error
        if ($request->wantsJson() || $request->expectsJson()) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy hình ảnh'], 404);
        }
        
        return redirect()->back()->withErrors(['image' => 'Không tìm thấy hình ảnh']);
    }
}