import Modal from '@/Components/Modal';

/**
 * ConfirmModal - Thay thế cho window.confirm()
 *
 * Props:
 * - show (bool): Hiển thị modal
 * - onClose (fn): Đóng modal (hủy bỏ)
 * - onConfirm (fn): Hàm thực thi khi nhấn Xác nhận
 * - title (string): Tiêu đề xác nhận
 * - message (string): Nội dung cần xác nhận
 * - confirmText (string): Text nút xác nhận
 * - cancelText (string): Text nút hủy
 * - type ('danger' | 'warning' | 'info'): Loại hành động
 * - processing (bool): Trạng thái đang xử lý
 */
export default function ConfirmModal({
    show = false,
    onClose = () => {},
    onConfirm = () => {},
    title = 'Xác nhận',
    message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
    confirmText = 'Xác nhận',
    cancelText = 'Hủy bỏ',
    type = 'danger',
    processing = false,
}) {
    const iconMap = {
        danger: (
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
            </div>
        ),
        warning: (
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
            </div>
        ),
        info: (
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                </svg>
            </div>
        ),
    };

    const confirmButtonMap = {
        danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        warning: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500',
        info: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
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
                <div className="mt-6 flex justify-center gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={processing}
                        className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={processing}
                        className={`inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${confirmButtonMap[type]}`}
                    >
                        {processing ? 'Đang xử lý...' : confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
