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
    protected $billService;

    public function __construct(BillService $billService)
    {
        $this->billService = $billService;
    }

    public function index()
    {
        $bills = Bill::with(['contract', 'room', 'renter'])
            ->latest()
            ->get();

        return Inertia::render('Landlord/Bills/Index', [
            'bills' => $bills,
        ]);
    }

    public function create()
    {
        $contracts = Contract::with(['room', 'renter'])
            ->where('status', 'active')
            ->get();

        return Inertia::render('Landlord/Bills/Create', [
            'contracts' => $contracts,
        ]);
    }

    public function store(Request $request)
    {
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

        $contract = Contract::findOrFail($validated['contract_id']);
        
        $bill = new Bill([
            'contract_id' => $contract->id,
            'room_id' => $contract->room_id,
            'renter_id' => $contract->renter_id,
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

        $bill->calculateTotal();
        if (isset($validated['notes'])) {
            $bill->notes = $validated['notes'];
        }
        $bill->save();

        return redirect()->route('landlord.bills.index')
                        ->with('success', 'Tạo hóa đơn thành công!');
    }

    public function show(Bill $bill)
    {
        $bill->load(['contract', 'room', 'renter']);
        
        return Inertia::render('Landlord/Bills/Show', [
            'bill' => $bill,
        ]);
    }

    public function edit(Bill $bill)
    {
        $contracts = Contract::with(['room', 'renter'])
            ->where('status', 'active')
            ->get();

        return Inertia::render('Landlord/Bills/Edit', [
            'bill' => $bill,
            'contracts' => $contracts,
        ]);
    }

    public function update(Request $request, Bill $bill)
    {
        // Nếu chỉ cập nhật thanh toán
        if ($request->has('paid_amount') && !$request->has('month')) {
            $validated = $request->validate([
                'paid_amount' => 'required|numeric|min:0',
            ]);

            $bill->paid_amount = $validated['paid_amount'];
            $bill->updatePaymentStatus();
            $bill->save();

            return redirect()->route('landlord.bills.show', $bill->id)
                            ->with('success', 'Cập nhật thanh toán thành công!');
        }

        // Cập nhật toàn bộ thông tin hóa đơn
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

        $bill->calculateTotal();
        
        if (isset($validated['notes'])) {
            $bill->notes = $validated['notes'];
        }
        
        $bill->save();

        return redirect()->route('landlord.bills.show', $bill->id)
                        ->with('success', 'Cập nhật hóa đơn thành công!');
    }

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

        $count = $this->billService->generateMonthlyBills($month, $year);

        return redirect()->route('landlord.bills.index')
                        ->with('success', "Đã tạo {$count} hóa đơn cho tháng {$month}/{$year}");
    }

    /**
     * Xuất hóa đơn PDF
     */
    public function exportPDF(Bill $bill)
    {
        $bill->load(['contract', 'room', 'renter', 'payments']);

        $filename = 'hoa-don-' . $bill->month . '-' . $bill->year . '-' . str_replace(' ', '-', $bill->room->name) . '.pdf';
        
        $pdf = Pdf::loadView('landlord.invoices.pdf', ['bill' => $bill])
            ->setPaper('a4', 'portrait')
            ->setOption('defaultFont', 'DejaVu Sans')
            ->setOption('isHtml5ParserEnabled', true)
            ->setOption('isRemoteEnabled', true);

        return response($pdf->output(), 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
            ->header('Pragma', 'no-cache')
            ->header('Expires', '0');
    }
}

