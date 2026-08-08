<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Yêu cầu hỗ trợ mới - DreamHouse</title>
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
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
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
        .priority-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            color: #ffffff;
            text-transform: uppercase;
        }
        .priority-high {
            background-color: #ef4444;
        }
        .priority-medium {
            background-color: #f59e0b;
        }
        .priority-low {
            background-color: #10b981;
        }
        .desc-box {
            background-color: #f1f5f9;
            border-radius: 12px;
            padding: 16px;
            margin-top: 10px;
            font-size: 14px;
            color: #334155;
            line-height: 1.5;
            white-space: pre-line;
        }
        .cta-container {
            text-align: center;
            margin: 35px 0;
        }
        .cta-button {
            display: inline-block;
            background-color: #3b82f6;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 15px;
            box-shadow: 0 5px 15px rgba(59, 130, 246, 0.3);
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
            <h1>Báo Cáo Sự Cố Mới</h1>
            <p>Phân hệ Hỗ trợ Khách thuê DreamHouse</p>
        </div>

        <!-- CONTENT -->
        <div class="content">
            <div class="greeting">Kính gửi Anh/Chị {{ $tenantRequest->landlord->name }},</div>
            <p class="intro-text">
                Khách thuê <strong>{{ $tenantRequest->tenant->name }}</strong> tại phòng <strong>{{ $tenantRequest->room->name ?? 'N/A' }}</strong> (Nhà trọ: <strong>{{ $tenantRequest->room->house->name ?? 'N/A' }}</strong>) vừa gửi một báo cáo sự cố mới lên hệ thống.
            </p>

            <!-- REQUEST DETAILS CARD -->
            <div class="info-card">
                <div class="info-title">Thông tin yêu cầu sửa chữa</div>
                
                <div class="info-row">
                    <span class="info-label">Tiêu đề:</span>
                    <span class="info-value">{{ $tenantRequest->title }}</span>
                </div>
                
                <div class="info-row">
                    <span class="info-label">Phân loại:</span>
                    <span class="info-value">
                        @if($tenantRequest->type === 'repair')
                            Sửa chữa cơ sở vật chất
                        @elseif($tenantRequest->type === 'billing')
                            Thắc mắc hóa đơn
                        @else
                            Khác
                        @endif
                    </span>
                </div>

                <div class="info-row">
                    <span class="info-label">Mức độ ưu tiên:</span>
                    <span class="info-value">
                        @if($tenantRequest->priority === 'high')
                            <span class="priority-badge priority-high">Khẩn cấp</span>
                        @elseif($tenantRequest->priority === 'medium')
                            <span class="priority-badge priority-medium">Trung bình</span>
                        @else
                            <span class="priority-badge priority-low">Thấp</span>
                        @endif
                    </span>
                </div>

                <div class="info-row">
                    <span class="info-label">Thời gian gửi:</span>
                    <span class="info-value">{{ $tenantRequest->created_at ? $tenantRequest->created_at->format('d/m/Y H:i') : now()->format('d/m/Y H:i') }}</span>
                </div>

                <div style="margin-top: 15px;">
                    <span class="info-label" style="font-size: 13px; display: block; margin-bottom: 5px;">Mô tả nội dung sự cố:</span>
                    <div class="desc-box">
                        {{ $tenantRequest->description }}
                    </div>
                </div>
            </div>

            <div class="cta-container">
                <a href="{{ route('home') }}" class="cta-button">Xem Trên Trang Quản Trị</a>
            </div>
        </div>

        <!-- FOOTER -->
        <div class="footer">
            <p>Email này được tự động gửi bởi hệ thống DreamHouse để thông báo sự cố kịp thời.</p>
            <p>© {{ date('Y') }} DreamHouse. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
