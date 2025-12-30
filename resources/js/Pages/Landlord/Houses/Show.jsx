import { Link } from '@inertiajs/react';

export default function Show({ house }) {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">{house.name}</h1>
            
            {house.image && (
                <div className="mb-4">
                    <img 
                        src={`/storage/${house.image}`} 
                        alt={house.name} 
                        className="w-64 h-64 object-cover rounded"
                    />
                </div>
            )}
            
            <p><strong>Địa chỉ:</strong> {house.address}</p>
            <p><strong>Mô tả:</strong> {house.description || 'Không có mô tả'}</p>
           
            <Link
                href={route('landlord.houses.index')}
                className="text-blue-500 underline block mt-4"
            >
                ← Quay lại danh sách
            </Link>
            
        </div>
    );
}