# Hệ thống quản lý dịch vụ phòng trọ

## 📋 Tổng quan

Hệ thống quản lý dịch vụ cho phép bạn:
- Tạo và quản lý các dịch vụ (điện, nước, internet, v.v.)
- Gán dịch vụ cho từng phòng với giá riêng
- Xem thông tin dịch vụ khi tạo hóa đơn

## 🚀 Cài đặt

### 1. Chạy migrations

```bash
php artisan migrate
```

Lệnh này sẽ tạo 2 bảng:
- `services`: Lưu thông tin các dịch vụ
- `room_services`: Liên kết dịch vụ với phòng (bảng pivot)

### 2. Tạo dữ liệu demo (tuỳ chọn)

```bash
php artisan db:seed --class=ServiceSeeder
```

Lệnh này sẽ tạo 7 dịch vụ mẫu:
- Tiền điện (3,500 ₫/kWh)
- Tiền nước (15,000 ₫/m³)
- Internet (100,000 ₫/tháng)
- Vệ sinh chung (50,000 ₫/tháng)
- Gửi xe máy (50,000 ₫/tháng)
- Gửi xe ô tô (500,000 ₫/tháng)
- Bảo trì (30,000 ₫)

## 📖 Hướng dẫn sử dụng

### Bước 1: Quản lý dịch vụ chung

1. Đăng nhập với tài khoản landlord
2. Vào menu **Quản lý dịch vụ** (route: `/landlord/services`)
3. Click **"Thêm dịch vụ"** để tạo dịch vụ mới
4. Nhập thông tin:
   - **Tên dịch vụ**: VD: Điện, Nước, Internet
   - **Mô tả**: Mô tả chi tiết
   - **Giá mặc định**: Giá tham khảo chung
   - **Đơn vị tính**: kWh, m³, tháng, hoặc dịch vụ
   - **Kích hoạt**: Bật/tắt dịch vụ

### Bước 2: Gán dịch vụ cho phòng

#### Cách 1: Từ danh sách phòng
1. Vào **Nhà trọ** → Chọn nhà → Danh sách phòng
2. Click vào phòng cần quản lý dịch vụ
3. Click nút **"Quản lý dịch vụ"** (nếu có)

#### Cách 2: Trực tiếp qua URL
- Truy cập: `/landlord/rooms/{room_id}/services`
- VD: `/landlord/rooms/1/services`

**Thao tác:**
- **Thêm dịch vụ**: Click "Thêm dịch vụ" → Chọn dịch vụ → Nhập giá → Lưu
- **Sửa dịch vụ**: Click "Sửa" trên dịch vụ → Cập nhật giá/trạng thái
- **Xóa dịch vụ**: Click "Xóa" → Xác nhận

### Bước 3: Tạo hóa đơn với thông tin dịch vụ

1. Vào **Hóa đơn** → **Tạo hóa đơn mới**
2. Chọn hợp đồng (phòng + khách thuê)
3. **Xem thông tin dịch vụ của phòng**: Ngay sau khi chọn hợp đồng, bạn sẽ thấy một bảng màu xanh hiển thị:
   - Tên dịch vụ
   - Giá dịch vụ đã cài đặt cho phòng
   - Đơn vị tính
4. **Nhập chi tiết hóa đơn**: Tham khảo các giá dịch vụ bên trên để nhập vào form
5. Click **"Tạo hóa đơn"**

## 🗂️ Cấu trúc Database

### Bảng `services`
- `id`: Primary key
- `name`: Tên dịch vụ
- `description`: Mô tả
- `default_price`: Giá mặc định
- `unit`: Đơn vị (kwh, m3, month, service)
- `is_active`: Trạng thái kích hoạt
- `created_at`, `updated_at`

### Bảng `room_services`
- `id`: Primary key
- `room_id`: Foreign key → rooms
- `service_id`: Foreign key → services
- `price`: Giá cụ thể cho phòng
- `is_active`: Trạng thái sử dụng
- `note`: Ghi chú
- `created_at`, `updated_at`
- **Unique constraint**: (`room_id`, `service_id`)

## 🛣️ Routes

