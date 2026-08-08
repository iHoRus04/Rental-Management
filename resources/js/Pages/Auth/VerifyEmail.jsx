import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Xác thực Email" />

            <div className="mb-4 text-sm text-gray-600">
                Cảm ơn bạn đã đăng ký tài khoản! Trước khi bắt đầu, vui lòng xác thực địa chỉ email của bạn bằng cách nhấp vào liên kết chúng tôi vừa gửi. Nếu bạn không nhận được email, chúng tôi rất sẵn lòng gửi lại một liên kết khác.
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    Một liên kết xác thực mới đã được gửi tới địa chỉ email bạn cung cấp khi đăng ký.
                </div>
            )}

            <form onSubmit={submit}>
                <div className="mt-4 flex items-center justify-between">
                    <PrimaryButton disabled={processing}>
                        Gửi lại email xác thực
                    </PrimaryButton>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Đăng xuất
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
