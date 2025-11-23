import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function RequestRent({ roomId, onClose }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            setError(null);
            
            const requestData = {
                room_id: roomId,
                full_name: data.full_name,
                phone: data.phone,
                email: data.email || null,
                message: data.message || null
            };
            
            const response = await fetch('/api/public/request-rent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(requestData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                setSuccess(true);
                reset(); // Reset form
                
                // Show toast notification
                showToast('Gửi yêu cầu thành công!');
                
                // Close form after 2 seconds
                setTimeout(() => {
                    onClose();
                }, 2000);
            } else {
                if (result.errors) {
                    // Handle validation errors from server
                    Object.keys(result.errors).forEach(key => {
                        setError(key, {
                            type: 'server',
                            message: result.errors[key][0]
                        });
                    });
                } else {
                    setError('submit', {
                        type: 'server',
                        message: result.message || 'Có lỗi xảy ra khi gửi yêu cầu'
                    });
                }
            }
        } catch (err) {
            setError('submit', {
                type: 'network',
                message: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.'
            });
            console.error('Error submitting request:', err);
        } finally {
            setLoading(false);
        }
    };

    // Function to show toast notification
    const showToast = (message) => {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
        toast.innerHTML = `
            <div class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>${message}</span>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
        
        // Add CSS for toast animation
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.innerHTML = `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out;
                }
            `;
            document.head.appendChild(style);
        }
    };

    if (success) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Gửi yêu cầu thành công!</h3>
                <p className="text-gray-600">
                    Chúng tôi đã nhận được yêu cầu của bạn. Chủ nhà sẽ liên hệ trong thời gian sớm nhất.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && error.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-700 text-sm">{error.submit.message}</p>
                </div>
            )}

            <input type="hidden" {...register('room_id')} value={roomId} />

            <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                    id="full_name"
                    {...register('full_name', { 
                        required: 'Vui lòng nhập họ tên',
                        minLength: {
                            value: 2,
                            message: 'Họ tên phải có ít nhất 2 ký tự'
                        }
                    })}
                    className={`w-full rounded-lg border px-3 py-2 ${
                        errors.full_name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="Nhập họ tên đầy đủ"
                />
                {errors.full_name && <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>}
            </div>

            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                    id="phone"
                    {...register('phone', { 
                        required: 'Vui lòng nhập số điện thoại',
                        pattern: {
                            value: /^[0-9]{10,11}$/,
                            message: 'Số điện thoại không hợp lệ'
                        }
                    })}
                    className={`w-full rounded-lg border px-3 py-2 ${
                        errors.phone ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="Nhập số điện thoại"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email (tùy chọn)
                </label>
                <input
                    type="email"
                    id="email"
                    {...register('email', { 
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Email không hợp lệ'
                        }
                    })}
                    className={`w-full rounded-lg border px-3 py-2 ${
                        errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="Nhập địa chỉ email"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú (tùy chọn)
                </label>
                <textarea
                    id="message"
                    {...register('message')}
                    rows="3"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Thông tin thêm bạn muốn gửi cho chủ nhà..."
                />
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </button>
            </div>
        </form>
    );
}
