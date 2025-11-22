import { Link, usePage } from '@inertiajs/react';

export default function Show() {
    const { meterLog, history } = usePage().props;

    return (
        <div className="p-6">
            <div className="mb-6">
                <Link
                    href={route('landlord.meter-logs.index')}
                    className="text-blue-600 hover:underline"
                >
                    ← Quay lại danh sách
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chi tiết chỉ số hiện tại */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-2xl font-bold">
                                    {meterLog.room.name} - Tháng {meterLog.month}/{meterLog.year}
                                </h1>
                            </div>
                            <div className="flex gap-2">
                                <Link
                                    href={route('landlord.meter-logs.edit', meterLog.id)}
                                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                >
                                    Sửa
                                </Link>
                                <Link
                                    as="button"
                                    method="delete"
                                    href={route('landlord.meter-logs.destroy', meterLog.id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                                    onClick={(e) => {
                                        if (!confirm('Xóa chỉ số này?')) {
                                            e.preventDefault();
                                        }
                                    }}
                                >
                                    Xóa
                                </Link>
                            </div>
                        </div>

                        {/* Chỉ số điện */}
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-6 mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">⚡ Chỉ số điện</h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-gray-600 text-sm">Chỉ số hiện tại</p>
                                    <p className="text-4xl font-bold text-orange-600">{meterLog.electric_reading}</p>
                                    <p className="text-gray-500 text-sm mt-1">kWh</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm">Sử dụng trong tháng</p>
                                    <p className="text-4xl font-bold text-blue-600">{meterLog.electric_usage || 0}</p>
                                    <p className="text-gray-500 text-sm mt-1">kWh</p>
                                </div>
                            </div>
                        </div>

                        {/* Chỉ số nước */}
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">💧 Chỉ số nước</h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-gray-600 text-sm">Chỉ số hiện tại</p>
                                    <p className="text-4xl font-bold text-cyan-600">{meterLog.water_reading}</p>
                                    <p className="text-gray-500 text-sm mt-1">m³</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm">Sử dụng trong tháng</p>
                                    <p className="text-4xl font-bold text-blue-600">{meterLog.water_usage || 0}</p>
                                    <p className="text-gray-500 text-sm mt-1">m³</p>
                                </div>
                            </div>
                        </div>

                        {/* Ghi chú */}
                        {meterLog.notes && (
                            <div className="bg-gray-50 border border-gray-200 rounded p-4">
                                <h3 className="font-semibold mb-2">Ghi chú:</h3>
                                <p className="text-gray-700">{meterLog.notes}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Lịch sử chỉ số */}
                <div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold mb-4">Lịch sử chỉ số</h2>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {history.map((log, idx) => (
                                <Link
                                    key={log.id}
                                    href={route('landlord.meter-logs.show', log.id)}
                                    className={`block p-3 rounded border transition ${
                                        log.id === meterLog.id
                                            ? 'bg-blue-100 border-blue-300'
                                            : 'border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    <p className="font-medium text-sm">
                                        Tháng {log.month}/{log.year}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        ⚡ {log.electric_usage || 0} kWh
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        💧 {log.water_usage || 0} m³
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
