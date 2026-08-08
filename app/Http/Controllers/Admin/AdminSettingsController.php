<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AdminSettingsController extends Controller
{
    /**
     * Get settings filepath
     */
    private function getSettingsPath()
    {
        return 'settings.json';
    }

    /**
     * Load settings from storage, return defaults if not exists
     */
    private function loadSettings()
    {
        $path = $this->getSettingsPath();
        if (Storage::disk('local')->exists($path)) {
            $content = Storage::disk('local')->get($path);
            $settings = json_decode($content, true);
            if (is_array($settings)) {
                return array_merge($this->getDefaultSettings(), $settings);
            }
        }
        return $this->getDefaultSettings();
    }

    /**
     * Default settings values
     */
    private function getDefaultSettings()
    {
        return [
            'app_name' => 'DreamHouses',
            'logo' => null,
            'support_phone' => '0987654321',
            'support_email' => 'support@dreamhouses.vn',
            'support_address' => '123 Đường Láng, Đống Đa, Hà Nội',
            'maintenance_mode' => false,
            'bank_name' => 'vietinbank',
            'account_no' => '10287382718',
            'account_name' => 'CONG TY DREAMHOUSES',
        ];
    }

    /**
     * Display settings page
     */
    public function index()
    {
        return Inertia::render('Admin/Settings', [
            'settings' => $this->loadSettings()
        ]);
    }

    /**
     * Save/update settings
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'app_name' => 'required|string|max:50',
            'logo' => 'nullable|image|max:2048', // Max 2MB image
            'support_phone' => 'required|string|max:20',
            'support_email' => 'required|email|max:100',
            'support_address' => 'required|string|max:255',
            'maintenance_mode' => 'required|boolean',
            'bank_name' => 'nullable|string|max:100',
            'account_no' => 'nullable|string|max:100',
            'account_name' => 'nullable|string|max:100',
        ]);

        $settings = $this->loadSettings();
        
        $settings['app_name'] = $validated['app_name'];
        $settings['support_phone'] = $validated['support_phone'];
        $settings['support_email'] = $validated['support_email'];
        $settings['support_address'] = $validated['support_address'];
        $settings['maintenance_mode'] = $validated['maintenance_mode'];
        $settings['bank_name'] = $validated['bank_name'] ?? 'vietinbank';
        $settings['account_no'] = $validated['account_no'] ?? '10287382718';
        $settings['account_name'] = $validated['account_name'] ?? 'CONG TY DREAMHOUSES';

        // Handle logo file upload
        if ($request->hasFile('logo')) {
            // Delete old custom logo if exists to save space
            if (!empty($settings['logo']) && str_starts_with($settings['logo'], '/storage/logo/')) {
                $oldPath = str_replace('/storage/', '', $settings['logo']);
                Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('logo')->store('logo', 'public');
            $settings['logo'] = '/storage/' . $path;
        }

        // Save back to JSON file
        Storage::disk('local')->put($this->getSettingsPath(), json_encode($settings, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        return redirect()->back()->with('success', 'Cài đặt hệ thống đã được cập nhật thành công!');
    }
}
