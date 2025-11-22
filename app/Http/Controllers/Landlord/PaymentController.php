<?php

namespace App\Http\Controllers\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Bill;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class PaymentController extends Controller
{
    public function index()
    {
        $payments = Payment::with(['bill.room', 'bill.renter'])
            ->latest('payment_date')
            ->get();

        return Inertia::render('Landlord/Payments/Index', [
            'payments' => $payments,
        ]);
    }

    public function create(Request $request)
    {
        $billId = $request->query('bill_id');
        $bills = Bill::with(['room', 'renter'])
            ->where('status', '!=', 'paid')
            ->get();

        $selectedBill = null;
        if ($billId) {
            $selectedBill = Bill::with(['room', 'renter'])->find($billId);
        }

        return Inertia::render('Landlord/Payments/Create', [
            'bills' => $bills,
            'selectedBill' => $selectedBill,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'bill_id' => 'required|exists:bills,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'payment_method' => 'required|in:cash,bank_transfer,check,other',
            'reference' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $bill = Bill::findOrFail($validated['bill_id']);

        // Tạo payment record
        Payment::create($validated);

        // Cập nhật bill paid_amount
        $bill->paid_amount += $validated['amount'];
        $bill->updatePaymentStatus();
        $bill->save();

        return redirect()->route('landlord.payments.index')
                        ->with('success', 'Ghi nhận thanh toán thành công!');
    }

    public function show(Payment $payment)
    {
        $payment->load(['bill.room', 'bill.renter', 'bill.contract']);

        return Inertia::render('Landlord/Payments/Show', [
            'payment' => $payment,
        ]);
    }

    public function edit(Payment $payment)
    {
        $bills = Bill::with(['room', 'renter'])
            ->where('status', '!=', 'paid')
            ->get();

        return Inertia::render('Landlord/Payments/Edit', [
            'payment' => $payment,
            'bills' => $bills,
        ]);
    }

    public function update(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'payment_method' => 'required|in:cash,bank_transfer,check,other',
            'reference' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        // Cập nhật bill paid_amount (trừ số tiền cũ, cộng số tiền mới)
        $bill = $payment->bill;
        $bill->paid_amount = $bill->paid_amount - $payment->amount + $validated['amount'];
        $bill->updatePaymentStatus();
        $bill->save();

        $payment->update($validated);

        return redirect()->route('landlord.payments.show', $payment->id)
                        ->with('success', 'Cập nhật thanh toán thành công!');
    }

    public function destroy(Payment $payment)
    {
        // Cập nhật bill paid_amount
        $bill = $payment->bill;
        $bill->paid_amount -= $payment->amount;
        $bill->updatePaymentStatus();
        $bill->save();

        $payment->delete();

        return redirect()->route('landlord.payments.index')
                        ->with('success', 'Đã xóa ghi nhận thanh toán');
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
            ->setOption('defaultFont', 'sans-serif');

        return $pdf->stream($filename); // hoặc ->download($filename)
    }

}
