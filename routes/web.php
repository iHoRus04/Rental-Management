<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\Landlord\HouseController;
use App\Http\Controllers\Landlord\RoomController;
use App\Http\Controllers\Landlord\ContractController;
use App\Http\Controllers\Landlord\BillController;
use App\Http\Controllers\Landlord\PaymentController;
use App\Http\Controllers\Landlord\RevenueController;
use App\Http\Controllers\Landlord\MeterLogController;
use App\Http\Controllers\Landlord\ReminderController;

use App\Http\Controllers\Landlord\RenterRequestController;
use App\Http\Controllers\Landlord\DashboardController;
use App\Http\Controllers\Landlord\ServiceController;
use App\Http\Controllers\Landlord\StaffController;
use App\Http\Controllers\Landlord\StaffRoleController;

// ✅ Trang Home
Route::get('/', function () {
    if (Auth::check()) {
        $user = Auth::user();

        if ($user->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }

        if ($user->role === 'landlord' || $user->role === 'staff') {
            return redirect()->route('landlord.dashboard');
        }

        if ($user->role === 'tenant') {
            return redirect()->route('tenant.dashboard');
        }
    }

    return Inertia::render('Auth/Login');
})->name('home');


// ✅ Khu vực bắt buộc đăng nhập
Route::middleware(['auth', 'verified'])->group(function () {

    // Route trạng thái tài khoản (Cho phép cả những người dùng có status pending/inactive xem)
    Route::get('/account-status', function () {
        $user = Auth::user();
        if ($user && $user->status === 'active') {
            return redirect()->route('home');
        }
        return Inertia::render('Auth/AccountStatus', [
            'status' => $user->status ?? 'pending'
        ]);
    })->name('account-status');

    // Các route bắt buộc phải có tài khoản ACTIVE
    Route::middleware(['user.status'])->group(function () {

        // ✅ Admin Dashboard & Management
        Route::middleware('role:admin')
            ->prefix('admin')
            ->name('admin.')
            ->group(function () {
                Route::get('dashboard', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'index'])->name('dashboard');

                Route::get('landlords', [\App\Http\Controllers\Admin\AdminLandlordController::class, 'index'])->name('landlords.index');
                Route::get('landlords/{user}', [\App\Http\Controllers\Admin\AdminLandlordController::class, 'show'])->name('landlords.show');
                Route::post('landlords/{user}/status', [\App\Http\Controllers\Admin\AdminLandlordController::class, 'updateStatus'])->name('landlords.update-status');
                
                Route::resource('packages', \App\Http\Controllers\Admin\AdminPackageController::class)->except(['show']);
                Route::resource('feedbacks', \App\Http\Controllers\Admin\AdminFeedbackController::class)->only(['index', 'update']);
                
                Route::get('settings', [\App\Http\Controllers\Admin\AdminSettingsController::class, 'index'])->name('settings.index');
                Route::post('settings', [\App\Http\Controllers\Admin\AdminSettingsController::class, 'update'])->name('settings.update');
            });

        // ✅ Landlord Dashboard (landlord + staff)
        Route::get('/landlord/dashboard', [DashboardController::class, 'index'])
            ->middleware('role:landlord,staff')
            ->name('landlord.dashboard');

        // ✅ Landlord Module: Houses (landlord + staff)
        Route::middleware('role:landlord,staff')
            ->prefix('landlord')
            ->name('landlord.')
            ->group(function () {
                // Setup Wizard
                Route::get('setup-wizard', [DashboardController::class, 'showWizard'])->name('setup-wizard');
                Route::post('setup-wizard', [DashboardController::class, 'saveWizard'])->name('setup-wizard.save');

                // Gói dịch vụ chủ trọ
                Route::get('subscription', [\App\Http\Controllers\Landlord\LandlordSubscriptionController::class, 'index'])->name('subscription.index');
                Route::post('subscription/subscribe', [\App\Http\Controllers\Landlord\LandlordSubscriptionController::class, 'subscribe'])->name('subscription.subscribe');

                // Feedback chủ trọ
                Route::resource('feedbacks', \App\Http\Controllers\Landlord\FeedbackController::class)->only(['index', 'store', 'update', 'destroy']);

            Route::resource('houses', HouseController::class);
            Route::put('houses/{house}/utility-prices', [HouseController::class, 'updateUtilityPrices'])->name('houses.update-utility-prices');
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
            Route::post('rooms/{room}/contracts/{contract}/renew', [\App\Http\Controllers\Landlord\ContractController::class, 'renew'])->name('rooms.contracts.renew');
            Route::get('rooms/{room}/contracts/{contract}/pdf', [\App\Http\Controllers\Landlord\ContractController::class, 'downloadPdf'])->name('rooms.contracts.pdf');
            
            // Renter Request Services management (moved from renters to renter-requests)
            Route::get('renter-requests/{renterRequest}/services', [RenterRequestController::class, 'renterRequestServices'])->name('renter-requests.services');
            Route::post('renter-requests/{renterRequest}/services', [RenterRequestController::class, 'attachService'])->name('renter-requests.services.attach');
            Route::put('renter-request-services/{renterRequestService}', [RenterRequestController::class, 'updateRenterRequestService'])->name('renter-request-services.update');
            Route::delete('renter-request-services/{renterRequestService}', [RenterRequestController::class, 'detachService'])->name('renter-request-services.detach');
            
            Route::resource('bills', BillController::class);
            Route::resource('payments', PaymentController::class);
            Route::post('meter-logs/bulk', [MeterLogController::class, 'bulkStore'])->name('meter-logs.bulk-store');
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
            
            Route::post('renter-requests/{id}/restore', [RenterRequestController::class, 'restore'])->name('renter-requests.restore');
            Route::post('renter-requests/{renterRequest}/create-account', [RenterRequestController::class, 'createTenantAccount'])->name('renter-requests.create-account');
            
            // ✅ Staff Management (chỉ landlord mới tạo/xóa/sửa staff)
            Route::middleware('role:landlord')->group(function () {
                Route::resource('staff', StaffController::class);
                Route::post('staff/{staff}/houses', [StaffController::class, 'assignHouse'])->name('staff.houses.assign');
                Route::delete('staff/{staff}/houses/{house}', [StaffController::class, 'removeHouse'])->name('staff.houses.remove');
                Route::post('staff/{staff}/change-password', [StaffController::class, 'changePassword'])->name('staff.change-password');

                // ✅ RBAC: Quản lý vai trò và phân quyền
                Route::resource('staff-roles', StaffRoleController::class)->except(['show', 'create', 'edit']);
                Route::post('staff/{staff}/assign-role', [StaffRoleController::class, 'assignToStaff'])->name('staff.assign-role');
            });

            // Tenant Requests (from tenant users)
            Route::get('tenant-requests', [\App\Http\Controllers\Landlord\TenantRequestController::class, 'index'])->name('tenant-requests.index');
            Route::get('tenant-requests/{tenantRequest}', [\App\Http\Controllers\Landlord\TenantRequestController::class, 'show'])->name('tenant-requests.show');
            Route::post('tenant-requests/{tenantRequest}/status/{status}', [\App\Http\Controllers\Landlord\TenantRequestController::class, 'updateStatus'])->name('tenant-requests.update-status');
            Route::post('tenant-requests/{tenantRequest}/respond', [\App\Http\Controllers\Landlord\TenantRequestController::class, 'respond'])->name('tenant-requests.respond');
            Route::post('tenant-requests/{tenantRequest}/assign', [\App\Http\Controllers\Landlord\TenantRequestController::class, 'assign'])->name('tenant-requests.assign');
            Route::post('tenant-requests/{tenantRequest}/resolve', [\App\Http\Controllers\Landlord\TenantRequestController::class, 'resolve'])->name('tenant-requests.resolve');
            
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
            Route::post('requests/{tenantRequest}/close', [\App\Http\Controllers\Tenant\TenantRequestController::class, 'close'])->name('requests.close');
            Route::post('requests/{tenantRequest}/reject', [\App\Http\Controllers\Tenant\TenantRequestController::class, 'reject'])->name('requests.reject');
            
            // Tenant Bills
            Route::get('bills', [\App\Http\Controllers\Tenant\BillController::class, 'index'])->name('bills.index');
            Route::get('bills/{bill}', [\App\Http\Controllers\Tenant\BillController::class, 'show'])->name('bills.show');
            Route::post('bills/{bill}/pay-test', [\App\Http\Controllers\Tenant\BillController::class, 'payTest'])->name('bills.payTest');
        });


    // ✅ Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // SSO token: issue short-lived token to allow external site to recognize logged-in user
    Route::post('/sso-token', [\App\Http\Controllers\SsoController::class, 'createToken'])->name('sso.token');
    });
});

require __DIR__.'/auth.php';