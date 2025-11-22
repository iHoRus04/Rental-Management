import { Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Edit() {
    const { meterLog, rooms } = usePage().props;

    const { data, setData, put, processing, errors } = useForm({
        room_id: meterLog.room_id,
        month: meterLog.month,
        year: meterLog.year,
        electric_reading: meterLog.electric_reading,
        water_reading: meterLog.water_reading,
        notes: meterLog.notes || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('landlord.meter-logs.update', meterLog.id));
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <Link
                    href={route('landlord.meter-logs.show', meterLog.id)}
                    className="text-blue-600 hover:underline"
                >
                    ← Quay lại chi tiết
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
                <h1 className="text-2xl font-bold mb-6">Chỉnh sửa chỉ số</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Chọn phòng */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phòng <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={data.room_id}
                            onChange={e => setData('room_id', parseInt(e.target.value))}
                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                        >
                            {rooms.map(room => (
                                <option key={room.id} value={room.id}>
                                    {room.name}
                                </option>
                            ))}
                        </select>
                        {errors.room_id && <p className="text-red-500 text-sm mt-1">{errors.room_id}</p>}
                    </div>

                    {/* Tháng năm */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tháng <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.month}
                                onChange={e => setData('month', parseInt(e.target.value))}
                                className="w-full rounded-md border border-gray-300 px-3 py-2"
                            >
                                {[...Array(12)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        Tháng {i + 1}
                                    </option>
                                ))}
                            </select>
                            {errors.month && <p className="text-red-500 text-sm mt-1">{errors.month}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Năm <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={data.year}
                                onChange={e => setData('year', parseInt(e.target.value))}
                                className="w-full rounded-md border border-gray-300 px-3 py-2"
                            />
                            {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
                        </div>
                    </div>

                    {/* Chỉ số */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-4">Chỉnh sửa chỉ số</h3>
                        
                        <div className="space-y-4">
                            {/* Điện */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Chỉ số điện (kWh) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={data.electric_reading}
                                    onChange={e => setData('electric_reading', parseInt(e.target.value) || 0)}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                                {errors.electric_reading && <p className="text-red-500 text-sm mt-1">{errors.electric_reading}</p>}
                            </div>

                            {/* Nước */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Chỉ số nước (m³) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={data.water_reading}
                                    onChange={e => setData('water_reading', parseInt(e.target.value) || 0)}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                                {errors.water_reading && <p className="text-red-500 text-sm mt-1">{errors.water_reading}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Ghi chú */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ghi chú
                        </label>
                        <textarea
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            rows={3}
                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                    </div>

                    <div className="flex justify-between">
                        <Link
                            href={route('landlord.meter-logs.show', meterLog.id)}
                            className="text-gray-600 hover:underline"
                        >
                            ← Quay lại
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                            {processing ? 'Đang lưu...' : 'Cập nhật chỉ số'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
