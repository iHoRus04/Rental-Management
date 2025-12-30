import { Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

// Inline Home icon to avoid adding lucide-react dependency
const Home = ({ className = '' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 11.5L12 4l9 7.5" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 21V10.5h14V21" />
    </svg>
);

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center pt-6 sm:pt-0 bg-slate-50 relative overflow-hidden">
            
            {/* Background Decoration (Gradient nhẹ nhàng) */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-200/20 rounded-full blur-3xl"></div>
            </div>

            {/* Logo Section */}
            <div className="w-full sm:max-w-md mt-6 px-6 z-10 flex flex-col items-center mb-6">
                <a href="http://127.0.0.1:5174/" className="flex items-center gap-2 group transition-transform hover:scale-105">
                    <div className="p-3 bg-white rounded-2xl shadow-lg shadow-emerald-500/10 border border-emerald-100">
                       <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-extrabold text-teal-900 tracking-tight leading-none">
                            DreamHouse
                        </span>
                        <span className="text-[10px] font-bold text-emerald-500 tracking-[0.2em] uppercase mt-0.5">
                            Thuê trọ Online
                        </span>
                    </div>
                </a>
            </div>

            {/* Content Container */}
            {/* Lưu ý: Đã bỏ bg-white và shadow ở đây vì các trang con (Login/Register) đã tự có card riêng */}
            <div className="w-full sm:max-w-md px-6 z-10">
                {children}
            </div>

            {/* Footer Copyright (Optional) */}
            <div className="mt-8 text-center text-slate-400 text-xs z-10">
                &copy; {new Date().getFullYear()} DreamHouse. All rights reserved.
            </div>
        </div>
    );
}