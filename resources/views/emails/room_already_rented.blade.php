<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thông báo trạng thái đăng ký thuê phòng - DreamHouse</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f4f6f8;
            margin: 0;
            padding: 0;
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
            background: linear-gradient(135deg, #0d9488 0%, #115e59 100%);
            padding: 35px 30px;
            text-align: center;
            color: #ffffff;
        }
        .header h1 {
            margin: 0;
            font-size: 22px;
            font-weight: 800;
        }
        .header p {
            margin: 8px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .content {
            padding: 35px 30px;
        }
        .greeting {
            font-size: 17px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 16px;
        }
        .intro-text {
            font-size: 15px;
            line-height: 1.6;
            color: #475569;
            margin-bottom: 24px;
        }
        .info-card {
            background-color: #f8fafc;
            border-radius: 16px;
            border: 1px solid #f1f5f9;
            padding: 20px;
            margin-bottom: 24px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
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
        .footer {
            background-color: #f8fafc;
            border-top: 1px solid #f1f5f9;
            padding: 25px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="header">
            <h1>Thông Báo Trạng Thái Đăng Ký Thuê Phòng</h1>
            <p>Hệ thống Quản lý nhà trọ DreamHouse</p>
        </div>

        <div class="content">
            <div class="greeting">Kính gửi {{ $renterRequest->name }},</div>
            
            <p class="intro-text">
                Cảm ơn bạn đã quan tâm và đăng ký thuê phòng tại <strong>{{ $room->house->name }}</strong>.
            </p>

            <div class="info-card">
                <div class="info-row">
                    <span class="info-label">Nhà trọ:</span>
                    <span class="info-value">{{ $room->house->name }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Phòng đăng ký:</span>
                    <span class="info-value">Phòng {{ $room->name }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Trạng thái phòng:</span>
                    <span class="info-value" style="color: #d97706;">Đã được hoàn tất hợp đồng thuê</span>
                </div>
            </div>

            <p class="intro-text">
                Hiện tại, phòng <strong>{{ $room->name }}</strong> đã hoàn tất ký hợp đồng với một khách thuê trước đó. 
                Thông tin đăng ký của bạn đã được hệ thống ghi nhận vào **Danh sách chờ ưu tiên**. Khi có phòng trống mới hoặc căn hộ tương tự, ban quản lý nhà trọ sẽ chủ động liên hệ với bạn đầu tiên!
            </p>
        </div>

        <div class="footer">
            <p>Trân trọng cảm ơn bạn!</p>
            <p>Ban quản lý {{ $room->house->name }} - Chủ trọ {{ $room->house->user->name }}</p>
            <p>© {{ date('Y') }} DreamHouse. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
