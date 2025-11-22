# Hệ Thống Quản Lý Chỉ Số Điện-Nước (Meter Logs)

## 🎯 Tổng Quan
Hệ thống quản lý chỉ số điện-nước hoàn chỉnh cho ứng dụng quản lý nhà trọ.

## 📊 Các Tính Năng Chính

### 1. **Ghi Nhận Chỉ Số**
- Nhập chỉ số hiện tại (kWh điện, m³ nước) theo tháng/năm
- Tự động tính toán lượng sử dụng dựa trên chỉ số tháng trước
- Mỗi phòng chỉ có 1 bản ghi/tháng (unique constraint)

### 2. **Lịch Sử Chỉ Số**
- Xem lịch sử chỉ số của từng phòng
- Theo dõi xu hướng tiêu thụ theo thời gian
- Ghi chú thêm chi tiết

### 3. **Tự Động Lấy Dữ Liệu Khi Tạo Hóa Đơn**
- Khi tạo hóa đơn, hệ thống tự động tìm kiếm chỉ số tương ứng
- Điền số lượng sử dụng từ Meter Log
- Người dùng chỉ cần nhập đơn giá, tiền tự động tính

## 🏗️ Cấu Trúc Database

### meter_logs table
```sql
- id (PK)
- room_id (FK → rooms) - Phòng
- month (int 1-12) - Tháng
- year (int) - Năm
- electric_reading (int) - Chỉ số điện hiện tại (kWh)
- water_reading (int) - Chỉ số nước hiện tại (m³)
- electric_usage (int) - Lượng sử dụng điện (tính tự động)
- water_usage (int) - Lượng sử dụng nước (tính tự động)
- notes (text) - Ghi chú
- unique (room_id, month, year)
```

## 🔄 Quy Trình Tính Toán

### Lượng Sử Dụng = Chỉ Số Hiện Tại - Chỉ Số Tháng Trước

Ví dụ:
```
Tháng 10: Chỉ số điện = 1000 kWh
Tháng 11: Chỉ số điện = 1050 kWh
→ Sử dụng tháng 11 = 1050 - 1000 = 50 kWh
```

Nếu là tháng đầu tiên (không có dữ liệu tháng trước):
```
→ Sử dụng = Chỉ số hiện tại
```

## 🎨 UI Components

### 1. **MeterLogs/Index** - Danh Sách Chỉ Số
- Bộ lọc: phòng, tháng, năm
- Bảng hiển thị: Phòng | Kỳ | Chỉ số điện | Sử dụng | Chỉ số nước | Sử dụng | Thao tác
- Nút thêm mới, sửa, xóa

### 2. **MeterLogs/Create** - Thêm Chỉ Số
- Chọn phòng
- Nhập tháng/năm
- Nhập chỉ số điện & nước
- Ghi chú tùy ý

### 3. **MeterLogs/Edit** - Chỉnh Sửa
- Cho phép chỉnh sửa lại chỉ số
- Tự động tính toán lại khi lưu

### 4. **MeterLogs/Show** - Chi Tiết & Lịch Sử
- Hiển thị chỉ số hiện tại (thẻ gradient xanh cam/xanh)
- Lịch sử chỉ số của phòng (sidebar)
- Nút sửa/xóa

### 5. **Bills/Create** - Tự Động Lấy Dữ Liệu
- Nhập phòng & tháng/năm
- Tự động fetch meter log từ API
- Hiển thị "📊 Từ Meter Log: X kWh"
- Người dùng chỉ cần nhập đơn giá

## 🛣️ Routes

### Landlord Routes
```
GET    /landlord/meter-logs              → Index
GET    /landlord/meter-logs/create       → Create form
POST   /landlord/meter-logs              → Store
GET    /landlord/meter-logs/{id}         → Show
GET    /landlord/meter-logs/{id}/edit    → Edit form
PUT    /landlord/meter-logs/{id}         → Update
DELETE /landlord/meter-logs/{id}         → Delete
```

### API Routes
```
GET /api/meter-logs/{roomId}/{month}/{year} → Get meter log data
```

## 🔗 Liên Kết Dữ Liệu

### MeterLog ↔ Room
- 1 phòng có nhiều chỉ số theo tháng
- Constraint: unique (room_id, month, year)

### MeterLog → Bill
- Khi tạo hóa đơn, lấy dữ liệu từ MeterLog
- electric_usage, water_usage → electric_kwh, water_usage
- Người dùng chỉnh sửa lại nếu cần

## 💡 Ví Dụ Sử Dụng

### Bước 1: Ghi Nhận Chỉ Số (Hàng Tháng)
1. Vào "Quản lý chỉ số điện-nước"
2. Nhấn "+ Thêm chỉ số mới"
3. Chọn phòng, tháng/năm
4. Nhập chỉ số từ công tơ & đồng hồ
5. Lưu → Tự động tính lượng sử dụng

### Bước 2: Tạo Hóa Đơn
1. Vào "Tạo hóa đơn"
2. Chọn hợp đồng (phòng)
3. Chọn tháng/năm
4. ✨ Hệ thống tự động lấy:
   - Số điện = 50 kWh
   - Số nước = 3 m³
5. Nhập đơn giá:
   - Điện: 3500 ₫/kWh → 50 × 3500 = 175000 ₫
   - Nước: 50000 ₫/m³ → 3 × 50000 = 150000 ₫
6. Tổng tiền tự động cập nhật
7. Lưu hóa đơn

## 📝 Migration

```php
php artisan make:model MeterLog -m
php artisan migrate
```

## 🎮 Controllers

- `MeterLogController` (Landlord) - CRUD
- `Api/MeterLogController` - API GET

## ✅ Validation

- room_id: required, exists
- month: required, 1-12
- year: required, >= 2020
- electric_reading: required, >= 0
- water_reading: required, >= 0
- notes: nullable

## 🔒 Security

- Middleware: role:landlord
- Unique constraint: (room_id, month, year)
- Validation: Input sanitization
