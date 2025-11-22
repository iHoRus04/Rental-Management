<?php
require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

// Check bills
$bills = \App\Models\Bill::with(['room', 'renter'])->get();
echo "Total bills: " . $bills->count() . "\n";
if ($bills->count() > 0) {
    $bill = $bills->first();
    echo "Bill ID: " . $bill->id . "\n";
    echo "Room: " . $bill->room->name . "\n";
    echo "Amount: " . $bill->amount . "\n";
    echo "Status: " . $bill->status . "\n";
}
?>
