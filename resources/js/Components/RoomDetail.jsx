import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RequestRent from '@/Components/RequestRent';

export default function RoomDetail() {
    const { id } = useParams();
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showRequestForm, setShowRequestForm] = useState(false);

    useEffect(() => {
        fetchRoomDetail();
    }, [id]);

    const fetchRoomDetail = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/public/rooms/${id}`);
            const data = await response.json();
            
            if (data.success) {
                setRoom(data.data);
            } else {
                setError(data.message || 'Không thể tải thông tin phòng');
            }
        } catch (err) {
            setError('Lỗi kết nối đến máy chủ');
            console.error('Error fetching room:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-700 text-lg">{error}</p>
                <button 
                    onClick={fetchRoomDetail}
                    className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
                <p className="text-gray-600 text-lg">Không tìm thấy thông tin phòng</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{room.name}</h1>
                <p className="text-gray-600 mt-2">{room.house.name} - {room.house.address}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Images and Info */}
                <div className="lg:col-span-2">
                    {/* Image Gallery */}
                    <div className="bg-gray-100 rounded-xl overflow-hidden mb-6 h-96 flex items-center justify-center">
                        <div className="text-center">
                            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="mt-2 text-gray-500">Hình ảnh phòng</p>
                        </div>
                    </div>

                    {/* Room Details */}
                    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin chi tiết</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="border rounded-lg p-4">
                                <p className="text-gray-600">Diện tích</p>
                                <p className="text-xl font-semibold">{room.area} m²</p>
                            </div>
                            <div className="border rounded-lg p-4">
                                <p className="text-gray-600">Tầng</p>
                                <p className="text-xl font-semibold">{room.floor}</p>
                            </div>
                            <div className="border rounded-lg p-4">
                                <p className="text-gray-600">Trạng thái</p>
                                <p className={`text-xl font-semibold ${room.is_available ? 'text-green-600' : 'text-red-600'}`}>
                                    {room.is_available ? 'Còn trống' : 'Đã cho thuê'}
                                </p>
                            </div>
                            <div className="border rounded-lg p-4">
                                <p className="text-gray-600">Giá thuê</p>
                                <p className="text-xl font-semibold text-blue-600">
                                    {new Intl.NumberFormat('vi-VN').format(room.price)} ₫/tháng
                                </p>
                            </div>
                        </div>
                        
                        {room.description && (
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Mô tả</h3>
                                <p className="text-gray-700">{room.description}</p>
                            </div>
                        )}
                    </div>

                    {/* Amenities */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Tiện ích</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Wifi miễn phí</span>
                            </div>
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Điều hòa</span>
                            </div>
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Nước nóng</span>
                            </div>
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Chỗ để xe</span>
                            </div>
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Giặt sấy</span>
                            </div>
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>An ninh 24/7</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Booking */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
                        <div className="text-center mb-6">
                            <p className="text-3xl font-bold text-blue-600">
                                {new Intl.NumberFormat('vi-VN').format(room.price)} ₫
                            </p>
                            <p className="text-gray-600">/ tháng</p>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={() => setShowRequestForm(true)}
                                disabled={!room.is_available}
                                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                                    room.is_available
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                {room.is_available ? 'Đăng ký thuê phòng' : 'Phòng đã cho thuê'}
                            </button>

                            {!room.is_available && (
                                <p className="text-center text-red-600 text-sm">
                                    Phòng này hiện không còn trống. Vui lòng chọn phòng khác.
                                </p>
                            )}
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-3">Liên hệ</h3>
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <svg className="h-5 w-5 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span>0987 654 321</span>
                                </div>
                                <div className="flex items-center">
                                    <svg className="h-5 w-5 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span>info@nhatro.com</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Request Rent Form Modal */}
            {showRequestForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-900">Đăng ký thuê phòng</h3>
                                <button
                                    onClick={() => setShowRequestForm(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <RequestRent roomId={room.id} onClose={() => setShowRequestForm(false)} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
