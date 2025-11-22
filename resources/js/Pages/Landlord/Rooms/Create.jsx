import { useForm, Link, usePage } from "@inertiajs/react";

export default function Create() {
    const { house } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        name: "",
        price: "",
        status: "available",
        floor: "",
        area: "",
        description: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("landlord.houses.rooms.store", house.id));
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">
                🏠 Thêm phòng cho {house.name}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block font-medium">Tên phòng</label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        className="w-full border rounded p-2"
                    />
                    {errors.name && (
                        <p className="text-red-500 text-sm">{errors.name}</p>
                    )}
                </div>

                <div>
                    <label className="block font-medium">Giá phòng</label>
                    <input
                        type="number"
                        value={data.price}
                        onChange={(e) => setData("price", e.target.value)}
                        className="w-full border rounded p-2"
                    />
                    {errors.price && (
                        <p className="text-red-500 text-sm">{errors.price}</p>
                    )}
                </div>

                <div>
                    <label className="block font-medium">Trạng thái</label>
                    <select
                        value={data.status}
                        onChange={(e) => setData("status", e.target.value)}
                        className="w-full border rounded p-2"
                    >
                        <option value="available">Còn trống</option>
                        <option value="occupied">Đang thuê</option>
                        <option value="maintenance">Bảo trì</option>
                    </select>
                    {errors.status && (
                        <p className="text-red-500 text-sm">{errors.status}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block font-medium">Tầng</label>
                        <input
                            type="number"
                            value={data.floor}
                            onChange={(e) => setData("floor", e.target.value)}
                            className="w-full border rounded p-2"
                        />
                        {errors.floor && (
                            <p className="text-red-500 text-sm">{errors.floor}</p>
                        )}
                    </div>

                    <div>
                        <label className="block font-medium">Diện tích (m²)</label>
                        <input
                            type="number"
                            value={data.area}
                            onChange={(e) => setData("area", e.target.value)}
                            className="w-full border rounded p-2"
                        />
                        {errors.area && (
                            <p className="text-red-500 text-sm">{errors.area}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block font-medium">Mô tả</label>
                    <textarea
                        value={data.description}
                        onChange={(e) => setData("description", e.target.value)}
                        className="w-full border rounded p-2"
                        rows="3"
                    ></textarea>
                    {errors.description && (
                        <p className="text-red-500 text-sm">{errors.description}</p>
                    )}
                </div>

                <div className="flex justify-between items-center mt-6">
                    <Link
                        href={route("landlord.houses.rooms.index", house.id)}
                        className="text-gray-600 hover:underline"
                    >
                        ← Quay lại danh sách phòng
                    </Link>

                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Lưu phòng
                    </button>
                </div>
            </form>
        </div>
    );
}
