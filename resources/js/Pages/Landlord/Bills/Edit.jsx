import { Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Edit() {
    const { bill } = usePage().props;

    const { data, setData, put, processing, errors } = useForm({
        month: bill.month,
        year: bill.year,
        room_price: bill.room_price,
        electric_kwh: bill.electric_kwh || 0,
        electric_price: bill.electric_price || 0,
        water_usage: bill.water_usage || 0,
        water_price: bill.water_price || 0,
        internet_cost: bill.internet_cost || 0,
        trash_cost: bill.trash_cost || 0,
        other_costs: bill.other_costs || 0,
        due_date: bill.due_date,
        notes: bill.notes || '',
    });

    const calculateElectricCost = () => {
        return (parseFloat(data.electric_kwh || 0) * parseFloat(data.electric_price || 0));
    };

    const calculateWaterCost = () => {
        return (parseFloat(data.water_usage || 0) * parseFloat(data.water_price || 0));
    };

    const calculateTotal = () => {
        return (
            parseFloat(data.room_price || 0) +
            calculateElectricCost() +
            calculateWaterCost() +
            parseFloat(data.internet_cost || 0) +
            parseFloat(data.trash_cost || 0) +
            parseFloat(data.other_costs || 0)
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('landlord.bills.update', bill.id));
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <Link
                    href={route('landlord.bills.show', bill.id)}
                    className="text-blue-600 hover:underline"
                >
                    ← Quay lại chi tiết hóa đơn
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl">
                <h1 className="text-2xl font-bold mb-6">Sửa hóa đơn</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-gray-50 border border-gray-200 rounded p-4">
                        <p className="text-sm text-gray-700">
                            <strong>Phòng:</strong> {bill.room.name}
                        </p>
                        <p className="text-sm text-gray-700">
                            <strong>Người thuê:</strong> {bill.renter.name}
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Tháng *
                            </label>
                            <select
                                value={data.month}
                                onChange={e => setData('month', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                            >
                                {[...Array(12)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        Tháng {i + 1}
                                    </option>
                                ))}
                            </select>
                            {errors.month && (
                                <div className="text-red-600 text-sm mt-1">{errors.month}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Năm *
                            </label>
                            <input
                                type="number"
                                value={data.year}
                                onChange={e => setData('year', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                            />
                            {errors.year && (
                                <div className="text-red-600 text-sm mt-1">{errors.year}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Hạn chót thanh toán *
                            </label>
                            <input
                                type="date"
                                value={data.due_date}
                                onChange={e => setData('due_date', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                            />
                            {errors.due_date && (
                                <div className="text-red-600 text-sm mt-1">{errors.due_date}</div>
                            )}
                        </div>
                    </div>

                    {/* Chi tiết hóa đơn */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-4">Chi tiết chi phí</h3>
                        
                        <div className="space-y-4">
                            {/* Tiền phòng */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Tiền phòng *
                                </label>
                                <input
                                    type="number"
                                    value={data.room_price}
                                    onChange={e => setData('room_price', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                                />
                                {errors.room_price && (
                                    <div className="text-red-600 text-sm mt-1">{errors.room_price}</div>
                                )}
                            </div>

                            {/* Điện */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Số kWh điện
                                    </label>
                                    <input
                                        type="number"
                                        value={data.electric_kwh}
                                        onChange={e => setData('electric_kwh', e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Đơn giá điện (₫/kWh)
                                    </label>
                                    <input
                                        type="number"
                                        value={data.electric_price}
                                        onChange={e => setData('electric_price', e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Tiền điện
                                    </label>
                                    <input
                                        type="number"
                                        value={calculateElectricCost()}
                                        readOnly
                                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm bg-gray-50 px-3 py-2 text-gray-600"
                                    />
                                </div>
                            </div>

                            {/* Nước */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Số m³ nước
                                    </label>
                                    <input
                                        type="number"
                                        value={data.water_usage}
                                        onChange={e => setData('water_usage', e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Đơn giá nước (₫/m³)
                                    </label>
                                    <input
                                        type="number"
                                        value={data.water_price}
                                        onChange={e => setData('water_price', e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Tiền nước
                                    </label>
                                    <input
                                        type="number"
                                        value={calculateWaterCost()}
                                        readOnly
                                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm bg-gray-50 px-3 py-2 text-gray-600"
                                    />
                                </div>
                            </div>

                            {/* Internet, Rác */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Tiền Internet
                                    </label>
                                    <input
                                        type="number"
                                        value={data.internet_cost}
                                        onChange={e => setData('internet_cost', e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Tiền rác
                                    </label>
                                    <input
                                        type="number"
                                        value={data.trash_cost}
                                        onChange={e => setData('trash_cost', e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {/* Chi phí khác */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Chi phí khác
                                </label>
                                <input
                                    type="number"
                                    value={data.other_costs}
                                    onChange={e => setData('other_costs', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                                    placeholder="0"
                                />
                            </div>

                            {/* Tổng tiền */}
                            <div className="bg-white p-3 rounded border border-gray-200 flex justify-between items-center">
                                <span className="font-semibold text-gray-700">Tổng tiền:</span>
                                <span className="text-xl font-bold text-blue-600">
                                    {calculateTotal().toLocaleString('vi-VN')} ₫
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Ghi chú */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Ghi chú
                        </label>
                        <textarea
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            rows={3}
                            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                            placeholder="Ghi chú thêm về hóa đơn..."
                        />
                        {errors.notes && (
                            <div className="text-red-600 text-sm mt-1">{errors.notes}</div>
                        )}
                    </div>

                    <div className="flex justify-between items-center">
                        <Link
                            href={route('landlord.bills.show', bill.id)}
                            className="text-gray-600 hover:underline"
                        >
                            ← Quay lại
                        </Link>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                            >
                                {processing ? 'Đang lưu...' : 'Cập nhật hóa đơn'}
                            </button>

                            <Link
                                href={route('landlord.bills.show', bill.id)}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            >
                                Hủy
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}