<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <title>Hợp Đồng Thuê Phòng - {{ str_pad($contract->id, 4, '0', STR_PAD_LEFT) }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 12px;
            color: #000;
            line-height: 1.7;
            padding: 48px 56px;
        }

        /* ── QUỐC HIỆU ── */
        .republic {
            text-align: center;
            margin-bottom: 24px;
        }
        .republic .country {
            font-size: 13px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .republic .motto {
            font-size: 12px;
            font-style: italic;
        }
        .republic .underline {
            display: inline-block;
            border-bottom: 1px solid #000;
            padding-bottom: 1px;
        }

        /* ── TIÊU ĐỀ ── */
        .doc-header {
            text-align: center;
            margin-bottom: 28px;
        }
        .doc-header h1 {
            font-size: 18px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 4px;
        }
        .doc-header .doc-meta {
            font-size: 11px;
            color: #444;
        }

        /* ── DIVIDER ── */
        .divider {
            border: none;
            border-top: 1px solid #000;
            margin: 18px 0;
        }
        .divider-thin {
            border: none;
            border-top: 1px solid #bbb;
            margin: 12px 0;
        }

        /* ── ĐIỀU KHOẢN ── */
        .article-title {
            font-weight: bold;
            font-size: 12px;
            text-transform: uppercase;
            margin: 20px 0 8px 0;
            border-bottom: 1px solid #000;
            padding-bottom: 3px;
            word-spacing: normal;
            letter-spacing: normal;
        }

        /* ── BẢNG THÔNG TIN ── */
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
        }
        .info-table td {
            padding: 4px 6px;
            vertical-align: top;
        }
        .info-table .label {
            font-weight: bold;
            width: 38%;
            white-space: nowrap;
        }
        .info-table .colon {
            width: 4%;
            text-align: center;
        }
        .info-table .value {
            width: 58%;
        }

        /* ── HAI CỘT BÊN A / BÊN B ── */
        .parties {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
        }
        .parties td {
            width: 50%;
            vertical-align: top;
            padding: 0 8px;
        }
        .parties td:first-child {
            padding-left: 0;
            border-right: 1px solid #ccc;
            padding-right: 16px;
        }
        .parties td:last-child {
            padding-left: 16px;
        }
        .party-header {
            font-weight: bold;
            font-size: 12px;
            text-transform: uppercase;
            border-bottom: 1px solid #000;
            padding-bottom: 4px;
            margin-bottom: 8px;
        }

        /* ── BẢNG TÀI CHÍNH ── */
        .fin-table {
            width: 100%;
            border-collapse: collapse;
            margin: 8px 0;
        }
        .fin-table th {
            border: 1px solid #000;
            padding: 6px 8px;
            font-weight: bold;
            font-size: 11px;
            text-align: left;
            background: #f2f2f2;
        }
        .fin-table td {
            border: 1px solid #000;
            padding: 6px 8px;
            font-size: 11px;
        }
        .fin-table .right {
            text-align: right;
        }
        .fin-table .bold {
            font-weight: bold;
        }

        /* ── ĐIỀU KHOẢN CHI TIẾT ── */
        .clause {
            margin-bottom: 6px;
            text-align: left;
            word-spacing: normal;
            letter-spacing: normal;
        }
        .clause .num {
            font-weight: bold;
        }

        /* ── KÝ TÊN ── */
        .signature {
            margin-top: 36px;
            width: 100%;
            border-collapse: collapse;
        }
        .signature td {
            width: 50%;
            text-align: center;
            vertical-align: top;
            padding: 0 20px;
        }
        .signature .sig-title {
            font-weight: bold;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 3px;
        }
        .signature .sig-note {
            font-size: 10px;
            font-style: italic;
            color: #555;
            margin-bottom: 56px;
        }
        .signature .sig-name {
            border-top: 1px solid #000;
            padding-top: 4px;
            font-size: 11px;
        }

        /* ── FOOTER ── */
        .footer {
            margin-top: 28px;
            border-top: 1px solid #bbb;
            padding-top: 10px;
            text-align: center;
            font-size: 9px;
            color: #888;
        }

        /* ── INLINE BOLD ── */
        strong { font-weight: bold; }
    </style>
