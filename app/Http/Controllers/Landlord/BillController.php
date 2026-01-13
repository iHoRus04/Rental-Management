<?php

namespace App\Http\Controllers\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Contract;
use App\Models\MeterLog;
use App\Services\BillService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class BillController extends Controller
{
    /**
     * Service xử lý logic tạo hóa đơn hàng loạt
     */
    protected $billService;

    /**
     * Inject BillService thông qua constructor
     */
    public function __construct(BillService $billService)
    {
        $this->billService = $billService;
    }

    /**
     * Danh sách hóa đơn
     * - Hỗ trợ trả về JSON (API)
     * - Hoặc render trang Inertia
     */
    public function index(Request $request)
    {
        // Lấy danh sách hóa đơn + eager loading các quan hệ
        $bills = Bill::with(['contract', 'room', 'renterRequest'])
            ->latest()
            ->get();

        // Nếu request là JSON (ví dụ gọi API)
        if ($request->wantsJson()) {
            return response()->json([
                'bills' => $bills,
            ]);
        }

        // Render giao diện danh sách hóa đơn
        return Inertia::render('Landlord/Bills/Index', [
            'bills' => $bills,
        ]);
    }

    /**
     * Trang tạo hóa đơn mới
     */
    public function create()
    {
        // Lấy các hợp đồng đang active
        $contracts = Contract::with(['room', 'renterRequest'])
            ->where('status', 'active')
            ->get()
            ->map(function ($contract) {
                // Chuẩn hóa dữ liệu trả về cho frontend
                return [
                    'id' => $contract->id,
                    'room_id' => $contract->room_id,
                    'renter_request_id' => $contract->renter_request_id,
                    'monthly_rent' => $contract->monthly_rent,
                    'status' => $contract->status,
                    'room' => [
                        'id' => $contract->room->id,
                        'name' => $contract->room->name,
                    ],
                    'renterRequest' => $contract->renterRequest ? [
                        'id' => $contract->renterRequest->id,
                        'name' => $contract->renterRequest->name,
                        'phone' => $contract->renterRequest->phone,
                        'email' => $contract->renterRequest->email,
                    ] : null,
                ];
            });

        return Inertia::render('Landlord/Bills/Create', [
            'contracts' => $contracts,
        ]);
    }

    /**
     * Lưu hóa đơn mới
     */
    public function store(Request $request)
    {
        // Validate dữ liệu gửi lên
        $validated = $request->validate([
            'contract_id' => 'required|exists:contracts,id',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020',
            'room_price' => 'required|numeric|min:0',
            'electric_kwh' => 'nullable|integer|min:0',
            'electric_price' => 'nullable|numeric|min:0',
            'water_usage' => 'nullable|integer|min:0',
            'water_price' => 'nullable|numeric|min:0',
            'internet_cost' => 'nullable|numeric|min:0',
            'trash_cost' => 'nullable|numeric|min:0',
            'other_costs' => 'nullable|numeric|min:0',
            'due_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        // Lấy thông tin hợp đồng
        $contract = Contract::findOrFail($validated['contract_id']);

        // Tạo hóa đơn mới
        $bill = new Bill([
            'contract_id' => $contract->id,
            'room_id' => $contract->room_id,
            'renter_request_id' => $contract->renter_request_id,
            'month' => $validated['month'],
            'year' => $validated['year'],
            'room_price' => $validated['room_price'],
            'electric_kwh' => $validated['electric_kwh'] ?? 0,
            'electric_price' => $validated['electric_price'] ?? 0,
            'water_usage' => $validated['water_usage'] ?? 0,
            'water_price' => $validated['water_price'] ?? 0,
            'internet_cost' => $validated['internet_cost'] ?? 0,
            'trash_cost' => $validated['trash_cost'] ?? 0,
            'other_costs' => $validated['other_costs'] ?? 0,
            'due_date' => $validated['due_date'],
            'status' => 'pending',
            'paid_amount' => 0,
        ]);

        // Tính tổng tiền hóa đơn
        $bill->calculateTotal();

        // Lưu ghi chú nếu có
        if (isset($validated['notes'])) {
            $bill->notes = $validated['notes'];
        }

        $bill->save();

        return redirect()->route('landlord.bills.index')
            ->with('success', 'Tạo hóa đơn thành công!');
    }

    /**
     * Xem chi tiết hóa đơn
     */
    public function show(Bill $bill)
    {
        // Load thêm các quan hệ cần thiết
        $bill->load(['contract', 'room', 'renterRequest']);

        return Inertia::render('Landlord/Bills/Show', [
            'bill' => $bill,
        ]);
    }

    /**
     * Trang chỉnh sửa hóa đơn
     */
    public function edit(Bill $bill)
    {
        // Danh sách hợp đồng active
        $contracts = Contract::with(['room', 'renterRequest'])
            ->where('status', 'active')
            ->get();

        $bill->load(['room', 'renterRequest']);

        return Inertia::render('Landlord/Bills/Edit', [
            'bill' => $bill,
            'contracts' => $contracts,
        ]);
    }

    /**
     * Cập nhật hóa đơn
     */
    public function update(Request $request, Bill $bill)
    {
        /**
         * Trường hợp chỉ cập nhật tiền đã thanh toán
         */
        if ($request->has('paid_amount') && !$request->has('month')) {
            $validated = $request->validate([
                'paid_amount' => 'required|numeric|min:0',
            ]);

            $bill->paid_amount = $validated['paid_amount'];
            $bill->updatePaymentStatus(); // Cập nhật trạng thái paid / partial / unpaid
            $bill->save();

            return redirect()->route('landlord.bills.show', $bill->id)
                ->with('success', 'Cập nhật thanh toán thành công!');
        }

        /**
         * Trường hợp cập nhật toàn bộ hóa đơn
         */
        $validated = $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020',
            'room_price' => 'required|numeric|min:0',
            'electric_kwh' => 'nullable|integer|min:0',
            'electric_price' => 'nullable|numeric|min:0',
            'water_usage' => 'nullable|integer|min:0',
            'water_price' => 'nullable|numeric|min:0',
            'internet_cost' => 'nullable|numeric|min:0',
            'trash_cost' => 'nullable|numeric|min:0',
            'other_costs' => 'nullable|numeric|min:0',
            'due_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        // Gán lại dữ liệu
        $bill->fill([
            'month' => $validated['month'],
            'year' => $validated['year'],
            'room_price' => $validated['room_price'],
            'electric_kwh' => $validated['electric_kwh'] ?? $bill->electric_kwh,
            'electric_price' => $validated['electric_price'] ?? $bill->electric_price,
            'water_usage' => $validated['water_usage'] ?? $bill->water_usage,
            'water_price' => $validated['water_price'] ?? $bill->water_price,
            'internet_cost' => $validated['internet_cost'] ?? $bill->internet_cost,
            'trash_cost' => $validated['trash_cost'] ?? $bill->trash_cost,
            'other_costs' => $validated['other_costs'] ?? $bill->other_costs,
            'due_date' => $validated['due_date'],
        ]);

        // Tính lại tổng tiền
        $bill->calculateTotal();

        if (isset($validated['notes'])) {
            $bill->notes = $validated['notes'];
        }

        $bill->save();

        return redirect()->route('landlord.bills.show', $bill->id)
            ->with('success', 'Cập nhật hóa đơn thành công!');
    }

    /**
     * Xóa hóa đơn
     */
    public function destroy(Bill $bill)
    {
        $bill->delete();

        return redirect()->route('landlord.bills.index')
            ->with('success', 'Đã xóa hóa đơn');
    }

    /**
     * Tạo hóa đơn hàng tháng cho tất cả hợp đồng
     */
    public function generateMonthly(Request $request)
    {
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

        // Gọi service xử lý logic tạo hàng loạt
        $count = $this->billService->generateMonthlyBills($month, $year);

        return redirect()->route('landlord.bills.index')
            ->with('success', "Đã tạo {$count} hóa đơn cho tháng {$month}/{$year}");
    }

    /**
     * Xuất hóa đơn PDF
     */
    public function exportPDF(Bill $bill)
    {
        // Load toàn bộ dữ liệu cần cho PDF
        $bill->load(['contract', 'room', 'renterRequest', 'payments']);

        // Tên file PDF
        $filename = 'hoa-don-' . $bill->month . '-' . $bill->year . '-' . str_replace(' ', '-', $bill->room->name) . '.pdf';

        // Render PDF từ view Blade
        $pdf = Pdf::loadView('landlord.invoices.pdf', ['bill' => $bill])
            ->setPaper('a4', 'portrait')
            ->setOption('defaultFont', 'DejaVu Sans')
            ->setOption('isHtml5ParserEnabled', true)
            ->setOption('isRemoteEnabled', true);

        // Trả file PDF về client
        return response($pdf->output(), 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
            ->header('Pragma', 'no-cache')
            ->header('Expires', '0');
    }
}
