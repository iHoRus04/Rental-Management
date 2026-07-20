<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cập nhật yêu cầu hỗ trợ - DreamHouse</title>
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
        .status-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            color: #ffffff;
            text-transform: uppercase;
        }
        .status-resolved {
            background-color: #10b981;
        }
        .status-processing {
            background-color: #3b82f6;
        }
        .status-pending {
            background-color: #f59e0b;
        }
        .status-rejected {
            background-color: #ef4444;
        }
        .response-box {
            background-color: #ecfdf5;
            border: 1px solid #a7f3d0;
            border-radius: 12px;
            padding: 16px;
            margin-top: 10px;
            font-size: 14px;
            color: #065f46;
            line-height: 1.5;
            white-space: pre-line;
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
            <h1>Cập Nhật Yêu Cầu Hỗ Trợ</h1>
            <p>Phân hệ Hỗ trợ Khách thuê DreamHouse</p>
        </div>

        <!-- CONTENT -->
        <div class="content">
            <div class="greeting">Chào Bạn,</div>
            <p class="intro-text">
                Yêu cầu báo cáo sự cố <strong>"{{ $tenantRequest->title }}"</strong> của bạn đã có cập nhật phản hồi mới từ chủ nhà <strong>{{ $tenantRequest->landlord->name }}</strong>. Dưới đây là thông tin tiến độ:
            </p>

            <!-- STATUS CARD -->
            <div class="info-card">
                <div class="info-title">Tiến độ xử lý</div>
                
                <div class="info-row">
                    <span class="info-label">Sự cố:</span>
                    <span class="info-value">{{ $tenantRequest->title }}</span>
                </div>
                
                <div class="info-row">
                    <span class="info-label">Trạng thái mới:</span>
                    <span class="info-value">
                        @if($tenantRequest->status === 'resolved')
                            <span class="status-badge status-resolved">Đã khắc phục</span>
                        @elseif($tenantRequest->status === 'processing')
                            <span class="status-badge status-processing">Đang sửa chữa</span>
                        @elseif($tenantRequest->status === 'rejected')
                            <span class="status-badge status-rejected">Không phê duyệt</span>
                        @else
                            <span class="status-badge status-pending">Chờ xử lý</span>
                        @endif
                    </span>
                </div>

                <div class="info-row">
                    <span class="info-label">Thời gian phản hồi:</span>
                    <span class="info-value">{{ $tenantRequest->responded_at ? $tenantRequest->responded_at->format('d/m/Y H:i') : now()->format('d/m/Y H:i') }}</span>
                </div>

                @if($tenantRequest->landlord_response)
                <div style="margin-top: 15px;">
                    <span class="info-label" style="font-size: 13px; display: block; margin-bottom: 5px; color: #047857;">Lời nhắn phản hồi từ chủ nhà:</span>
                    <div class="response-box">
                        {{ $tenantRequest->landlord_response }}
                    </div>
                </div>
                @endif
            </div>

            <p class="intro-text" style="font-size: 14px; color: #64748b; text-align: center;">
                Bạn có thể đăng nhập vào ứng dụng để xem chi tiết hoặc phản hồi lại nếu sự cố vẫn chưa được giải quyết dứt điểm.
            </p>
        </div>

        <!-- FOOTER -->
        <div class="footer">
            <p>Email này được gửi tự động để cập nhật trạng thái hỗ trợ kỹ thuật.</p>
            <p>© {{ date('Y') }} DreamHouse. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
