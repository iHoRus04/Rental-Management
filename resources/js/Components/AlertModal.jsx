import Modal from '@/Components/Modal';

/**
 * AlertModal - Thay thế cho window.alert()
 *
 * Props:
 * - show (bool): Hiển thị modal
 * - onClose (fn): Đóng modal
 * - title (string): Tiêu đề thông báo
 * - message (string): Nội dung thông báo
 * - type ('warning' | 'error' | 'success' | 'info'): Loại thông báo
 */
export default function AlertModal({
    show = false,
    onClose = () => {},
    title = 'Thông báo',
    message = '',
    type = 'warning',
}) {
    const iconMap = {
        warning: (
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
            </div>
        ),
        error: (
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
            </div>
        ),
        success: (
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
            </div>
        ),
        info: (
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                </svg>
            </div>
        ),
    };

    const buttonColorMap = {
        warning: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500',
        error: 'bg-red-500 hover:bg-red-600 focus:ring-red-500',
        success: 'bg-green-500 hover:bg-green-600 focus:ring-green-500',
        info: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500',
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="sm">
            <div className="p-6">
                {iconMap[type]}
                <h3 className="mt-4 text-center text-lg font-semibold text-gray-900">
                    {title}
                </h3>
                <p className="mt-2 text-center text-sm text-gray-600">
                    {message}
                </p>
                <div className="mt-6 flex justify-center">
                    <button
                        type="button"
                        onClick={onClose}
                        className={`inline-flex items-center rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonColorMap[type]}`}
                    >
                        Đã hiểu
                    </button>
                </div>
            </div>
        </Modal>
    );
}
