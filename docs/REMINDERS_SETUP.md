# Hướng dẫn thiết lập hệ thống nhắc nhở tự động

## Tính năng đã thêm

### 1. Tự động tạo nhắc nhở
Hệ thống sẽ tự động tạo các nhắc nhở cho:
- **Tạo hóa đơn**: Nhắc vào ngày 1-3 của tháng nếu phòng có người thuê nhưng chưa tạo hóa đơn tháng đó
- **Thanh toán hóa đơn**: Nhắc trước 3 ngày và vào ngày đến hạn nếu hóa đơn chưa thanh toán
- **Thanh toán tiền thuê**: Nhắc trước 5 ngày so với ngày thanh toán hàng tháng
- **Hợp đồng hết hạn**: Nhắc trước 30 ngày khi hợp đồng sắp hết hạn

### 2. Hiển thị thông báo
- Badge đỏ hiển thị số lượng nhắc nhở cần xử lý trên:
  - Menu sidebar "Nhắc nhở"
  - Icon chuông thông báo ở header
- Widget nhắc nhở cần xử lý trên Dashboard
- Tự động refresh mỗi 60 giây

### 3. Trang quản lý nhắc nhở
- Hiển thị tất cả nhắc nhở
- Lọc theo loại và trạng thái
- Đánh dấu đã gửi
- Tự động refresh mỗi 60 giây

## Cách thức hoạt động

### Command tự động tạo nhắc nhở
```bash
php artisan reminders:generate
```

Command này sẽ:
1. **Kiểm tra hóa đơn tháng này**: Với mỗi phòng có hợp đồng active, kiểm tra đã tạo hóa đơn chưa
   - Nếu chưa có → Tạo nhắc nhở "Tạo hóa đơn" vào ngày 1-3 của tháng
2. **Kiểm tra hóa đơn chưa thanh toán**: Tìm tất cả hóa đơn pending/partial
   - Nhắc trước 3 ngày so với hạn thanh toán
   - Nhắc vào ngày đến hạn
   - Hiển thị mức độ khẩn cấp (còn X ngày, hôm nay, hoặc quá hạn)
3. **Tạo nhắc nhở thanh toán**: Cho tháng tiếp theo (nếu chưa tồn tại)
4. **Tạo nhắc nhở hết hạn hợp đồng**: Trong vòng 30 ngày
5. **Không tạo trùng lặp**: Kiểm tra trước khi tạo mỗi nhắc nhở

### Schedule tự động chạy
Hệ thống đã được cấu hình trong `routes/console.php` để tự động chạy command mỗi ngày lúc 8:00 sáng.

## Thiết lập Cron Job (Production)

### Trên Linux/Mac
Mở crontab:
```bash
crontab -e
```

Thêm dòng sau:
```bash
* * * * * cd /đường/dẫn/đến/project && php artisan schedule:run >> /dev/null 2>&1
```

### Trên Windows
1. Mở Task Scheduler
2. Tạo Basic Task mới
3. Đặt tên: "Laravel Scheduler"
4. Trigger: Daily, repeat every 1 minute
5. Action: Start a program
   - Program: `C:\path\to\php.exe`
   - Arguments: `C:\path\to\project\artisan schedule:run`
   - Start in: `C:\path\to\project`

### Cách đơn giản hơn cho Development
Chạy lệnh sau trong terminal (giữ terminal mở):
```bash
php artisan schedule:work
```

Lệnh này sẽ chạy scheduler mỗi phút và hiển thị output trực tiếp.

## Kiểm tra hoạt động

### 1. Test tạo nhắc nhở thủ công
```bash
php artisan reminders:generate
```

### 2. Kiểm tra database
```sql
SELECT * FROM reminders ORDER BY created_at DESC LIMIT 10;
```

### 3. Kiểm tra API endpoint
Truy cập: `http://your-domain/landlord/reminders/pending-count`

Kết quả mong đợi:
```json
{
  "count": 5
}
```

## Tùy chỉnh

### Thay đổi thời điểm nhắc
Sửa trong `app/Console/Commands/GenerateReminders.php`:

```php
// 1. Nhắc tạo hóa đơn vào ngày nào của tháng
$reminderDate = Carbon::create($currentYear, $currentMonth, 3); // Thay 3 thành ngày bạn muốn (1-31)

// 2. Nhắc thanh toán hóa đơn trước X ngày
$dueDate->copy()->subDays(3); // Thay 3 thành số ngày bạn muốn

// 3. Nhắc thanh toán tiền thuê trước X ngày
$reminderDate = $nextPaymentDate->copy()->subDays(5); // Thay 5 thành số ngày bạn muốn

// 4. Nhắc hợp đồng hết hạn trước X ngày
$in30Days = Carbon::today()->addDays(30); // Thay 30 thành số ngày bạn muốn
```