</head>
<body>

    {{-- ── QUỐC HIỆU ── --}}
    <div class="republic">
        <div class="country">Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam</div>
        <div class="motto"><span class="underline">Độc lập – Tự do – Hạnh phúc</span></div>
    </div>

    {{-- ── TIÊU ĐỀ ── --}}
    <div class="doc-header">
        <h1>Hợp Đồng Thuê Phòng</h1>
        <div class="doc-meta">
            Số: HĐ-{{ str_pad($contract->id, 4, '0', STR_PAD_LEFT) }}
            &nbsp;&nbsp;|&nbsp;&nbsp;
            Ngày lập: {{ \Carbon\Carbon::now()->format('d/m/Y') }}
        </div>
    </div>

    <hr class="divider">


    {{-- ── ĐIỀU 1: HAI BÊN ── --}}
    <div class="article-title">Điều 1. Thông tin các bên</div>

    <table class="parties">
        <tr>
            <td>
                <div class="party-header">Bên cho thuê (Bên A)</div>
                <table class="info-table">
                    <tr><td class="label">Họ và tên</td><td class="colon">:</td><td class="value"><strong>{{ $landlord->name }}</strong></td></tr>
                    @if($landlord->phone)
                    <tr><td class="label">Số điện thoại</td><td class="colon">:</td><td class="value">{{ $landlord->phone }}</td></tr>
                    @endif
                    @if($landlord->email)
                    <tr><td class="label">Email</td><td class="colon">:</td><td class="value">{{ $landlord->email }}</td></tr>
                    @endif
                    <tr><td class="label">Nhà trọ</td><td class="colon">:</td><td class="value">{{ $room->house->name }}</td></tr>
                    @if($room->house->address)
                    <tr><td class="label">Địa chỉ</td><td class="colon">:</td><td class="value">{{ $room->house->address }}</td></tr>
                    @endif
                </table>
            </td>
            <td>
                <div class="party-header">Bên thuê (Bên B)</div>
                <table class="info-table">
                    <tr><td class="label">Họ và tên</td><td class="colon">:</td><td class="value"><strong>{{ $renter->name }}</strong></td></tr>
                    @if($renter->phone)
                    <tr><td class="label">Số điện thoại</td><td class="colon">:</td><td class="value">{{ $renter->phone }}</td></tr>
                    @endif
                    @if($renter->email)
                    <tr><td class="label">Email</td><td class="colon">:</td><td class="value">{{ $renter->email }}</td></tr>
                    @endif
                    @if(isset($renter->id_card) && $renter->id_card)
                    <tr><td class="label">CCCD / CMND</td><td class="colon">:</td><td class="value">{{ $renter->id_card }}</td></tr>
                    @endif
                    @if(isset($renter->address) && $renter->address)
                    <tr><td class="label">Địa chỉ thường trú</td><td class="colon">:</td><td class="value">{{ $renter->address }}</td></tr>
                    @endif
                </table>
            </td>
        </tr>
    </table>

    {{-- ── ĐIỀU 2: ĐỐI TƯỢNG ── --}}
    <div class="article-title">Điều 2. Đối tượng hợp đồng</div>
    <table class="info-table">
        <tr><td class="label">Phòng số</td><td class="colon">:</td><td class="value"><strong>{{ $room->name }}</strong></td></tr>
        <tr><td class="label">Tòa nhà / Nhà trọ</td><td class="colon">:</td><td class="value">{{ $room->house->name }}</td></tr>
        @if($room->house->address)
        <tr><td class="label">Địa chỉ</td><td class="colon">:</td><td class="value">{{ $room->house->address }}</td></tr>
        @endif
        @if(isset($room->area) && $room->area)
        <tr><td class="label">Diện tích</td><td class="colon">:</td><td class="value">{{ $room->area }} m²</td></tr>
        @endif
        <tr><td class="label">Mục đích sử dụng</td><td class="colon">:</td><td class="value">Nhà ở</td></tr>
    </table>

    {{-- ── ĐIỀU 3: THỜI HẠN ── --}}
    <div class="article-title">Điều 3. Thời hạn hợp đồng</div>
    <table class="info-table">
        <tr>
            <td class="label">Ngày bắt đầu</td>
            <td class="colon">:</td>
            <td class="value"><strong>{{ \Carbon\Carbon::parse($contract->start_date)->format('d/m/Y') }}</strong></td>
        </tr>
        <tr>
            <td class="label">Ngày kết thúc</td>
            <td class="colon">:</td>
            <td class="value">
                <strong>
                    {{ $contract->end_date ? \Carbon\Carbon::parse($contract->end_date)->format('d/m/Y') : 'Vô thời hạn' }}
                </strong>
            </td>
        </tr>
        @if($contract->end_date)
        <tr>
            <td class="label">Thời hạn</td>
            <td class="colon">:</td>
            <td class="value">{{ \Carbon\Carbon::parse($contract->start_date)->diffInMonths(\Carbon\Carbon::parse($contract->end_date)) }} tháng</td>
        </tr>
        @endif
        <tr>
            <td class="label">Trạng thái</td>
            <td class="colon">:</td>
            <td class="value">
                @if($contract->status === 'active') Đang hiệu lực
                @elseif($contract->status === 'terminated') Đã chấm dứt
                @else Hết hạn @endif
            </td>
        </tr>
    </table>

    {{-- ── ĐIỀU 4: GIÁ THUÊ ── --}}
    <div class="article-title">Điều 4. Giá thuê và phương thức thanh toán</div>
    <table class="fin-table">
        <thead>
            <tr>
                <th style="width:55%">Khoản mục</th>
                <th style="width:45%; text-align:right;">Giá trị</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="bold">Giá thuê hàng tháng</td>
                <td class="right bold">{{ number_format($contract->monthly_rent, 0, ',', '.') }} ₫ / tháng</td>
            </tr>
            <tr>
                <td>Tiền đặt cọc</td>
                <td class="right">{{ number_format($contract->deposit, 0, ',', '.') }} ₫</td>
            </tr>
            <tr>
                <td>Ngày thanh toán hàng tháng</td>
                <td class="right">Ngày {{ $contract->payment_date }} hàng tháng</td>
            </tr>
            <tr>
                <td>Phương thức thanh toán</td>
                <td class="right">Tiền mặt / Chuyển khoản ngân hàng</td>
            </tr>
            @if($room->house->bank_name && $room->house->account_no)
            <tr>
                <td>Thông tin chuyển khoản</td>
                <td class="right" style="font-size:10px;">
                    NH: <strong>{{ strtoupper($room->house->bank_name) }}</strong>
                    &nbsp;|&nbsp; STK: <strong>{{ $room->house->account_no }}</strong>
                    @if($room->house->account_name)
                    &nbsp;|&nbsp; CTK: <strong>{{ strtoupper($room->house->account_name) }}</strong>
                    @endif
                </td>
            </tr>
            @endif
        </tbody>
    </table>

    {{-- ── ĐIỀU 5: ĐIỀU KHOẢN ── --}}
    <div class="article-title">Điều 5. Quyền và nghĩa vụ của các bên</div>

    @if($contract->terms && trim($contract->terms) !== '')
        @foreach(explode("\n", $contract->terms) as $line)
            <p style="font-size:11px; line-height:1.8; margin-bottom:2px;">{{ $line }}</p>
        @endforeach
    @else
        <p class="clause"><b>5.1.</b> Bên B có trách nhiệm thanh toán tiền thuê đúng hạn. Chậm thanh toán quá 7 ngày kể từ ngày quy định sẽ bị phạt 0.1%/ngày trên số tiền còn nợ.</p>
        <p class="clause"><b>5.2.</b> Bên B không được tự ý sửa chữa, thay đổi kết cấu phòng hoặc thiết bị khi chưa có sự đồng ý bằng văn bản của Bên A.</p>
        <p class="clause"><b>5.3.</b> Bên B có trách nhiệm giữ gìn vệ sinh chung, không gây ồn ào ảnh hưởng đến người khác, không lưu giữ chất nguy hiểm trái pháp luật.</p>
        <p class="clause"><b>5.4.</b> Bên B không được cho người khác thuê lại hoặc ở ghép khi chưa có sự đồng ý của Bên A.</p>
        <p class="clause"><b>5.5.</b> Khi chấm dứt hợp đồng, Bên B phải thông báo trước ít nhất <b>30 ngày</b>. Tiền cọc được hoàn trả trong vòng 7 ngày sau khi bàn giao phòng, trừ các khoản hư hỏng (nếu có).</p>
        <p class="clause"><b>5.6.</b> Bên A cam kết cung cấp phòng ở sạch sẽ, đảm bảo các tiện ích cơ bản hoạt động bình thường và sửa chữa sự cố trong vòng 48 giờ kể từ khi được thông báo.</p>
        <p class="clause"><b>5.7.</b> Mọi tranh chấp được giải quyết trước tiên bằng thương lượng. Nếu không đạt được thỏa thuận, một trong hai bên có thể đưa vụ việc ra Tòa án nhân dân có thẩm quyền để giải quyết.</p>
    @endif

    {{-- ── ĐIỀU 6: HIỆU LỰC ── --}}
    <div class="article-title">Điều 6. Điều khoản chung</div>
    <p>
        Hợp đồng này được lập thành <b>02 (hai) bản có giá trị pháp lý như nhau</b>, mỗi bên giữ một bản và có hiệu lực kể từ ngày ký. Hai bên đã đọc kỹ, hiểu rõ và tự nguyện ký kết các điều khoản nêu trên.
    </p>

    <hr class="divider" style="margin-top:24px;">

    {{-- ── KÝ TÊN ── --}}
    <table class="signature">
        <tr>
            <td>
                <div class="sig-title">Bên Cho Thuê (Bên A)</div>
                <div class="sig-note">(Ký, ghi rõ họ tên)</div>
                <div class="sig-name">{{ $landlord->name }}</div>
            </td>
            <td>
                <div class="sig-title">Bên Thuê (Bên B)</div>
                <div class="sig-note">(Ký, ghi rõ họ tên)</div>
                <div class="sig-name">{{ $renter->name }}</div>
            </td>
        </tr>
    </table>

    {{-- ── FOOTER ── --}}
    <div class="footer">
        Tài liệu được tạo tự động bởi hệ thống quản lý nhà trọ &nbsp;|&nbsp; {{ \Carbon\Carbon::now()->format('d/m/Y H:i') }}
        &nbsp;|&nbsp; Hợp đồng số: HĐ-{{ str_pad($contract->id, 4, '0', STR_PAD_LEFT) }}
    </div>

</body>
</html>
