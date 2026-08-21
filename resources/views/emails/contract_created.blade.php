<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thông báo thiết lập hợp đồng thuê phòng</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f4f6f8;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
            color: #333333;
        }
        .email-wrapper {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
            border: 1px solid #edf2f7;
        }
        .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 40px 30px;
            text-align: center;
            color: #ffffff;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.5px;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 15px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 20px;
        }
        .intro-text {
            font-size: 15px;
            line-height: 1.6;
            color: #475569;
            margin-bottom: 30px;
        }
        .info-card {
            background-color: #f8fafc;
            border-radius: 16px;
            border: 1px solid #f1f5f9;
            padding: 24px;
            margin-bottom: 30px;
        }
        .info-title {
            font-size: 16px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 16px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 8px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px dashed #e2e8f0;
            font-size: 14px;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            color: #64748b;
            font-weight: 600;
        }
        .info-value {
            color: #0f172a;
            font-weight: 700;
        }
        .highlight {
            color: #10b981;
        }
        .cta-container {
            text-align: center;
            margin: 35px 0;
        }
        .cta-button {
            display: inline-block;
            background-color: #10b981;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 15px;
            box-shadow: 0 5px 15px rgba(16, 185, 129, 0.3);
            transition: all 0.2s;
        }
        .footer {
            background-color: #f8fafc;
            border-top: 1px solid #f1f5f9;
            padding: 30px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
        }
        .footer p {
            margin: 5px 0;
            line-height: 1.5;
        }
        .footer a {
            color: #10b981;
            text-decoration: none;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <!-- HEADER -->
        <div class="header">
            <h1>Hợp Đồng Thuê Phòng Đã Thiết Lập</h1>
            <p>Hệ thống Quản lý nhà trọ xin trân trọng thông báo</p>
        </div>

        <!-- CONTENT -->
        <div class="content">
            <div class="greeting">Kính gửi Anh/Chị {{ $contract->renterRequest->name }},</div>
            <p class="intro-text">
                Hợp đồng thuê phòng của Anh/Chị tại nhà trọ <strong>{{ $contract->room->house->name }}</strong> đã được khởi tạo thành công trên hệ thống. 
                Dưới đây là thông tin tóm tắt hợp đồng. Chi tiết bản hợp đồng chính thức đã được đính kèm ở định dạng PDF bên dưới email này.
            </p>

            <!-- INFO CARD -->
            <div class="info-card">
                <div class="info-title">Thông tin thuê phòng</div>
                
                <div class="info-row">
                    <span class="info-label">Nhà trọ:</span>
                    <span class="info-value">{{ $contract->room->house->name }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Phòng:</span>
                    <span class="info-value highlight">{{ $contract->room->name }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Địa chỉ:</span>
                    <span class="info-value">{{ $contract->room->house->address }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Giá thuê phòng:</span>
                    <span class="info-value highlight">{{ number_format($contract->monthly_rent) }} đ / tháng</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Tiền đặt cọc:</span>
                    <span class="info-value">{{ number_format($contract->deposit) }} đ</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Thời hạn hợp đồng:</span>
                    <span class="info-value">
                        {{ date('d/m/Y', strtotime($contract->start_date)) }} đến {{ date('d/m/Y', strtotime($contract->end_date)) }}
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Ngày thanh toán hàng tháng:</span>
                    <span class="info-value">Ngày {{ $contract->payment_date }} hàng tháng</span>
                </div>
            </div>

            @if(!empty($accountEmail))
            <!-- TENANT LOGIN CREDENTIALS CARD -->
            <div class="info-card" style="background-color: #eff6ff; border-color: #bfdbfe; margin-bottom: 30px;">
                <div class="info-title" style="color: #1e40af; border-bottom-color: #93c5fd; font-size: 16px; font-weight: 700; padding-bottom: 8px; margin-bottom: 16px; border-bottom: 2px solid;">
                    🔑 Thông Tin Tài Khoản Đăng Nhập Ứng Dụng Khách Thuê
                </div>
                
                <div class="info-row" style="border-bottom: 1px dashed #bfdbfe; display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px;">
                    <span class="info-label" style="color: #1e3a8a; font-weight: 600;">Tên đăng nhập (Email):</span>
                    <span class="info-value" style="color: #1e40af; font-weight: 700;">{{ $accountEmail }}</span>
                </div>
                
                @if(!empty($accountPassword))
                <div class="info-row" style="border-bottom: none; display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px;">
                    <span class="info-label" style="color: #1e3a8a; font-weight: 600;">Mật khẩu đăng nhập:</span>
                    <span class="info-value" style="color: #1d4ed8; font-weight: 700; font-family: monospace; font-size: 15px;">{{ $accountPassword }}</span>
                </div>
                @endif
                
                <p style="font-size: 12px; color: #3b82f6; margin-top: 12px; margin-bottom: 0; line-height: 1.5;">
                    💡 <em>Quý khách có thể dùng thông tin trên để đăng nhập ứng dụng Khách thuê, theo dõi hóa đơn, chỉ số điện nước và gửi yêu cầu sửa chữa. Vui lòng đổi mật khẩu sau lần đăng nhập đầu tiên.</em>
                </p>
            </div>
            @endif

            <!-- LANDLORD CONTACT INFO -->
            <div class="info-card" style="background-color: #f0fdf4; border-color: #bbf7d0; margin-bottom: 30px;">
                <div class="info-title" style="color: #065f46; border-bottom-color: #d1fae5; font-size: 16px; font-weight: 700; padding-bottom: 8px; margin-bottom: 16px; border-bottom: 2px solid;">Thông tin liên hệ chủ nhà</div>
                
                <div class="info-row" style="border-bottom: 1px dashed #d1fae5; display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px;">
                    <span class="info-label" style="color: #047857; font-weight: 600;">Chủ nhà:</span>
                    <span class="info-value" style="color: #065f46; font-weight: 700;">{{ $contract->room->house->user->name }}</span>
                </div>
                
                @if($contract->room->house->user->phone)
                <div class="info-row" style="border-bottom: 1px dashed #d1fae5; display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px;">
                    <span class="info-label" style="color: #047857; font-weight: 600;">Số điện thoại:</span>
                    <span class="info-value" style="color: #065f46; font-weight: 700;">{{ $contract->room->house->user->phone }}</span>
                </div>
                @endif
                
                <div class="info-row" style="border-bottom: none; display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px;">
                    <span class="info-label" style="color: #047857; font-weight: 600;">Email liên hệ:</span>
                    <span class="info-value" style="color: #065f46; font-weight: 700;">{{ $contract->room->house->user->email }}</span>
                </div>
            </div>

            <p class="intro-text" style="font-size: 14px; color: #64748b;">
                * Quý khách vui lòng kiểm tra file PDF đính kèm để xem bản hợp đồng đầy đủ chữ ký và các điều khoản thỏa thuận. 
                Nếu phát hiện bất kỳ thông tin nào chưa chính xác, xin vui lòng liên hệ ngay với chủ nhà.
            </p>

            <div class="cta-container">
                <a href="{{ route('home') }}" class="cta-button">Đăng Nhập Hệ Thống</a>
            </div>
        </div>

        <!-- FOOTER -->
        <div class="footer">
            <p>Email này được gửi tự động từ hệ thống Quản lý nhà trọ thông minh.</p>
            <p>Vui lòng không trả lời trực tiếp email này.</p>
            <p>© {{ date('Y') }} Hệ thống Quản lý nhà trọ. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