### Thay đổi thời gian chạy scheduler
Sửa trong `routes/console.php`:

```php
Schedule::command('reminders:generate')
    ->daily()
    ->at('08:00') // Thay đổi giờ ở đây (format: HH:MM)
    ->description('Tự động tạo nhắc nhở');
```

### Tắt tự động tạo khi load trang
Nếu bạn muốn chỉ dựa vào scheduler mà không tự động tạo khi load trang reminders, bỏ dòng sau trong `ReminderController.php`:

```php
// Bỏ dòng này
Artisan::call('reminders:generate');
```

## Troubleshooting

### Nhắc nhở không được tạo
1. Kiểm tra có hợp đồng active không
2. Kiểm tra trường `payment_date` trong bảng contracts
3. Chạy command thủ công và xem log

### Badge không hiển thị số lượng
1. Kiểm tra route `landlord.reminders.pendingCount` hoạt động
2. Mở Developer Tools > Network để xem API call
3. Kiểm tra Console log có lỗi không
Các loại nhắc nhở

1. **bill_creation** (Tạo hóa đơn): 
   - Badge màu tím 🟣
   - Xuất hiện khi phòng có người thuê nhưng chưa có hóa đơn tháng hiện tại
   - Action: Đi tới trang tạo hóa đơn

2. **bill_payment** (Thanh toán hóa đơn):
   - Badge màu đỏ 🔴
   - Xuất hiện khi hóa đơn sắp đến hạn hoặc quá hạn chưa thanh toán
   - Hiển thị mức độ khẩn cấp và số tiền còn lại
   - Action: Nhắc khách thuê thanh toán
Workflow hoạt động

```
Ngày 1-3: Kiểm tra phòng có contract active
          ↓
      Đã có HĐ tháng này? → KHÔNG → Tạo reminder "Tạo HĐ" 🟣
          ↓ CÓ
      Kiểm tra trạng thái HĐ
          ↓
      Status = pending/partial? → CÓ → Tạo reminder "TT HĐ" 🔴
          ↓                              (trước 3 ngày & ngày đến hạn)
      Status = paid → Không nhắc
          
Mỗi ngày: Kiểm tra hợp đồng & thanh toán
          - Nhắc trước 5 ngày thanh toán 🔵
          - Nhắc trước 30 ngày hết hạn HĐ 🟠
```

## Các file đã thay đổi

1. `app/Console/Commands/GenerateReminders.php` - Command tạo nhắc nhở với logic mới
2. `app/Models/Reminder.php` - Thêm relationship với Bill
3. `database/migrations/2025_12_13_000000_add_bill_reminder_types.php` - Migration thêm types mới
4. `app/Http/Controllers/Landlord/ReminderController.php` - Controller với eager loading bill
5. `resources/js/Pages/Landlord/Reminders/Index.jsx` - UI với 4 loại nhắc nhở
6. `resources/js/Layouts/AuthenticatedLayout.jsx` - Layout với badge thông báo
7. `resources/js/Pages/Landlord/Dashboard.jsx` - Dashboard với widget nhắc nhở đầy đủ
8  - Badge màu cam 🟠
   - Nhắc trước 30 ngày khi hợp đồng sắp hết hạn
   - Action: Liên hệ gia hạn hoặc chấm dứt hợp đồng

## API Endpoints

- `GET /landlord/reminders` - Danh sách nhắc nhở
- `GET /landlord/reminders?type=bill_creation` - Lọc theo loại
- `GET /landlord/reminders?status=pending` - Lọc nhắc nhở cần xử lý
2. Chạy `php artisan schedule:work` để test
3. Kiểm tra log tại `storage/logs/laravel.log`

## API Endpoints

- `GET /landlord/reminders` - Danh sách nhắc nhở
- `GET /landlord/reminders/pending-count` - Số lượng nhắc nhở cần xử lý
- `POST /landlord/reminders/{id}/mark-sent` - Đánh dấu đã gửi

## Các file đã thay đổi

1. `app/Console/Commands/GenerateReminders.php` - Command tạo nhắc nhở
2. `app/Http/Controllers/Landlord/ReminderController.php` - Controller xử lý reminders
3. `resources/js/Pages/Landlord/Reminders/Index.jsx` - Trang quản lý nhắc nhở
4. `resources/js/Layouts/AuthenticatedLayout.jsx` - Layout với badge thông báo
5. `resources/js/Pages/Landlord/Dashboard.jsx` - Dashboard với widget nhắc nhở
6. `routes/console.php` - Schedule configuration

## Lưu ý
- Nhắc nhở sẽ không bị trùng lặp (hệ thống kiểm tra trước khi tạo)
- Tự động refresh giúp cập nhật real-time nhưng tốn bandwidth
- Có thể tăng interval từ 60s lên 120s hoặc 300s nếu cần
