<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\Landlord\HouseController;
use App\Http\Controllers\Landlord\RoomController;
use App\Http\Controllers\Landlord\ContractController;
use App\Http\Controllers\Landlord\RenterController;
use App\Http\Controllers\Landlord\BillController;
use App\Http\Controllers\Landlord\PaymentController;
use App\Http\Controllers\Landlord\RevenueController;
use App\Http\Controllers\Landlord\MeterLogController;
use App\Http\Controllers\Landlord\ReminderController;
use App\Http\Controllers\Landlord\RenterRequestController;
use App\Http\Controllers\Landlord\DashboardController;
use App\Http\Controllers\Landlord\ServiceController;

// ✅ Trang Home
Route::get('/', function () {
    if (Auth::check()) {
        $user = Auth::user();

        if ($user->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }

        if ($user->role === 'landlord') {
            return redirect()->route('landlord.dashboard');
        }

        if ($user->role === 'tenant') {
            return redirect()->route('tenant.dashboard');
        }
    }

    return Inertia::render('Home');
})->name('home');


// ✅ Khu vực bắt buộc đăng nhập
Route::middleware(['auth', 'verified'])->group(function () {

    // ✅ Admin Dashboard
    Route::get('/admin/dashboard', function () {
        return Inertia::render('Admin/Dashboard');
    })
    ->middleware('role:admin')
    ->name('admin.dashboard');


    // ✅ Landlord Dashboard
    Route::get('/landlord/dashboard', [DashboardController::class, 'index'])
        ->middleware('role:landlord')
        ->name('landlord.dashboard');

    
    // ✅ Landlord Module: Houses
    Route::middleware('role:landlord')
        ->prefix('landlord')
        ->name('landlord.')
        ->group(function () {
            Route::resource('houses', HouseController::class);
            Route::resource('houses.rooms', RoomController::class);
            
            // Services management
            Route::resource('services', ServiceController::class);
            Route::get('rooms/{room}/services', [ServiceController::class, 'roomServices'])->name('rooms.services');
            Route::post('rooms/{room}/services', [ServiceController::class, 'attachToRoom'])->name('rooms.services.attach');
            Route::put('room-services/{roomService}', [ServiceController::class, 'updateRoomService'])->name('room-services.update');
            Route::delete('room-services/{roomService}', [ServiceController::class, 'detachFromRoom'])->name('room-services.detach');
            
            // Add route for removing room images - support both DELETE and POST methods
            Route::match(['delete', 'post'], 'houses/{house}/rooms/{room}/images', [RoomController::class, 'removeImage'])
                ->name('houses.rooms.removeImage');
                
            Route::resource('rooms.contracts', ContractController::class);
            
            // Renter Request Services management (moved from renters to renter-requests)
            Route::get('renter-requests/{renterRequest}/services', [RenterRequestController::class, 'renterRequestServices'])->name('renter-requests.services');
            Route::post('renter-requests/{renterRequest}/services', [RenterRequestController::class, 'attachService'])->name('renter-requests.services.attach');
            Route::put('renter-request-services/{renterRequestService}', [RenterRequestController::class, 'updateRenterRequestService'])->name('renter-request-services.update');
            Route::delete('renter-request-services/{renterRequestService}', [RenterRequestController::class, 'detachService'])->name('renter-request-services.detach');
            
            Route::resource('bills', BillController::class);
            Route::resource('payments', PaymentController::class);
            Route::resource('meter-logs', MeterLogController::class);
            
            // Get pending reminders count - MUST BE BEFORE resource route
            Route::get('reminders/pending-count', [ReminderController::class, 'getPendingCount'])->name('reminders.pendingCount');
            
            // Đánh dấu nhắc nhở đã gửi
            Route::post('reminders/{reminder}/mark-sent', [ReminderController::class, 'markAsSent'])->name('reminders.markAsSent');
            
            Route::resource('reminders', ReminderController::class);
            
            // Get pending renter requests count - MUST BE BEFORE resource route
            Route::get('renter-requests/pending-count', [RenterRequestController::class, 'getPendingCount'])->name('renter-requests.pendingCount');
            
            Route::resource('renter-requests', RenterRequestController::class);
             Route::resource('contract', ContractController::class);
            
            // Update renter request status
            Route::post('renter-requests/{renterRequest}/update-status/{status}', [RenterRequestController::class, 'updateStatus'])->name('renter-requests.update-status');
            
            // Create tenant account
            Route::post('renter-requests/{renterRequest}/create-account', [RenterRequestController::class, 'createTenantAccount'])->name('renter-requests.create-account');
            
            // Tenant Requests (from tenant users)
            Route::get('tenant-requests', [\App\Http\Controllers\Landlord\TenantRequestController::class, 'index'])->name('tenant-requests.index');
            Route::get('tenant-requests/{tenantRequest}', [\App\Http\Controllers\Landlord\TenantRequestController::class, 'show'])->name('tenant-requests.show');
            Route::post('tenant-requests/{tenantRequest}/status/{status}', [\App\Http\Controllers\Landlord\TenantRequestController::class, 'updateStatus'])->name('tenant-requests.update-status');
            Route::post('tenant-requests/{tenantRequest}/respond', [\App\Http\Controllers\Landlord\TenantRequestController::class, 'respond'])->name('tenant-requests.respond');
            
            // Tạo hóa đơn hàng tháng
            Route::post('bills/generate-monthly', [BillController::class, 'generateMonthly'])->name('bills.generateMonthly');
            
            // Báo cáo thu nhập
            Route::get('reports/monthly', [RevenueController::class, 'monthlyReport'])->name('reports.monthly');
            Route::get('reports/year-to-date', [RevenueController::class, 'yearToDateReport'])->name('reports.yearToDate');
            Route::get('reports/payments', [RevenueController::class, 'paymentHistory'])->name('reports.paymentHistory');
            
            // Xuất PDF
            Route::post('bills/{bill}/export-pdf', [BillController::class, 'exportPDF'])->name('bills.exportPDF');
        });

    // ✅ Tenant Module
    Route::middleware('tenant')
        ->prefix('tenant')
        ->name('tenant.')
        ->group(function () {
            Route::get('dashboard', [\App\Http\Controllers\Tenant\DashboardController::class, 'index'])->name('dashboard');
            
            // Tenant Requests
            Route::get('requests', [\App\Http\Controllers\Tenant\TenantRequestController::class, 'index'])->name('requests.index');
            Route::get('requests/create', [\App\Http\Controllers\Tenant\TenantRequestController::class, 'create'])->name('requests.create');
            Route::post('requests', [\App\Http\Controllers\Tenant\TenantRequestController::class, 'store'])->name('requests.store');
            Route::get('requests/{tenantRequest}', [\App\Http\Controllers\Tenant\TenantRequestController::class, 'show'])->name('requests.show');
        });


    // ✅ Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // SSO token: issue short-lived token to allow external site to recognize logged-in user
    Route::post('/sso-token', [\App\Http\Controllers\SsoController::class, 'createToken'])->name('sso.token');
});

require __DIR__.'/auth.php';