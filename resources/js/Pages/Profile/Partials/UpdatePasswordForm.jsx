import { useForm } from '@inertiajs/react';
import { useRef } from 'react';
import { Transition } from '@headlessui/react';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';

// Inline SVG icons to avoid dependency on lucide-react
const Icon = ({ children, className = '', viewBox = '0 0 24 24' }) => (
    <svg className={className} viewBox={viewBox} fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">{children}</svg>
);

const Lock = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11V7a4 4 0 10-8 0v4" />
        <rect x="4" y="11" width="16" height="10" rx="2" strokeWidth="1.5" />
    </Icon>
);

const Key = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 2l-2 2m-3 3a5 5 0 11-7 7L3 17" />
        <circle cx="11" cy="11" r="2" strokeWidth="1.5" />
    </Icon>
);

const Save = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 4h14v16H5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 8h14" />
    </Icon>
);

const CheckCircle = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4" />
        <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
    </Icon>
);

const AlertCircle = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 16h.01" />
        <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
    </Icon>
);

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={`bg-white p-8 rounded-2xl shadow-sm border border-emerald-100 ${className}`}>
            <header className="mb-8">
                <h2 className="text-xl font-bold text-teal-900 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-emerald-500" />
                    Đổi mật khẩu
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                    Đảm bảo tài khoản của bạn an toàn bằng cách sử dụng mật khẩu dài và ngẫu nhiên.
                </p>
            </header>

            <form onSubmit={updatePassword} className="space-y-6">
                {/* Current Password */}
                <div>
                    <label htmlFor="current_password" className="block text-sm font-bold text-slate-700 mb-2">
                        Mật khẩu hiện tại
                    </label>
                    <div className="relative">
                        <input
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                            type="password"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm text-slate-800"
                            autoComplete="current-password"
                            placeholder="••••••••"
                        />
                        <Key className="absolute right-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                    <InputError message={errors.current_password} className="mt-2" />
                </div>

                {/* New Password */}
                <div>
                    <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-2">
                        Mật khẩu mới
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            type="password"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm text-slate-800"
                            autoComplete="new-password"
                            placeholder="Mật khẩu mới (tối thiểu 8 ký tự)"
                        />
                        <Lock className="absolute right-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* Confirm Password */}
                <div>
                    <label htmlFor="password_confirmation" className="block text-sm font-bold text-slate-700 mb-2">
                        Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                        <input
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            type="password"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm text-slate-800"
                            autoComplete="new-password"
                            placeholder="Nhập lại mật khẩu mới"
                        />
                        <CheckCircle className="absolute right-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-2">
                    <PrimaryButton disabled={processing} className="flex items-center gap-2 px-6 py-3 rounded-xl">
                        {processing ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        Lưu mật khẩu
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Đã cập nhật thành công.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}