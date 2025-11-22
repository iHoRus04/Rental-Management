import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index() {
    const { meterLogs, rooms } = usePage().props;
    const [filterRoom, setFilterRoom] = useState('');
    const [filterMonth, setFilterMonth] = useState('');
    const [filterYear, setFilterYear] = useState('');

    const filteredLogs = meterLogs.filter(log => {
        if (filterRoom && log.room_id != filterRoom) return false;
        if (filterMonth && log.month != filterMonth) return false;
        if (filterYear && log.year != filterYear) return false;
        return true;
    });

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Quản lý chỉ số điện-nước</h1>
                <Link
                    href={route('landlord.meter-logs.create')}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    + Thêm chỉ số mới
                </Link>
            </div>

            {/* Bộ lọc */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex gap-4 flex-wrap items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phòng
                        </label>
                        <select
                            value={filterRoom}
                            onChange={(e) => setFilterRoom(e.target.value)}
                            className="rounded-md border border-gray-300 px-3 py-2"
                        >
                            <option value="">-- Tất cả phòng --</option>
                            {rooms.map(room => (
                                <option key={room.id} value={room.id}>
                                    {room.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tháng
                        </label>
                        <select
                            value={filterMonth}
                            onChange={(e) => setFilterMonth(e.target.value)}
                            className="rounded-md border border-gray-300 px-3 py-2"
                        >
                            <option value="">-- Tất cả tháng --</option>
                            {[...Array(12)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    Tháng {i + 1}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Năm
                        </label>
                        <input
                            type="number"
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                            className="rounded-md border border-gray-300 px-3 py-2 w-32"
                        />
                    </div>
                    <button
                        onClick={() => {
                            setFilterRoom('');
                            setFilterMonth('');
                            setFilterYear('');
                        }}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                    >
                        Xóa bộ lọc
                    </button>
                </div>
            </div>

            {/* Danh sách chỉ số */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold">Danh sách chỉ số ({filteredLogs.length})</h2>
                </div>
                {filteredLogs.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Phòng</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Kỳ</th>
                                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Chỉ số điện</th>
                                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Sử dụng điện</th>
                                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Chỉ số nước</th>
                                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Sử dụng nước</th>
                                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map((log, idx) => (
                                    <tr key={log.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-6 py-4 font-medium text-gray-900">{log.room.name}</td>
                                        <td className="px-6 py-4 text-gray-600">
                                            Tháng {log.month}/{log.year}
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-600">
                                            {log.electric_reading} kWh
                                        </td>
                                        <td className="px-6 py-4 text-center font-medium text-blue-600">
                                            {log.electric_usage || 0} kWh
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-600">
                                            {log.water_reading} m³
                                        </td>
                                        <td className="px-6 py-4 text-center font-medium text-blue-600">
                                            {log.water_usage || 0} m³
                                        </td>
                                        <td className="px-6 py-4 text-center space-x-2">
                                            <Link
                                                href={route('landlord.meter-logs.show', log.id)}
                                                className="text-blue-600 hover:underline text-sm"
                                            >
                                                Chi tiết
                                            </Link>
                                            <Link
                                                href={route('landlord.meter-logs.edit', log.id)}
                                                className="text-blue-600 hover:underline text-sm"
                                            >
                                                Sửa
                                            </Link>
                                            <Link
                                                as="button"
                                                method="delete"
                                                href={route('landlord.meter-logs.destroy', log.id)}
                                                className="text-red-600 hover:underline text-sm"
                                                onClick={(e) => {
                                                    if (!confirm('Xóa chỉ số này?')) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            >
                                                Xóa
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-6 text-center text-gray-500">
                        Không có dữ liệu chỉ số điện-nước
                    </div>
                )}
            </div>
        </div>
    );
}
