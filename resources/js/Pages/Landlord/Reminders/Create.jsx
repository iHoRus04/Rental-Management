import { Link, useForm, usePage } from '@inertiajs/react';

export default function Create() {
    const { contracts } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        contract_id: '',
        type: 'payment',
        reminder_date: '',
        message: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('landlord.reminders.store'));
    };

    const generateMessage = () => {
        const contract = contracts.find(c => c.id === parseInt(data.contract_id));
        if (!contract) return '';

        if (data.type === 'payment') {
            return `Nhắc nhở thanh toán tiền thuê phòng ${contract.room.name} - ${contract.room.house.name}. Số tiền: ${contract.monthly_rent.toLocaleString('vi-VN')} ₫`;
        } else {
            return `Hợp đồng thuê phòng ${contract.room.name} sắp hết hạn vào ngày ${new Date(contract.end_date).toLocaleDateString('vi-VN')}. Vui lòng liên hệ để gia hạn hoặc chấm dứt hợp đồng.`;
        }
    };

    const handleContractChange = (e) => {
        setData('contract_id', e.target.value);
        
        // Auto-generate message when contract is selected
        setTimeout(() => {
            const message = generateMessage();
            if (message) {
                setData('message', message);
            }
        }, 0);
    };

    const handleTypeChange = (e) => {
        setData('type', e.target.value);
        
        // Auto-generate message when type is changed
        if (data.contract_id) {
            setTimeout(() => {
                const message = generateMessage();
                if (message) {
                    setData('message', message);
                }
            }, 0);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <Link
                    href={route('landlord.reminders.index')}
                    className="text-blue-600 hover:underline"
                >
                    ← Quay lại danh sách nhắc nhở
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-6">Tạo nhắc nhở mới</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Contract Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hợp đồng <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={data.contract_id}
                            onChange={handleContractChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                            required
                        >
                            <option value="">-- Chọn hợp đồng --</option>
                            {contracts.map((contract) => (
                                <option key={contract.id} value={contract.id}>
                                    {contract.renter.name} - {contract.room.name} ({contract.room.house.name})
                                </option>
                            ))}
                        </select>
                        {errors.contract_id && (
                            <p className="text-red-500 text-sm mt-1">{errors.contract_id}</p>
                        )}
                    </div>

                    {/* Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Loại nhắc nhở <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={data.type}
                            onChange={handleTypeChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                            required
                        >
                            <option value="payment">Thanh toán</option>
                            <option value="contract_expiry">Hết hạn hợp đồng</option>
                        </select>
                        {errors.type && (
                            <p className="text-red-500 text-sm mt-1">{errors.type}</p>
                        )}
                    </div>

                    {/* Reminder Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ngày nhắc nhở <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={data.reminder_date}
                            onChange={(e) => setData('reminder_date', e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                            min={new Date().toISOString().split('T')[0]}
                            required
                        />
                        {errors.reminder_date && (
                            <p className="text-red-500 text-sm mt-1">{errors.reminder_date}</p>
                        )}
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nội dung nhắc nhở
                        </label>
                        <textarea
                            value={data.message}
                            onChange={(e) => setData('message', e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                            rows="4"
                            placeholder="Nhập nội dung nhắc nhở..."
                        />
                        {errors.message && (
                            <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3">
                        <Link
                            href={route('landlord.reminders.index')}
                            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                        >
                            Hủy
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {processing ? 'Đang tạo...' : 'Tạo nhắc nhở'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
