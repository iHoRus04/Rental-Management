import { useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

// Inline SVG icon components (avoid lucide-react dependency)
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

const Lock = (props) => (
    <Icon {...props}>
        <rect x="3" y="11" width="18" height="10" rx="2" strokeWidth="1.5" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 11V8a5 5 0 0110 0v3" />
    </Icon>
);

const CheckCircle = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4" />
        <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
    </Icon>
);

const ArrowRight = (props) => (
    <Icon {...props} viewBox="0 0 20 20">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 4l8 6-8 6V4z" />
    </Icon>
);

const UserPlus = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11a4 4 0 100-8 4 4 0 000 8z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 8v6M22 11h-6" />
    </Icon>
);

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <GuestLayout>
            <Head title="Đăng ký" />

            <div className="bg-white p-8 rounded-3xl shadow-xl border border-emerald-100 w-full max-w-md mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-teal-900">Tạo tài khoản mới</h2>
                    <p className="text-slate-500 mt-2">Tham gia cộng đồng DreamHouse ngay hôm nay</p>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    {/* Name Input */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-2">
                            Họ và tên
                        </label>
                        <div className="relative">
                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={data.name}
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm text-slate-800"
                                autoComplete="name"
                                placeholder="Nhập họ tên của bạn"
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                        </div>
                        {errors.name && (
                            <p className="mt-2 text-sm text-red-500 font-medium">{errors.name}</p>
                        )}
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
                                name="email"
                                value={data.email}
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm text-slate-800"
                                autoComplete="username"
                                placeholder="name@example.com"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                        </div>
                        {errors.email && (
                            <p className="mt-2 text-sm text-red-500 font-medium">{errors.email}</p>
                        )}
                    </div>

                    {/* Password Input */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-2">
                            Mật khẩu
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm text-slate-800"
                                autoComplete="new-password"
                                placeholder="Tạo mật khẩu (tối thiểu 8 ký tự)"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                        </div>
                        {errors.password && (
                            <p className="mt-2 text-sm text-red-500 font-medium">{errors.password}</p>
                        )}
                    </div>

                    {/* Confirm Password Input */}
                    <div>
                        <label htmlFor="password_confirmation" className="block text-sm font-bold text-slate-700 mb-2">
                            Xác nhận mật khẩu
                        </label>
                        <div className="relative">
                            <input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm text-slate-800"
                                autoComplete="new-password"
                                placeholder="Nhập lại mật khẩu"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                            />
                            <CheckCircle className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                        </div>
                        {errors.password_confirmation && (
                            <p className="mt-2 text-sm text-red-500 font-medium">{errors.password_confirmation}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                        {processing ? 'Đang xử lý...' : 'Đăng ký tài khoản'}
                        {!processing && <UserPlus className="w-5 h-5" />}
                    </button>

                    {/* Login Link */}
                    <div className="text-center mt-6 pt-4 border-t border-slate-100">
                        <p className="text-sm text-slate-500">
                            Đã có tài khoản?{' '}
                            <Link
                                href={route('login')}
                                className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline inline-flex items-center gap-1"
                            >
                                Đăng nhập ngay <ArrowRight className="w-3 h-3" />
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}