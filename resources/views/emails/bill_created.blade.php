<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thông báo đóng tiền phòng - DreamHouse</title>
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
        .qr-section {
            text-align: center;
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 16px;
            padding: 24px;
            margin-top: 30px;
        }
        .qr-title {
            font-size: 15px;
            font-weight: 700;
            color: #065f46;
            margin-bottom: 15px;
        }
        .qr-image {
            width: 180px;
            height: 180px;
            background-color: #ffffff;
            border: 1px solid #d1fae5;
            border-radius: 12px;
            padding: 8px;
            display: inline-block;
        }
        .bank-details {
            margin-top: 15px;
            font-size: 13px;
            color: #047857;
            line-height: 1.6;
            text-align: left;
            border-top: 1px dashed #d1fae5;
            padding-top: 15px;
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
            <h1>Thông Báo Tiền Phòng</h1>
            <p>Hệ thống Quản lý nhà trọ DreamHouse</p>
        </div>

        <!-- CONTENT -->
        <div class="content">
            <div class="greeting">Kính gửi Anh/Chị {{ $bill->renterRequest->name }},</div>
            <p class="intro-text">
                Hóa đơn tiền phòng tháng <strong>{{ $bill->month }}/{{ $bill->year }}</strong> tại nhà trọ <strong>{{ $bill->room->house->name }}</strong> (Phòng: <strong>{{ $bill->room->name }}</strong>) đã được thiết lập. 
                Dưới đây là chi tiết các khoản phí cần thanh toán:
            </p>

            <!-- BILL DETAILS CARD -->
            <div class="info-card">
                <div class="info-title">Chi tiết phí sử dụng</div>
                
                <div class="info-row">
                    <span class="info-label">Tiền phòng cơ bản:</span>
                    <span class="info-value">{{ number_format($bill->room_price) }} đ</span>
                </div>
                
                @if($bill->electric_kwh && $bill->electric_kwh > 0)
                <div class="info-row">
                    <span class="info-label">Tiền điện ({{ $bill->electric_kwh }} kWh × {{ number_format($bill->electric_price) }} đ):</span>
                    <span class="info-value">{{ number_format($bill->electric_cost) }} đ</span>
                </div>
                @endif

                @if($bill->water_usage && $bill->water_usage > 0)
                <div class="info-row">
                    <span class="info-label">Tiền nước ({{ $bill->water_usage }} m³ × {{ number_format($bill->water_price) }} đ):</span>
                    <span class="info-value">{{ number_format($bill->water_cost) }} đ</span>
                </div>
                @endif

                @if($bill->internet_cost && $bill->internet_cost > 0)
                <div class="info-row">
                    <span class="info-label">Mạng / Internet:</span>
                    <span class="info-value">{{ number_format($bill->internet_cost) }} đ</span>
                </div>
                @endif

                @if($bill->trash_cost && $bill->trash_cost > 0)
                <div class="info-row">
                    <span class="info-label">Phí rác / Vệ sinh:</span>
                    <span class="info-value">{{ number_format($bill->trash_cost) }} đ</span>
                </div>
                @endif

                @if($bill->service_costs && $bill->service_costs > 0)
                <div class="info-row">
                    <span class="info-label">Phí dịch vụ kèm theo:</span>
                    <span class="info-value">{{ number_format($bill->service_costs) }} đ</span>
                </div>
                @endif

                @if($bill->other_costs && $bill->other_costs > 0)
                <div class="info-row">
                    <span class="info-label">Chi phí phát sinh khác:</span>
                    <span class="info-value">{{ number_format($bill->other_costs) }} đ</span>
                </div>
                @endif

                @if($bill->notes)
                <div class="info-row">
                    <span class="info-label">Ghi chú hóa đơn:</span>
                    <span class="info-value" style="font-weight: normal; font-style: italic; color: #64748b;">{{ $bill->notes }}</span>
                </div>
                @endif

                <div class="info-row" style="border-top: 2px solid #e2e8f0; margin-top: 10px; padding-top: 15px;">
                    <span class="info-label" style="font-size: 16px; color: #0f172a;">TỔNG THANH TOÁN:</span>
                    <span class="info-value highlight" style="font-size: 18px; font-weight: 900;">{{ number_format($bill->amount) }} đ</span>
                </div>

                <div class="info-row">
                    <span class="info-label" style="color: #ef4444;">Hạn chót thanh toán:</span>
                    <span class="info-value" style="color: #ef4444;">{{ $bill->due_date ? $bill->due_date->format('d/m/Y') : 'Không có' }}</span>
                </div>
            </div>

            <!-- PAYMENT QR CODE -->
            @php
                $house = $bill->room->house;
            @endphp
            @if($house && $house->bank_name && $house->account_no)
            <div class="qr-section">
                <div class="qr-title">Quét mã QR để chuyển khoản nhanh 24/7</div>
                
                @php
                    $bankCode = strtolower(str_replace(' ', '', $house->bank_name));
                    $accNo = $house->account_no;
                    $accName = urlencode($house->account_name);
                    $amount = $bill->amount;
                    $addInfo = urlencode('DH TT BILL ' . $bill->id);
                    $qrUrl = "https://img.vietqr.io/image/{$bankCode}-{$accNo}-compact2.png?amount={$amount}&addInfo={$addInfo}&accountName={$accName}";
                @endphp
                
                <img src="{{ $qrUrl }}" alt="Mã chuyển khoản VietQR" class="qr-image" />
                
                <div class="bank-details">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Ngân hàng:</span>
                        <strong>{{ strtoupper($house->bank_name) }}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Số tài khoản:</span>
                        <strong>{{ $house->account_no }}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Chủ tài khoản:</span>
                        <strong>{{ $house->account_name }}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px; color: #b45309;">
                        <span>Nội dung chuyển khoản chính xác:</span>
                        <strong>DH TT BILL {{ $bill->id }}</strong>
                    </div>
                </div>
            </div>
            @endif
        </div>

        <!-- FOOTER -->
        <div class="footer">
            <p>Thư này được gửi tự động từ hệ thống quản lý nhà trọ của chủ nhà {{ $bill->room->house->user->name }}.</p>
            <p>Nếu bạn có bất kỳ thắc mắc nào về số liệu, vui lòng bấm trả lời trực tiếp email này hoặc liên hệ qua SĐT: {{ $bill->room->house->user->phone }}.</p>
            <p>© {{ date('Y') }} DreamHouse. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
