<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kích hoạt tài khoản - DreamHouse</title>
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
            text-align: center;
        }
        .info-title {
            font-size: 15px;
            font-weight: 600;
            color: #475569;
            margin-bottom: 12px;
        }
        .info-email {
            font-size: 18px;
            font-weight: 700;
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
            padding: 16px 36px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 15px;
            box-shadow: 0 5px 15px rgba(16, 185, 129, 0.3);
            transition: all 0.2s;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .notice-box {
            background-color: #fffbeb;
            border: 1px solid #fef3c7;
            border-radius: 12px;
            padding: 16px;
            margin-top: 30px;
            font-size: 13px;
            color: #b45309;
            line-height: 1.5;
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
            <h1>DreamHouse</h1>
            <p>THUÊ TRỌ ONLINE</p>
        </div>

        <!-- CONTENT -->
        <div class="content">
            <div class="greeting">Chào mừng {{ $notifiable->name }}!</div>
            
            <p class="intro-text">
                Cảm ơn bạn đã tin tưởng và lựa chọn nền tảng quản lý nhà trọ thông minh **DreamHouse**. 
                Để bắt đầu hành trình số hóa và sử dụng đầy đủ các tính năng tối ưu, vui lòng kích hoạt tài khoản của bạn bằng cách nhấp vào nút dưới đây.
            </p>

            <!-- EMAIL CARD -->
            <div class="info-card">
                <div class="info-title">Tài khoản đăng ký:</div>
                <div class="info-email">{{ $notifiable->email }}</div>
            </div>

            <!-- BUTTON -->
            <div class="cta-container">
                <a href="{{ $url }}" class="cta-button">Kích Hoạt Tài Khoản</a>
            </div>

            <div class="notice-box">
                <strong>Lưu ý bảo mật:</strong> Liên kết kích hoạt tài khoản này chỉ có giá trị hiệu lực trong vòng 60 phút. Nếu bạn không yêu cầu đăng ký tài khoản trên hệ thống của chúng tôi, bạn có thể an tâm bỏ qua email này.
            </div>
        </div>

        <!-- FOOTER -->
        <div class="footer">
            <p>Email này được gửi tự động để phục vụ quy trình xác thực bảo mật tài khoản.</p>
            <p>Vui lòng không phản hồi trực tiếp thư này.</p>
            <p>© {{ date('Y') }} DreamHouse. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
