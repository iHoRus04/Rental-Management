# ⏰ Cấu hình thời gian kiểm tra nhắc nhở

## Tần suất kiểm tra hiện tại

### 1. Tự động hàng ngày
- **Thời gian:** 8:00 sáng mỗi ngày
- **File cấu hình:** `routes/console.php`
- **Cần:** Cron job hoặc Task Scheduler đang chạy

### 2. Tự động khi load trang
- **Khi nào:** Mỗi khi admin truy cập `/landlord/reminders`
- **File:** `app/Http/Controllers/Landlord/ReminderController.php`

---

## 🔧 Các cách thay đổi tần suất

### Option 1: Chạy mỗi giờ
```php
Schedule::command('reminders:generate')
    ->hourly()  // Mỗi giờ
    ->description('Tự động tạo nhắc nhở');
```

### Option 2: Chạy nhiều lần trong ngày
```php
Schedule::command('reminders:generate')
    ->dailyAt('08:00')  // 8 giờ sáng
    ->description('Tạo nhắc nhở buổi sáng');

Schedule::command('reminders:generate')
    ->dailyAt('14:00')  // 2 giờ chiều
    ->description('Tạo nhắc nhở buổi chiều');
```

### Option 3: Mỗi 30 phút
```php
Schedule::command('reminders:generate')
    ->everyThirtyMinutes()
    ->description('Tự động tạo nhắc nhở');
```

### Option 4: Mỗi ngày vào các giờ cụ thể
```php
Schedule::command('reminders:generate')
    ->twiceDaily(8, 18)  // 8h sáng và 6h chiều
    ->description('Tự động tạo nhắc nhở');
```

### Option 5: Chỉ ngày trong tuần
```php
Schedule::command('reminders:generate')
    ->weekdays()  // Thứ 2 - Thứ 6
    ->at('08:00')
    ->description('Tự động tạo nhắc nhở');
```

### Option 6: Mỗi 6 giờ
```php
Schedule::command('reminders:generate')
    ->cron('0 */6 * * *')  // 0:00, 6:00, 12:00, 18:00
    ->description('Tự động tạo nhắc nhở');
```

---

## 🚀 Kích hoạt Scheduler

### Trên Windows (Development)

**Cách 1: Chạy liên tục trong terminal**
```bash
php artisan schedule:work
```
Giữ terminal mở, scheduler sẽ chạy mỗi phút.

**Cách 2: Task Scheduler (Production)**
1. Mở Task Scheduler (Tìm trong Start menu)
2. Create Basic Task
3. Name: "Laravel Scheduler - Rental Management"
4. Trigger: Daily, start time: 00:00
5. Action: Start a program
   - Program: `C:\php\php.exe` (đường dẫn PHP của bạn)
   - Arguments: `artisan schedule:run`
   - Start in: `D:\FrontEnd\FrontEnd\rental-management`
6. Settings:
   - ☑️ Run whether user is logged on or not
   - ☑️ Run with highest privileges
7. Advanced → Repeat task every: **1 minute**

### Trên Linux/Mac (Production)

Mở crontab:
```bash
crontab -e
```

Thêm dòng:
```bash
* * * * * cd /path/to/rental-management && php artisan schedule:run >> /dev/null 2>&1
```

---

## 🧪 Test Scheduler

### Kiểm tra scheduler đã được config đúng chưa
```bash
php artisan schedule:list
```

Kết quả mong đợi:
```
0 8 * * *  php artisan reminders:generate .... Next Due: Tomorrow at 08:00
```

### Chạy thủ công (giả lập scheduler)
```bash
php artisan schedule:run
```

### Chạy liên tục để test
```bash
php artisan schedule:work
```

### Test command trực tiếp
```bash
php artisan reminders:generate
```

---

## 📊 Kiểm tra lịch sử chạy

### Xem log Laravel
```bash
tail -f storage/logs/laravel.log
```

### Xem log Scheduler (nếu có)
```bash
tail -f storage/logs/scheduler.log
```

---

## 💡 Khuyến nghị

### Development (Máy dev)
- Dùng `php artisan schedule:work` khi đang code
- Hoặc tắt auto-run và chỉ trigger khi load trang

### Production (Server thật)
- Setup cron job/Task Scheduler chạy mỗi phút
- Scheduler sẽ tự quản lý chạy đúng giờ
- Chạy 2-3 lần/ngày (sáng, trưa, chiều) là đủ

### Tắt auto-run khi load trang (optional)

Nếu muốn chỉ dựa vào scheduler, bỏ dòng này trong `ReminderController.php`:

```php
// Tìm và xóa/comment dòng này
Artisan::call('reminders:generate');
```

---

## ⚠️ Lưu ý quan trọng

1. **Scheduler chỉ chạy nếu có cron job/Task Scheduler**
   - Trên dev: Phải chạy `schedule:work` hoặc `schedule:run` thủ công
   - Trên production: Phải setup cron job

2. **Command không tạo trùng lặp**
   - Chạy nhiều lần cũng OK, hệ thống kiểm tra trước khi tạo

3. **Performance**
   - Auto-run khi load trang có thể làm chậm 1-2s
   - Nếu traffic cao, nên tắt và chỉ dùng scheduler

4. **Testing**
   - Dùng `reminders:test` để kiểm tra trước khi chạy
   - Dùng `reminders:setup-test` để tạo dữ liệu test

---

## 🔍 Troubleshooting

### Scheduler không chạy?
```bash
# 1. Kiểm tra list
php artisan schedule:list

# 2. Chạy thủ công
php artisan schedule:run

# 3. Xem output
php artisan schedule:run -v

# 4. Kiểm tra log
cat storage/logs/laravel.log | grep "reminders:generate"
```

### Muốn nhận email khi scheduler chạy?
```php
Schedule::command('reminders:generate')
    ->daily()
    ->at('08:00')
    ->emailOutputOnFailure('admin@example.com');
```

### Muốn log output ra file?
```php
Schedule::command('reminders:generate')
    ->daily()
    ->at('08:00')
    ->appendOutputTo(storage_path('logs/scheduler.log'));
```
