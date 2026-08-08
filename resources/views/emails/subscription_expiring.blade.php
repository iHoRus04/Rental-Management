<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cảnh báo hết hạn gói dịch vụ - DreamHouse</title>
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
            background: linear-gradient(135deg, #f59e0b 0%, #e11d48 100%);
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
            text-align: right;
        }
        .warning-box {
            background-color: #fff1f2;
            border: 1px solid #fecdd3;
            border-radius: 12px;
            padding: 16px;
            margin-top: 15px;
            font-size: 13px;
            color: #9f1239;
            line-height: 1.5;
        }
        .cta-container {
            text-align: center;
            margin: 35px 0;
        }
        .cta-button {
            display: inline-block;
            background-color: #e11d48;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 15px;
            box-shadow: 0 5px 15px rgba(225, 29, 72, 0.3);
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
    </style>
</head>
<body>
    <div class="email-wrapper">
        <!-- HEADER -->
        <div class="header">
            <h1>Cảnh Báo Hết Hạn Gói Cước</h1>
            <p>Phân hệ Thanh toán DreamHouse Billing</p>
        </div>

        <!-- CONTENT -->
        <div class="content">
            <div class="greeting">Kính gửi Anh/Chị {{ $subscription->user->name }},</div>
            <p class="intro-text">
                Chúng tôi muốn thông báo rằng gói dịch vụ bản quyền phần mềm quản lý nhà trọ hiện tại của bạn sắp hết hiệu lực. 
                Vui lòng xem thông tin chi tiết bên dưới:
            </p>

            <!-- SUBSCRIPTION CARD -->
            <div class="info-card">
                <div class="info-title">Thông tin gói cước sắp hết hạn</div>
                
                <div class="info-row">
                    <span class="info-label">Gói dịch vụ đang dùng:</span>
                    <span class="info-value">{{ $subscription->package->name ?? 'N/A' }}</span>
                </div>
                
                <div class="info-row">
                    <span class="info-label">Ngày hết hiệu lực:</span>
                    <span class="info-value">{{ $subscription->end_date ? $subscription->end_date->format('d/m/Y') : 'N/A' }}</span>
                </div>

                <div class="info-row" style="border-top: 2px dashed #e2e8f0; margin-top: 10px; padding-top: 15px;">
                    <span class="info-label" style="font-size: 15px; color: #e11d48;">Số ngày sử dụng còn lại:</span>
                    <span class="info-value" style="font-size: 16px; font-weight: 900; color: #e11d48;">{{ $daysLeft }} ngày</span>
                </div>

                <!-- WARNING BOX -->
                <div class="warning-box">
                    <strong>⚠️ Lưu ý quan trọng về chính sách sử dụng:</strong><br>
                    Sau ngày hết hiệu lực, hệ thống sẽ tự động hạ cấp tài khoản của bạn về **Gói Cơ bản mặc định (Tối đa 5 phòng)**. 
                    *   Dữ liệu các nhà trọ và phòng trọ hiện tại của bạn sẽ **không bị xóa đi**.
                    *   Tuy nhiên, các tính năng quản lý, tạo mới hóa đơn, hợp đồng hoặc tạo phòng trọ mới sẽ **bị tạm khóa** cho đến khi bạn tiến hành gia hạn hoặc nâng cấp gói cước thành công.
                </div>
            </div>

            <div class="cta-container">
                <a href="{{ route('home') }}" class="cta-button">Gia Hạn Gói Cước Ngay</a>
            </div>
        </div>

        <!-- FOOTER -->
        <div class="footer">
            <p>Email này được gửi tự động định kỳ từ hệ thống DreamHouse.</p>
            <p>Vui lòng không trả lời trực tiếp email này.</p>
            <p>© {{ date('Y') }} DreamHouse. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