### Web Routes (Landlord)
```
GET    /landlord/services                     - Danh sách dịch vụ
GET    /landlord/services/create              - Form tạo dịch vụ
POST   /landlord/services                     - Lưu dịch vụ mới
GET    /landlord/services/{id}/edit           - Form sửa dịch vụ
PUT    /landlord/services/{id}                - Cập nhật dịch vụ
DELETE /landlord/services/{id}                - Xóa dịch vụ

GET    /landlord/rooms/{room}/services        - Dịch vụ của phòng
POST   /landlord/rooms/{room}/services        - Thêm dịch vụ vào phòng
PUT    /landlord/room-services/{id}           - Cập nhật dịch vụ phòng
DELETE /landlord/room-services/{id}           - Xóa dịch vụ khỏi phòng
```

### API Routes
```
GET /api/rooms/{roomId}/services - Lấy danh sách dịch vụ của phòng
```

## 📁 Files đã tạo/cập nhật

### Backend
- `database/migrations/2026_01_06_*_create_services_table.php`
- `database/migrations/2026_01_06_*_create_room_services_table.php`
- `database/seeders/ServiceSeeder.php`
- `app/Models/Service.php`
- `app/Models/RoomService.php`
- `app/Models/Room.php` (đã cập nhật relationships)
- `app/Http/Controllers/Landlord/ServiceController.php`
- `routes/web.php` (thêm routes)
- `routes/api.php` (thêm API endpoint)

### Frontend
- `resources/js/Pages/Landlord/Services/Index.jsx`
- `resources/js/Pages/Landlord/Services/Create.jsx`
- `resources/js/Pages/Landlord/Services/Edit.jsx`
- `resources/js/Pages/Landlord/Services/RoomServices.jsx`
- `resources/js/Pages/Landlord/Bills/Create.jsx` (đã cập nhật)

## 💡 Tips

1. **Giá mặc định vs Giá phòng**: 
   - Giá mặc định trong `services` là giá tham khảo chung
   - Khi gán vào phòng, bạn có thể đặt giá khác (VD: phòng VIP có giá cao hơn)

2. **Tự động điền giá**:
   - Khi thêm dịch vụ vào phòng, giá mặc định sẽ tự động được điền
   - Bạn có thể sửa lại giá này tuỳ ý

3. **Xem nhanh dịch vụ khi tạo hóa đơn**:
   - Không cần mở tab mới
   - Thông tin hiển thị ngay trên form
   - Click "Xem chi tiết" để mở trang quản lý dịch vụ phòng

4. **Quản lý nhiều loại dịch vụ**:
   - Dịch vụ theo số lượng: Điện (kWh), Nước (m³)
   - Dịch vụ cố định: Internet, Vệ sinh (theo tháng)
   - Dịch vụ khác: Bảo trì, Sửa chữa (một lần)

## 🎯 Demo nhanh

```bash
# 1. Chạy migrations
php artisan migrate

# 2. Tạo dữ liệu demo
php artisan db:seed --class=ServiceSeeder

# 3. Chạy dev server
npm run dev
php artisan serve

# 4. Truy cập
# - Danh sách dịch vụ: http://localhost:8000/landlord/services
# - Dịch vụ phòng: http://localhost:8000/landlord/rooms/1/services
```

## 🐛 Troubleshooting

**Lỗi: Table 'services' doesn't exist**
```bash
php artisan migrate
```

**Không thấy thông tin dịch vụ khi tạo hóa đơn**
- Kiểm tra phòng đã có dịch vụ chưa
- Xem console browser để check lỗi API

**API không hoạt động**
- Xóa cache: `php artisan config:clear`
- Xóa route cache: `php artisan route:clear`

## 📝 Changelog

### Version 1.0 (2026-01-06)
- ✅ Tạo migrations cho services và room_services
- ✅ Tạo models với relationships
- ✅ Tạo ServiceController với đầy đủ CRUD
- ✅ Tạo UI quản lý dịch vụ
- ✅ Tạo UI quản lý dịch vụ phòng
- ✅ Tích hợp hiển thị dịch vụ vào form tạo hóa đơn
- ✅ Tạo seeder dữ liệu demo
