# 🏠 DreamHouse - Hệ Thống Quản Lý Chuỗi Nhà Trọ Thông Minh (SaaS Platform)

<p align="center">
  <img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="220" alt="Laravel Logo">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" width="100" alt="React Logo">
</p>

**DreamHouse** là giải pháp phần mềm quản lý chuỗi nhà trọ/căn hộ dịch vụ đa chi nhánh theo mô hình **SaaS (Software as a Service)**. Hệ thống giúp số hóa toàn bộ quy trình vận hành: từ khởi tạo tòa nhà, quản lý hợp đồng, chốt chỉ số điện nước hàng loạt, lập và phát hành hóa đơn tự động kèm **mã VietQR động 24/7**, cho tới phân quyền nhân viên RBAC và quản lý sự cố hỏng hóc.

---

## 🌐 DEMO TRỰC TUYẾN (LIVE DEMO)

* 🏢 **Trang Web Quản Lý (Admin / Landlord / Staff / Tenant Portal):** [https://dreamhouse-app.onrender.com/](https://dreamhouse-app.onrender.com/)
* 🌐 **Trang Web Cấu Hình / Công Khai (Public Landing Page & Tìm Phòng):** [https://dreamhouse-pied.vercel.app/](https://dreamhouse-pied.vercel.app/)

---

## 🌟 TÍNH NĂNG NỔI BẬT

### 🏢 Phân Hệ Chủ Trọ (Landlord) & Nhân Viên (Staff)
* **Setup Wizard 3 bước thông minh:** Khởi tạo nhanh gói cước, tòa nhà và tự động sinh sơ đồ phòng trống (`Phòng 101`, `Phòng 102`...) chỉ trong 2 phút.
* **Quản lý Gói cước SaaS & Hạn mức:** Đăng ký, gia hạn gói cước (Free Trial, Cơ Bản, VIP), thanh toán qua VietQR tự động. Tác vụ Cron Job lúc 08:00 AM gửi email nhắc nhở gia hạn khi gói cước sắp hết hạn (`SubscriptionExpiringMail`).
* **Quản lý Chuỗi Tòa nhà & Phòng trọ:** Quản lý không giới hạn chi nhánh nhà trọ, danh mục phòng, hình ảnh thực tế (1-5 ảnh), đơn giá cố định và trạng thái phòng (`available`, `occupied`, `maintenance`).
* **Biểu giá Dịch vụ Tùy chỉnh:** Cấu hình danh mục dịch vụ (Wifi, Rác, Gửi xe...) và điều chỉnh đơn giá áp dụng riêng cho từng phòng trọ (`room_services`).
* **Quản lý Yêu cầu & Lập Hợp đồng cho thuê:** 
  - Duyệt yêu cầu đăng ký thuê phòng trực tuyến (`RenterRequests`).
  - Lập Hợp đồng chuẩn pháp lý, tự động xuất file **PDF Hợp đồng** đính kèm biểu giá dịch vụ (Điều 4).
  - Tự động gửi Email đính kèm PDF Hợp đồng (`ContractCreatedMail`) cho khách được duyệt.
  - **Tự động đối soát & lưu trữ:** Tự động gửi Email thông báo hết phòng lịch sự (`RoomAlreadyRentedMail`) và chuyển các yêu cầu trùng còn lại vào **Lưu trữ (`Soft Delete`)**.
  - Nút **Cấp tài khoản Khách thuê** (`role = tenant`) với mật khẩu mặc định là SĐT.
* **Chốt chỉ số Điện/Nước hàng loạt:** Tự động tải chỉ số cũ tháng trước, cơ chế Validation bắt buộc $\text{Chỉ số mới} \ge \text{Chỉ số cũ}$ (báo đỏ nếu sai), tự động tính sản lượng tiêu thụ và lưu lịch sử vào `meter_logs`.
* **Lập & Phát hành Hóa đơn Hàng tháng:** 
  - Tự động tính toán tổng tiền hóa đơn: $\text{Tiền phòng} + \text{Điện} + \text{Nước} + \text{Dịch vụ}$.
  - **Đóng băng biểu giá (`price_snapshot` JSON):** Bảo toàn dữ liệu lịch sử tài chính không bị thay đổi theo thời gian.
  - **Mã VietQR động 24/7:** Tự động sinh QR chứa chính xác số tiền và cú pháp `THANH TOAN HD THANG [M] NAM [Y] [TEN_NHA_TRO] PHONG [SO_PHONG]`.
  - Tự động gửi Email thông báo hóa đơn (`BillCreatedMail`) cho khách thuê.
* **Phân quyền Nhân viên RBAC (Role-Based Access Control):** Chủ trọ tự tạo các Vai trò (`staff_roles`), gán danh mục quyền chi tiết (`rooms.view`, `bills.create`...) và phân công Nhân viên phụ trách từng Tòa nhà cụ thể (`house_staff`).
* **Tiếp nhận & Nghiệm thu Sự cố (Ticketing):** Tiếp nhận sự cố hỏng hóc từ khách thuê, xử lý theo luồng 4 bước (`pending` $\rightarrow$ `in_progress` $\rightarrow$ `resolved` $\rightarrow$ `closed`), tải ảnh nghiệm thu thực tế (`resolved_images`).
* **Báo cáo Doanh thu & Thống kê:** Biểu đồ doanh thu 12 tháng gần nhất, tỷ lệ thu tiền, số nợ tiền nhà và tỷ lệ lấp đầy phòng.

---

### 👤 Phân Hệ Khách Thuê (Tenant Portal)
* **Đăng ký thuê phòng công khai:** Xem ảnh phòng thực tế và gửi yêu cầu thuê phòng trực tuyến.
* **Tra cứu Hợp đồng & Hóa đơn:** Đăng nhập xem hợp đồng thuê, tải PDF Hợp đồng và xem bảng kê phí hàng tháng.
* **Thanh toán VietQR động & Biên lai điện tử:** Quét mã VietQR động bằng App Ngân hàng (hoặc dùng nút *Test chuyển khoản thành công*). Tự động nhận Email **Biên lai điện tử** (`BillPaidMail`) khi hoàn tất thanh toán.
* **Báo cáo Hỏng hóc:** Gửi ticket báo hỏng đính kèm ảnh thực tế và theo dõi tiến độ xử lý nghiệm thu theo thời gian thực.

---

### 👑 Phân Hệ Quản Trị Nền Tảng (Super Admin)
* **Quản lý Gói dịch vụ SaaS:** Mở bán, đóng/mở và cấu hình đơn giá/hạn mức số phòng của các gói SaaS.
* **Quản lý Góp ý & Báo lỗi (Feedbacks):** Tiếp nhận góp ý từ các Chủ trọ và đánh dấu trạng thái xử lý (`processed`).

---

## 🛠 CÔNG NGHỆ (TECH STACK)

* **Backend Framework:** Laravel 11.x (PHP 8.2+)
* **Frontend Framework:** React 18.x + Inertia.js (SPA không cần tạo REST API thủ công)
* **Styling & Icons:** TailwindCSS 3.x + Heroicons + Lucide React
* **Database:** MySQL 8.0+ / MariaDB
* **PDF Rendering:** Barryvdh DomPDF (Xuất hợp đồng PDF chuẩn Unicode Font `DejaVu Sans`)
* **QR Payment API:** VietQR Image API (`img.vietqr.io`)
* **Email System:** Laravel Mailables + Blade Email Templates + Queue Worker

---

## 📋 YÊU CẦU HỆ THỐNG (PREREQUISITES)

Đảm bảo máy tính của bạn đã cài đặt các công cụ sau trước khi bắt đầu:

* **PHP:** `>= 8.2` (Bật các extension: `pdo`, `mbstring`, `openssl`, `curl`, `gd`, `zip`)
* **Composer:** `>= 2.5.x`
* **Node.js:** `>= 18.x` & **NPM:** `>= 9.x`
* **MySQL:** `>= 8.0` (Khuyên dùng Laragon, XAMPP hoặc MySQL Workbench)

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT CHI TIẾT (STEP-BY-STEP INSTALLATION)

### 1️⃣ Bước 1: Clone Repository và Di chuyển vào Thư mục Dự án
```bash
git clone https://github.com/your-username/rental-management.git
cd rental-management
```

### 2️⃣ Bước 2: Cài đặt các Gói Phụ Thuộc (Dependencies)
Cài đặt phụ thuộc Backend PHP:
```bash
composer install
```

Cài đặt phụ thuộc Frontend JavaScript / React:
```bash
npm install
```

### 3️⃣ Bước 3: Cấu hình Tệp Môi trường (`.env`)
Tạo tệp `.env` từ tệp mẫu `.env.example`:
```bash
cp .env.example .env
```

Mở tệp `.env` và cập nhật thông tin Kết nối CSDL & SMTP gửi Email:
```ini
APP_NAME=DreamHouse
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

# Cấu hình Cơ sở dữ liệu MySQL
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=rental_management
DB_USERNAME=root
DB_PASSWORD=

# Cấu hình Gửi Email (Ví dụ dùng Gmail SMTP hoặc Mailtrap)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="no-reply@dreamhouse.vn"
MAIL_FROM_NAME="${APP_NAME}"
```

> ⚠️ **Lưu ý:** Tạo sẵn cơ sở dữ liệu tên `rental_management` trong MySQL (Laragon/XAMPP) trước khi sang bước tiếp theo.

### 4️⃣ Bước 4: Tạo Mã Khóa Ứng Dụng (App Key)
```bash
php artisan key:generate
```

### 5️⃣ Bước 5: Chạy Migration và Tạo Dữ Liệu Mẫu (Seeder)
Khởi tạo toàn bộ cấu trúc bảng CSDL và nạp sẵn tài khoản mẫu:
```bash
php artisan migrate --seed
```

### 6️⃣ Bước 6: Tạo Liên Kết Lưu Trữ Hình Ảnh (Storage Symlink)
Tạo symlink cho phép hiển thị hình ảnh tải lên (ảnh phòng, ảnh sự cố, ảnh góp ý):
```bash
php artisan storage:link
```

---

## 💻 KHỞI CHẠY HỆ THỐNG THỬ NGHIỆM

Mở **3 Cửa sổ Terminal** riêng biệt để chạy đồng thời các dịch vụ sau:

#### Terminal 1: Biên dịch Frontend React thời gian thực (Vite Dev Server)
```bash
npm run dev
```

#### Terminal 2: Chạy Máy chủ Ứng dụng Laravel Backend
```bash
php artisan serve
```

#### Terminal 3: Chạy Hàng chờ Gửi Email Tự động (Queue Worker)
```bash
php artisan queue:work
```

👉 **Truy cập hệ thống tại đường dẫn:** [http://127.0.0.1:8000](http://127.0.0.1:8000)

---

## 🔑 TÀI KHOẢN DỮ LIỆU MẪU (TEST ACCOUNTS)

Sau khi chạy lệnh `php artisan migrate --seed`, bạn có thể đăng nhập bằng các tài khoản mẫu sau:

| Vai trò (Role) | Email Đăng nhập | Mật khẩu | Chức năng chính |
|---|---|---|---|
| **Super Admin** | `admin@dreamhouse.vn` | `12345678` | Quản lý gói cước SaaS, Xem báo cáo nền tảng, Xử lý Feedback |
| **Chủ trọ (Landlord)** | `landlord@dreamhouse.vn` | `12345678` | Quản lý tòa nhà, phòng trọ, lập hợp đồng, hóa đơn, VietQR |
| **Nhân viên (Staff)** | `staff@dreamhouse.vn` | `12345678` | Ghi chỉ số điện nước, lập hóa đơn, tiếp nhận sửa chữa sự cố |
| **Khách thuê (Tenant)** | `tenant@dreamhouse.vn` | `12345678` | Xem hợp đồng PDF, xem hóa đơn, quét VietQR thanh toán, báo sự cố |

---

## ⏰ CÁC LỆNH ARTISAN HỮU ÍCH (UTILITY COMMANDS)

### Chạy tác vụ ngầm quét Gói cước SaaS sắp hết hạn (Cron Job gửi Mail)
Để chạy thử thủ công tác vụ ngầm kiểm tra thời hạn gói cước của Chủ trọ và gửi Email cảnh báo gia hạn:
```bash
php artisan subscriptions:check-expiring
```

### Xóa Cache và Làm mới Hệ thống
Khi thay đổi file cấu hình hoặc route:
```bash
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

---

## 📄 GIẤY PHÉP (LICENSE)
Dự án được phát triển phục vụ mục đích Đồ án / Luận văn Tốt nghiệp ngành Công nghệ Thông tin - Bản quyền thuộc về tác giả đề tài DreamHouse.
