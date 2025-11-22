import { router } from '@inertiajs/react';

export default function Dashboard() {
    const logout = () => {
        router.post('/logout');
    };

    return (
        <div>
            <h1>Admin Dashboard</h1>
            <p>Trang dành cho Quản trị hệ thống.</p>

            {/* ✅ Nút đăng xuất */}
            <button 
                onClick={logout}
                style={{
                    marginTop: '20px',
                    padding: '10px 15px',
                    cursor: 'pointer',
                    backgroundColor: '#e53e3e',
                    color: '#fff',
                    borderRadius: '5px',
                    border: 'none'
                }}
            >
                Đăng xuất
            </button>
        </div>
    );
}
