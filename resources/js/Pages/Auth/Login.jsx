import { useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
// Inline SVG icon components to avoid adding lucide-react dependency
const Icon = ({ children, className = '', viewBox = '0 0 24 24' }) => (
    <svg className={className} viewBox={viewBox} fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">{children}</svg>
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

const LogIn = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 17l5-5-5-5v10z" />
    </Icon>
);

const ArrowRight = (props) => (
    <Icon {...props} viewBox="0 0 20 20">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 4l8 6-8 6V4z" />
    </Icon>
);

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title="Đăng nhập" />

            <div className=" p-8 rounded-3xl shadow-xl border border-emerald-100 w-full max-w-md mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-teal-900">Chào mừng trở lại!</h2>
                    <p className="text-slate-500 mt-2">Vui lòng đăng nhập để tiếp tục</p>
                </div>

                {status && (
                    <div className="mb-4 text-sm font-medium text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100 text-center">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
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
                            />
                            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                        </div>
                        {errors.email && (
                            <p className="mt-2 text-sm text-red-500 font-medium">{errors.email}</p>
                        )}
                    </div>

                    {/* Password Input */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="password" className="block text-sm font-bold text-slate-700">
                                Mật khẩu
                            </label>
                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                                >
                                    Quên mật khẩu?
                                </Link>
                            )}
                        </div>
                        <div className="relative">
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm text-slate-800"
                                autoComplete="current-password"
                                placeholder="••••••••"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                        </div>
                        {errors.password && (
                            <p className="mt-2 text-sm text-red-500 font-medium">{errors.password}</p>
                        )}
                    </div>

                    {/* Remember Me */}
                    <div className="block">
                        <label className="flex items-center cursor-pointer group">
                            <div className="relative flex items-center">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                />
                            </div>
                            <span className="ms-2 text-sm text-slate-600 group-hover:text-emerald-700 transition-colors">
                                Ghi nhớ đăng nhập
                            </span>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {processing ? 'Đang xử lý...' : 'Đăng nhập'}
                        {!processing && <LogIn className="w-5 h-5" />}
                    </button>

                    {/* Register Link */}
                    <div className="text-center mt-6 pt-4 border-t border-slate-100">
                        <p className="text-sm text-slate-500">
                            Chưa có tài khoản?{' '}
                            <Link
                                href={route('register')}
                                className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline inline-flex items-center gap-1"
                            >
                                Đăng ký ngay <ArrowRight className="w-3 h-3" />
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}