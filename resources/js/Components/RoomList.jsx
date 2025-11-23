import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RoomList() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/public/rooms');
            const data = await response.json();
            
            if (data.success) {
                setRooms(data.data);
            } else {
                setError(data.message || 'Không thể tải danh sách phòng');
            }
        } catch (err) {
            setError('Lỗi kết nối đến máy chủ');
            console.error('Error fetching rooms:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-red-700">{error}</p>
                <button 
                    onClick={fetchRooms}
                    className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    if (rooms.length === 0) {
        return (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-600">Hiện tại không có phòng trống nào</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
                <div key={room.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{room.name}</h3>
                                <p className="text-gray-600">{room.house.name}</p>
                            </div>
                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                Còn trống
                            </span>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Giá thuê:</span>
                                <span className="font-semibold text-blue-600">
                                    {new Intl.NumberFormat('vi-VN').format(room.price)} ₫/tháng
                                </span>
                            </div>
                            
                            <div className="flex justify-between">
                                <span className="text-gray-600">Diện tích:</span>
                                <span className="font-medium">{room.area} m²</span>
                            </div>
                            
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tầng:</span>
                                <span className="font-medium">{room.floor}</span>
                            </div>
                        </div>
                        
                        <div className="mt-6">
                            <button
                                onClick={() => navigate(`/rooms/${room.id}`)}
                                className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Xem chi tiết
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
