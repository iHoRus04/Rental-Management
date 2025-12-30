import { useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal'; // Giữ lại Modal gốc của bạn
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputError from '@/Components/InputError';

// Inline SVG icons to avoid lucide-react dependency
const Icon = ({ children, className = '', viewBox = '0 0 24 24' }) => (
    <svg className={className} viewBox={viewBox} fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">{children}</svg>
);

const Trash2 = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 6h18" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 6v12a2 2 0 002 2h4a2 2 0 002-2V6" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 11v6M14 11v6" />
    </Icon>
);

const AlertTriangle = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v4" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 17h.01" />
    </Icon>
);

const Lock = (props) => (
    <Icon {...props}>
        <rect x="3" y="11" width="18" height="10" rx="2" strokeWidth="1.5" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 11V8a5 5 0 0110 0v3" />
    </Icon>
);

const X = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18 6L6 18M6 6l12 12" />
    </Icon>
);

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`bg-white p-8 rounded-2xl shadow-sm border border-emerald-100 ${className}`}>
            <header className="mb-6">
                <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    Xóa tài khoản
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                    Một khi tài khoản của bạn bị xóa, tất cả tài nguyên và dữ liệu liên quan sẽ bị xóa vĩnh viễn. Trước khi xóa tài khoản, vui lòng tải xuống bất kỳ dữ liệu hoặc thông tin nào bạn muốn giữ lại.
                </p>
            </header>

            <button
                onClick={confirmUserDeletion}
                className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-bold py-3 px-6 rounded-xl transition-all border border-red-200 flex items-center gap-2"
            >
                <Trash2 className="w-4 h-4" /> Xóa tài khoản
            </button>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6 bg-white rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <AlertTriangle className="w-6 h-6 text-red-500" />
                            Bạn có chắc chắn muốn xóa?
                        </h2>
                        <button type="button" onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
                        <p className="text-sm text-red-800">
                            Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị mất vĩnh viễn. 
                            Vui lòng nhập mật khẩu để xác nhận.
                        </p>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="password" className="sr-only">Mật khẩu</label>
                        <div className="relative">
                            <input
                                id="password"
                                type="password"
                                name="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full px-4 py-3 pl-10 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all text-sm text-slate-800"
                                placeholder="Nhập mật khẩu của bạn để xác nhận"
                            />
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
                        </div>
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="flex justify-end gap-3">
                        <SecondaryButton onClick={closeModal}>Hủy bỏ</SecondaryButton>

                        <PrimaryButton
                            type="submit"
                            disabled={processing}
                            className="bg-red-600 hover:bg-red-700 px-5 py-2.5 rounded-xl"
                        >
                            {processing ? 'Đang xử lý...' : 'Xóa tài khoản'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}