<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Biên lai xác nhận thanh toán - DreamHouse</title>
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
            text-align: right;
        }
        .highlight {
            color: #10b981;
        }
        .success-banner {
            text-align: center;
            background-color: #ecfdf5;
            border: 1px solid #a7f3d0;
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 30px;
            color: #065f46;
            font-weight: 700;
            font-size: 15px;
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
            <h1>Xác Nhận Thanh Toán</h1>
            <p>Hệ thống Quản lý nhà trọ DreamHouse</p>
        </div>

        <!-- CONTENT -->
        <div class="content">
            <div class="greeting">Chào Anh/Chị {{ $bill->renterRequest->name }},</div>
            
            <!-- SUCCESS BANNER -->
            <div class="success-banner">
                🎉 Giao dịch thanh toán tiền phòng đã hoàn thành!
            </div>

            <p class="intro-text">
                Chủ nhà <strong>{{ $bill->room->house->user->name }}</strong> vừa xác nhận đã nhận đủ tiền thanh toán hóa đơn tháng <strong>{{ $bill->month }}/{{ $bill->year }}</strong> của bạn. Dưới đây là thông tin biên lai điện tử:
            </p>

            <!-- RECEIPT DETAILS CARD -->
            <div class="info-card">
                <div class="info-title">Biên lai thanh toán</div>
                
                <div class="info-row">
                    <span class="info-label">Nhà trọ:</span>
                    <span class="info-value">{{ $bill->room->house->name }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Phòng:</span>
                    <span class="info-value">{{ $bill->room->name }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Hóa đơn kỳ:</span>
                    <span class="info-value">Tháng {{ $bill->month }}/{{ $bill->year }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Tổng cộng cần thanh toán:</span>
                    <span class="info-value">{{ number_format($bill->amount) }} đ</span>
                </div>
                <div class="info-row" style="border-top: 2px dashed #e2e8f0; margin-top: 10px; padding-top: 15px;">
                    <span class="info-label" style="font-size: 15px; color: #0f172a;">Số tiền đã thanh toán:</span>
                    <span class="info-value highlight" style="font-size: 16px; font-weight: 800;">{{ number_format($bill->paid_amount) }} đ</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Ngày ghi nhận:</span>
                    <span class="info-value">{{ $bill->paid_date ? $bill->paid_date->format('d/m/Y') : now()->format('d/m/Y') }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Trạng thái:</span>
                    <span class="info-value" style="color: #10b981; text-transform: uppercase;">Đã thanh toán</span>
                </div>
            </div>

            <p class="intro-text" style="font-size: 14px; text-align: center; color: #64748b;">
                Cảm ơn bạn đã thực hiện thanh toán đúng hạn!
            </p>
        </div>

        <!-- FOOTER -->
        <div class="footer">
            <p>Email này được tự động tạo và gửi dưới sự đồng ý của chủ trọ {{ $bill->room->house->user->name }}.</p>
            <p>© {{ date('Y') }} DreamHouse. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
