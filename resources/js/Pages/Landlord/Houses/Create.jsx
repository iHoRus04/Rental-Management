import { useForm, Link } from "@inertiajs/react";

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        address: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("landlord.houses.store"));
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Thêm Nhà Trọ</h1>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="block">Tên nhà trọ</label>
                    <input
                        className="border p-2 w-full"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                    />
                    {errors.name && <p className="text-red-500">{errors.name}</p>}
                </div>

                <div>
                    <label className="block">Địa chỉ</label>
                    <input
                        className="border p-2 w-full"
                        value={data.address}
                        onChange={(e) => setData("address", e.target.value)}
                    />
                    {errors.address && <p className="text-red-500">{errors.address}</p>}
                </div>

                <div>
                    <label className="block">Mô tả</label>
                    <input
                        className="border p-2 w-full"
                        value={data.description}
                        onChange={(e) => setData("description", e.target.value)}
                    />
                    {errors.description && <p className="text-red-500">{errors.description}</p>}
                </div>

                <button disabled={processing} className="bg-blue-500 text-white px-4 py-2 rounded">
                    Lưu
                </button>

                <Link href={route("landlord.houses.index")} className="ml-2 text-gray-600">
                    Hủy
                </Link>
            </form>
        </div>
    );
}
