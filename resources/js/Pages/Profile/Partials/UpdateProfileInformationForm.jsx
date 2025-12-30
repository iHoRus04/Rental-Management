import { Link, useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';

// Minimal inline SVG icon components to avoid adding a new dependency
const Icon = ({ children, className = '', viewBox = '0 0 24 24' }) => (
    <svg className={className} viewBox={viewBox} fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">{children}</svg>
);

const User = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11a4 4 0 100-8 4 4 0 000 8z" />
    </Icon>
);

const Mail = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l9 6 9-6" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 8v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8" />
    </Icon>
);

const Save = (props) => (
    <Icon {...props} viewBox="0 0 24 24">
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

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={`bg-white p-8 rounded-2xl shadow-sm border border-emerald-100 ${className}`}>
            <header className="mb-8">
                <h2 className="text-xl font-bold text-teal-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-500" />
                    Thông tin hồ sơ
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                    Cập nhật thông tin tài khoản và địa chỉ email của bạn.
                </p>
            </header>

            <form onSubmit={submit} className="space-y-6">
                {/* Name Input */}
                <div>
                    <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-2">
                        Họ và tên
                    </label>
                    <div className="relative">
                        <input
                            id="name"
                            type="text"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm text-slate-800"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoComplete="name"
                            placeholder="Nhập tên hiển thị"
                        />
                        <User className="absolute right-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                    <InputError message={errors.name} className="mt-2" />
                </div>

                {/* Email Input */}
                <div>
                    <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">
                        Email
                    </label>
                    <div className="relative">
                        <input
                            id="email"
                            type="email"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm text-slate-800"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                            placeholder="name@example.com"
                        />
                        <Mail className="absolute right-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                    <InputError message={errors.email} className="mt-2" />
                </div>

                {/* Email Verification Section */}
                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <p className="text-sm text-amber-800">
                            Địa chỉ email của bạn chưa được xác minh.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="ml-1 underline font-bold hover:text-amber-900 focus:outline-none"
                            >
                                Nhấn vào đây để gửi lại email xác minh.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-3 text-sm font-medium text-emerald-600 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Một liên kết xác minh mới đã được gửi đến email của bạn.
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 pt-2">
                    <PrimaryButton disabled={processing} className="flex items-center gap-2 px-6 py-3 rounded-xl">
                        {processing ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        Lưu thay đổi
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Đã lưu thành công.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}