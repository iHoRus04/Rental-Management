# 🧪 Hướng dẫn Test Hệ thống Nhắc nhở

## Các Command Test

### 1. Kiểm tra tình trạng hệ thống

```bash
php artisan reminders:test
```

Hiển thị:

- Số hợp đồng active
- Hóa đơn tháng này
- Hóa đơn chưa thanh toán
- Nhắc nhở hiện có
- Phân tích những gì cần nhắc

### 2. Thiết lập dữ liệu test

```bash
php artisan reminders:setup-test
```

Tự động cập nhật due_date của hóa đơn chưa thanh toán để tạo các tình huống test:

- Còn 2 ngày
- Còn 5 ngày
- Hôm nay
- Quá hạn 3 ngày

### 3. Tạo nhắc nhở

```bash
php artisan reminders:generate
```

Quét toàn bộ hệ thống và tạo nhắc nhở cần thiết.

### 4. Xóa tất cả nhắc nhở (để test lại)

```bash
php artisan reminders:clear --no-interaction
```

## Quy trình Test Đầy đủ

### Test Case 1: Hóa đơn sắp đến hạn

```bash
# 1. Setup dữ liệu
php artisan reminders:setup-test

# 2. Xóa nhắc nhở cũ
php artisan reminders:clear --no-interaction

# 3. Tạo nhắc nhở mới
php artisan reminders:generate

# 4. Kiểm tra kết quả
php artisan reminders:test

# 5. Xem trên web
# Mở: http://127.0.0.1:8000/landlord/reminders
```

Kết quả mong đợi:

- ✓ Tạo được nhắc nhở "💸 Thanh toán hóa đơn" cho hóa đơn còn 2 ngày
- ✓ Badge đỏ hiện số lượng trên menu và icon chuông
- ✓ Widget nhắc nhở xuất hiện trên Dashboard

### Test Case 2: Phòng chưa có hóa đơn tháng này

```bash
# 1. Tạo contract active mới hoặc xóa hóa đơn của 1 phòng
# Dùng tinker hoặc qua giao diện web

# 2. Chạy generate
php artisan reminders:generate

# 3. Kiểm tra
php artisan reminders:test
```

Kết quả mong đợi:

- ✓ Tạo nhắc nhở "📝 Tạo hóa đơn" badge màu tím

### Test Case 3: Hợp đồng sắp hết hạn

Cần có hợp đồng với end_date trong vòng 30 ngày tới.

### Test Case 4: Auto-refresh trên trang web

1. Mở trang reminders
2. Để terminal chạy: `php artisan schedule:work`
3. Sau 60 giây, trang sẽ tự động refresh
4. Badge count cũng tự động cập nhật

## Kiểm tra Database

```sql
-- Xem tất cả reminders
SELECT 
    r.id,
    r.type,
    r.reminder_date,
    r.is_sent,
    rm.name as room,
    SUBSTRING(r.message, 1, 50) as message
FROM reminders r
JOIN contracts c ON r.contract_id = c.id
JOIN rooms rm ON c.room_id = rm.id
ORDER BY r.reminder_date DESC;

-- Đếm theo loại
SELECT type, COUNT(*) as count
FROM reminders
GROUP BY type;

-- Reminders cần xử lý (chưa gửi)
SELECT COUNT(*) 
FROM reminders 
WHERE is_sent = FALSE 
AND reminder_date <= CURDATE();
```

## Troubleshooting

### Không tạo được nhắc nhở

**Vấn đề:** Chạy `reminders:generate` nhưng count = 0

**Giải pháp:**

1. Kiểm tra có dữ liệu không: `php artisan reminders:test`
2. Xóa reminders cũ: `php artisan reminders:clear --no-interaction`
3. Setup lại dữ liệu: `php artisan reminders:setup-test`
4. Tạo lại: `php artisan reminders:generate`

### Badge không hiển thị

**Vấn đề:** Badge count = 0 trên web

**Kiểm tra:**

1. Xem Console log có lỗi: F12 → Console
2. Test API endpoint: `curl http://127.0.0.1:8000/landlord/reminders/pending-count`
3. Kiểm tra auth user có đúng không

### Widget không xuất hiện trên Dashboard

**Nguyên nhân:** Không có reminder với status pending

**Kiểm tra:**

```bash
php artisan reminders:test
```

Phần "PHÂN TÍCH" phải có cảnh báo màu vàng/đỏ.

## Các Command Hữu ích

```bash
# Xem logs
tail -f storage/logs/laravel.log

# Chạy scheduler manually (test cron)
php artisan schedule:run

# Chạy scheduler liên tục
php artisan schedule:work

# Query reminders pending
php artisan tinker
>>> \App\Models\Reminder::where('is_sent', false)->count()

# Đánh dấu reminder đã gửi
>>> \App\Models\Reminder::find(1)->markAsSent()
```

## Checklist Test Đầy đủ

- [ ] Nhắc tạo hóa đơn (bill_creation) 🟣
- [ ] Nhắc thanh toán hóa đơn (bill_payment) 🔴
  - [ ] Còn 3 ngày
  - [ ] Còn 2 ngày
  - [ ] Hôm nay là hạn
  - [ ] Đã quá hạn
- [ ] Nhắc thanh toán tiền thuê (payment) 🔵
- [ ] Nhắc hợp đồng hết hạn (contract_expiry) 🟠
- [ ] Badge hiển thị đúng số lượng
- [ ] Icon chuông có badge
- [ ] Widget trên Dashboard
- [ ] Auto-refresh (60s)
- [ ] Lọc theo loại
- [ ] Lọc theo trạng thái
- [ ] Đánh dấu đã gửi
- [ ] Xóa nhắc nhở

## Tips

1. **Tạo nhiều test case nhanh:**

   ```bash
   php artisan reminders:setup-test && php artisan reminders:clear --no-interaction && php artisan reminders:generate && php artisan reminders:test
   ```
2. **Reset để test lại:**

   ```bash
   php artisan reminders:clear --no-interaction && php artisan reminders:generate
   ```
3. **Xem output đẹp hơn:** Dùng `| less` hoặc `| more` sau command
4. **Test production:** Nhớ setup cron job để chạy tự động hàng ngày
