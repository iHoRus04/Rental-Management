<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Hóa Đơn Thuê Phòng</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            color: #333;
            padding: 30px;
            font-size: 13px;
            line-height: 1.4;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
        }

        .header h1 {
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .header p {
            font-size: 12px;
            color: #666;
        }

        .section {
            margin-bottom: 20px;
        }

        .section-title {
            font-weight: bold;
            background-color: #f0f0f0;
            padding: 8px;
            margin-bottom: 10px;
            font-size: 12px;
        }

        .info-row {
            display: table;
            width: 100%;
            padding: 5px 0;
            border-bottom: 1px dotted #ccc;
        }

        .info-label {
            display: table-cell;
            font-weight: bold;
            width: 45%;
        }

        .info-value {
            display: table-cell;
            text-align: right;
            width: 55%;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        table th {
            background-color: #333;
            color: white;
            padding: 8px;
            text-align: left;
            font-weight: bold;
            font-size: 12px;
        }

        table td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
        }

        table tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        .amount {
            text-align: right;
        }

        .summary {
            margin-top: 20px;
            border-top: 2px solid #333;
            padding-top: 10px;
        }

        .summary-row {
            display: table;
            width: 100%;
            padding: 5px 0;
            font-size: 13px;
        }

        .summary-label {
            display: table-cell;
            width: 70%;
        }

        .summary-value {
            display: table-cell;
            text-align: right;
            width: 30%;
        }

        .summary-row.total {
            font-size: 14px;
            font-weight: bold;
            background-color: #f0f0f0;
            padding: 10px;
            margin-top: 10px;
        }

        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 11px;
            font-weight: bold;
        }

        .status-pending {
            background-color: #ffebee;
            color: #c62828;
        }

        .status-partial {
            background-color: #fff3e0;
            color: #e65100;
        }

        .status-paid {
            background-color: #e8f5e9;
            color: #2e7d32;
        }

        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 11px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>HÓA ĐƠN THUÊ PHÒNG</h1>
        <p>Tháng {{ $bill->month }} / Năm {{ $bill->year }}</p>
    </div>

    <!-- Thông tin hóa đơn -->
    <div class="section">
        <div class="section-title">THÔNG TIN HÓA ĐƠN</div>
        <div class="info-row">
            <span class="info-label">Phòng:</span>
            <span class="info-value">{{ $bill->room->name }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Kỳ thanh toán:</span>
            <span class="info-value">Tháng {{ $bill->month }}/{{ $bill->year }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Hạn chót:</span>
            <span class="info-value">{{ \Carbon\Carbon::parse($bill->due_date)->format('d/m/Y') }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Ngày lập:</span>
            <span class="info-value">{{ \Carbon\Carbon::now()->format('d/m/Y') }}</span>
        </div>
    </div>

    <!-- Thông tin người thuê -->
    <div class="section">
        <div class="section-title">THÔNG TIN NGƯỜI THUÊ</div>
        <div class="info-row">
            <span class="info-label">Tên:</span>
            <span class="info-value">{{ $bill->renter->name }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Số điện thoại:</span>
            <span class="info-value">{{ $bill->renter->phone }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Email:</span>
            <span class="info-value">{{ $bill->renter->email ?? 'N/A' }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Địa chỉ:</span>
            <span class="info-value">{{ $bill->renter->address ?? 'N/A' }}</span>
        </div>
    </div>

    <!-- Chi tiết chi phí -->
    <div class="section">
        <div class="section-title">CHI TIẾT CHI PHÍ</div>
        <table>
            <thead>
                <tr>
                    <th style="width: 50%;">Hạng mục</th>
                    <th style="width: 25%; text-align: center;">Số lượng</th>
                    <th style="width: 25%; text-align: right;">Thành tiền</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Tiền phòng</td>
                    <td style="text-align: center;">1 tháng</td>
                    <td class="amount">{{ number_format($bill->room_price, 0, ',', '.') }} ₫</td>
                </tr>
                
                @if($bill->electric_kwh > 0)
                <tr>
                    <td>Tiền điện ({{ $bill->electric_kwh }} kWh × {{ number_format($bill->electric_price, 0, ',', '.') }} ₫/kWh)</td>
                    <td style="text-align: center;">{{ $bill->electric_kwh }} kWh</td>
                    <td class="amount">{{ number_format($bill->electric_cost, 0, ',', '.') }} ₫</td>
                </tr>
                @endif
                
                @if($bill->water_usage > 0)
                <tr>
                    <td>Tiền nước ({{ $bill->water_usage }} m³ × {{ number_format($bill->water_price, 0, ',', '.') }} ₫/m³)</td>
                    <td style="text-align: center;">{{ $bill->water_usage }} m³</td>
                    <td class="amount">{{ number_format($bill->water_cost, 0, ',', '.') }} ₫</td>
                </tr>
                @endif
                
                @if($bill->internet_cost > 0)
                <tr>
                    <td>Tiền Internet</td>
                    <td style="text-align: center;">1 tháng</td>
                    <td class="amount">{{ number_format($bill->internet_cost, 0, ',', '.') }} ₫</td>
                </tr>
                @endif
                
                @if($bill->trash_cost > 0)
                <tr>
                    <td>Tiền rác</td>
                    <td style="text-align: center;">1 tháng</td>
                    <td class="amount">{{ number_format($bill->trash_cost, 0, ',', '.') }} ₫</td>
                </tr>
                @endif
                
                @if($bill->other_costs > 0)
                <tr>
                    <td>Chi phí khác</td>
                    <td style="text-align: center;">—</td>
                    <td class="amount">{{ number_format($bill->other_costs, 0, ',', '.') }} ₫</td>
                </tr>
                @endif
            </tbody>
        </table>
    </div>

    <!-- Tóm tắt thanh toán -->
    <div class="summary">
        <div class="summary-row">
            <span class="summary-label">Tổng tiền:</span>
            <span class="summary-value">{{ number_format($bill->amount, 0, ',', '.') }} ₫</span>
        </div>
        <div class="summary-row">
            <span class="summary-label">Đã thanh toán:</span>
            <span class="summary-value" style="color: #2e7d32;">{{ number_format($bill->paid_amount, 0, ',', '.') }} ₫</span>
        </div>
        <div class="summary-row">
            <span class="summary-label">Còn phải thanh toán:</span>
            <span class="summary-value" style="color: #c62828;">{{ number_format($bill->amount - $bill->paid_amount, 0, ',', '.') }} ₫</span>
        </div>
        <div class="summary-row total">
            <span class="summary-label">TỔNG CỘNG:</span>
            <span class="summary-value">{{ number_format($bill->amount, 0, ',', '.') }} ₫</span>
        </div>
    </div>

    <!-- Trạng thái thanh toán -->
    <div class="section" style="margin-top: 20px;">
        <strong>Trạng thái:</strong>
        @if($bill->status === 'pending')
            <span class="status-badge status-pending">Chưa thanh toán</span>
        @elseif($bill->status === 'partial')
            <span class="status-badge status-partial">Thanh toán một phần</span>
        @else
            <span class="status-badge status-paid">Đã thanh toán</span>
        @endif
        
        @if($bill->paid_date)
            <p style="margin-top: 8px; font-size: 12px;">
                <strong>Ngày thanh toán:</strong> {{ \Carbon\Carbon::parse($bill->paid_date)->format('d/m/Y') }}
            </p>
        @endif
    </div>

    <!-- Ghi chú -->
    @if($bill->notes)
    <div class="section" style="margin-top: 20px; padding: 10px; background-color: #f9f9f9; border-left: 3px solid #333;">
        <strong>Ghi chú:</strong>
        <p style="margin-top: 5px; font-size: 12px;">{{ $bill->notes }}</p>
    </div>
    @endif

    <div class="footer">
        <p>Cảm ơn bạn đã thanh toán. Đây là hóa đơn tự động được tạo từ hệ thống quản lý nhà trọ.</p>
        <p>Nếu có thắc mắc, vui lòng liên hệ với chủ trọ.</p>
    </div>
</body>
</html>
