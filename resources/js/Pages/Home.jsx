import { Link } from '@inertiajs/react';

export default function Home() {
    return (
        <div className="text-center mt-10">
            <h1 className="text-4xl font-bold">Quản Lý Nhà Trọ</h1>
            <p className="mt-4">
                Nền tảng hỗ trợ chủ trọ quản lý phòng – hóa đơn – người thuê.
            </p>

            <div className="mt-6 flex justify-center gap-4">
                <Link
                    href="/login"
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                    Đăng nhập
                </Link>
                <Link
                    href="/register"
                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded"
                >
                    Đăng ký
                </Link>
            </div>
        </div>
    );
}
