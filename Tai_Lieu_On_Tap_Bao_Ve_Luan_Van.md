# TÀI LIỆU ÔN TẬP BẢO VỆ LUẬN VĂN
## Bộ câu hỏi phản biện dự kiến & Gợi ý trả lời (Chuẩn hóa 100% theo Codebase)

**Đề tài:** Xây dựng Hệ thống Quản lý Chuỗi Nhà trọ theo Mô hình SaaS — Hệ thống DreamHouse  
**Sinh viên:** Tống Thới Duy Hùng  
**GVHD:** ThS. Nguyễn Trần Phúc Thịnh  

---

### 📖 Hướng dẫn sử dụng tài liệu
Tài liệu tổng hợp các câu hỏi hội đồng thường đặt ra, được nhóm theo 8 chủ đề bám sát đúng nội dung luận văn và **đã được đối soát chính xác 100% với mã nguồn thực tế (Codebase & CSDL MySQL)**. 
- Mỗi câu trả lời được viết ngắn gọn (3–5 câu) theo cấu trúc: **Nêu luận điểm chính → Dẫn chứng kỹ thuật/code cụ thể → Hướng phát triển (nếu có)**.
- Nên đọc và diễn giải lại bằng lời văn tự nhiên của mình, **không học thuộc lòng máy móc**.

---

## A. Lý do chọn đề tài & Phạm vi ứng dụng

### Hỏi: Vì sao em chọn đề tài quản lý nhà trọ, trong khi thị trường đã có nhiều phần mềm tương tự?
Dạ, xuất phát từ thực trạng phần lớn chủ nhà trọ quy mô vừa và nhỏ ở Việt Nam vẫn quản lý thủ công bằng sổ sách, Excel, Zalo — dẫn tới 4 vấn đề cụ thể em đã khảo sát: thất lạc thông tin hợp đồng, tính hóa đơn điện nước sai sót, xử lý sự cố chậm trễ, và khó đối soát công nợ khi chuyển khoản. Các phần mềm thương mại hiện có thường thu phí cao, không mở, hoặc thiếu tính năng tự động sinh mã VietQR động và mô hình SaaS multi-tenant cho phép một chủ trọ quản lý nhiều tòa nhà — đây là khoảng trống em tập trung giải quyết trong phạm vi luận văn.

### Hỏi: Đối tượng người dùng mục tiêu của hệ thống là ai?
Dạ, hệ thống hướng đến **4 nhóm người dùng chính** bám sát mô hình phân quyền 4 vai trò (RBAC):
1. **Super Admin**: Đơn vị vận hành nền tảng SaaS (quản lý gói cước, duyệt chủ trọ, quản lý hệ thống).
2. **Landlord**: Chủ hộ kinh doanh phòng trọ, chung cư mini, đặc biệt là các chủ sở hữu chuỗi nhiều tòa nhà cần quản lý tập trung.
3. **Staff (Nhân viên)**: Đội ngũ vận hành được Chủ trọ phân công (được phân quyền RBAC chi tiết theo vai trò và phạm vi tòa nhà phụ trách để chốt điện nước, lập hóa đơn, xử lý sự cố...).
4. **Tenant (Khách thuê)**: Người thuê phòng trực tiếp tương tác xem hóa đơn, thanh toán VietQR động và gửi yêu cầu sửa chữa (ticketing).  
*Phạm vi không nhắm tới các khách sạn/chung cư cao cấp có hệ thống ERP riêng.*

### Hỏi: Nếu áp dụng cho chuỗi nhà trọ có hàng trăm phòng, hệ thống có đáp ứng được về mặt hiệu năng không?
Dạ, ở mức luận văn em đã kiểm thử chịu tải bằng JMeter/K6 với khoảng 100 kết nối đồng thời và tối ưu truy vấn bằng Eloquent Eager Loading (`with()`) để tránh vấn đề N+1 query và Queue xử lý bất đồng bộ cho gửi email hàng loạt. Với quy mô hàng trăm phòng thực tế, hệ thống vẫn cần thêm các bước tối ưu ở tầng hạ tầng như Caching (Redis)  và đánh index sâu hơn cho các bảng lớn như `meter_logs`, `bills` — đây là hướng em xác định rõ trong phần Hướng phát triển.

---

## B. Công nghệ & Kiến trúc hệ thống

### Hỏi: Vì sao chọn Laravel làm backend mà không phải Node.js (Express/NestJS) hay Spring Boot?
Dạ, Laravel cung cấp sẵn hệ sinh thái đầy đủ cho một hệ thống quản lý nghiệp vụ: ORM Eloquent giúp phòng chống SQL Injection tự động, hệ thống Middleware & RBAC dựng sẵn để phân quyền 4 vai trò, cơ chế Queue/Schedule (Cron Job) cho việc gửi email và cảnh báo tự động, cùng khả năng tích hợp mượt với InertiaJS. So với việc dựng tay các cơ chế này trên Node.js thuần, Laravel rút ngắn đáng kể thời gian phát triển mà vẫn đảm bảo chuẩn bảo mật, phù hợp với quy mô và thời lượng thực hiện của một luận văn tốt nghiệp.

### Hỏi: InertiaJS là gì và vì sao dùng nó thay vì xây REST API riêng rồi gọi bằng React thuần (SPA cổ điển)?
Dạ, InertiaJS đóng vai trò lớp kết nối giữa Laravel (backend) và React (frontend), cho phép xây dựng trải nghiệm Single Page Application mà không cần thiết kế và duy trì một tầng REST API/JSON độc lập với authentication token riêng. Điều này giúp em tận dụng toàn bộ hệ thống Session, CSRF Protection và Middleware có sẵn của Laravel cho cả giao diện, giảm rủi ro bảo mật khi phải đồng bộ token giữa hai hệ thống tách biệt, đồng thời rút ngắn thời gian phát triển do không phải viết Controller trả JSON và code fetch API ở phía client song song.

### Hỏi: Vì sao chọn MySQL mà không phải PostgreSQL hay MongoDB?
Dạ, dữ liệu nghiệp vụ của hệ thống — hợp đồng, hóa đơn, chỉ số điện nước — có cấu trúc quan hệ rõ ràng và đòi hỏi tính toàn vẹn giao dịch cao (ví dụ một hóa đơn phải nhất quán với chỉ số và hợp đồng liên quan), nên mô hình quan hệ (RDBMS) phù hợp hơn NoSQL như MongoDB. Em chọn MySQL vì đây là hệ quản trị phổ biến, được Laravel hỗ trợ tối ưu qua Eloquent, có cộng đồng lớn và chi phí vận hành thấp, phù hợp cho một hệ thống SaaS ở giai đoạn khởi đầu trước khi cân nhắc PostgreSQL nếu cần các tính năng nâng cao hơn về sau.

### Hỏi: Kiến trúc tổng thể của hệ thống gồm những tầng nào?
Dạ, hệ thống theo kiến trúc 3 tầng cơ bản:
- **Tầng Presentation**: Giao diện React.js render qua InertiaJS, responsive trên desktop và mobile.
- **Tầng Application/Business Logic**: Các Controller, Middleware (`RoleMiddleware`, `PermissionMiddleware`, `CheckUserStatus`) và Service (`BillService.php`) xử lý nghiệp vụ trong Laravel.
- **Tầng Data**: MySQL với 18 bảng nghiệp vụ cốt lõi (20 bảng tính cả bảng hệ thống). Ngoài ra còn tích hợp các dịch vụ ngoài như SMTP gửi email bất đồng bộ và VietQR API Engine để sinh mã thanh toán động.

---

## C. Cơ sở dữ liệu & Multi-tenancy

### Hỏi: Hệ thống áp dụng mô hình multi-tenant nào: Shared Database hay Database-per-tenant?
Dạ, hệ thống áp dụng mô hình Shared Database – Shared Schema: tất cả Chủ trọ dùng chung một cơ sở dữ liệu MySQL và chung một bộ bảng, phân biệt dữ liệu của từng Chủ trọ thông qua khóa ngoại **`user_id`** gắn trên các bảng gốc như **`houses`** (tòa nhà) và **`subscriptions`** (gói cước). Mô hình này giúp tiết kiệm chi phí hạ tầng vận hành so với việc tạo riêng một database cho mỗi Chủ trọ, phù hợp với đối tượng khách hàng vừa và nhỏ mà đề tài hướng tới.

### Hỏi: Làm sao đảm bảo Chủ trọ A không thể xem hoặc thao tác được dữ liệu của Chủ trọ B?
Dạ, mọi truy vấn dữ liệu nghiệp vụ đều được ràng buộc lọc theo chủ sở hữu gắn với tài khoản đang đăng nhập — cụ thể là `user_id` trên các bảng gốc như `houses`/`subscriptions`, còn với tài khoản Nhân viên thì hệ thống dùng cột **`landlord_id`** trên bảng `users` để biết Nhân viên đó thuộc quyền quản lý của Chủ trọ nào. Ngoài ra bảng `house_staff` còn giới hạn phạm vi Nhân viên chỉ trong các tòa nhà được Chủ trọ phân công, được `RoleMiddleware` và `PermissionMiddleware` kiểm tra ở mỗi request. Cơ chế này đã được kiểm thử trong kịch bản KPCN03, xác minh việc cô lập dữ liệu (Tenant Isolation) hoạt động đúng.

### Hỏi: Vì sao thiết kế đến 20 bảng dữ liệu — có thể gộp bớt để đơn giản hơn không?
Dạ, hệ thống có 18 bảng nghiệp vụ cốt lõi (`users`, `houses`, `house_staff`, `rooms`, `services`, `contracts`, `meter_logs`, `bills`, `payments`, `tenant_requests`, `packages`, `subscriptions`, `staff_roles`, `staff_role_permissions`, `room_services`, `reminders`, `feedbacks`, `renter_requests`) cộng thêm 2 bảng hệ thống (`migrations`, `notifications`), tổng cộng 20 bảng — được chuẩn hóa theo dạng chuẩn 3 (3NF) để tránh dư thừa dữ liệu và đảm bảo tính toàn vẹn tham chiếu. Việc gộp bảng có thể giảm số lượng JOIN ở vài trường hợp nhưng sẽ phá vỡ chuẩn 3NF, gây dư thừa dữ liệu và khó mở rộng khi hệ thống có thêm nghiệp vụ mới.

### Hỏi: Cơ chế "đóng băng biểu giá" (Price Snapshot) hoạt động ra sao và giải quyết vấn đề gì?
Dạ, giá phòng cố định được lưu trực tiếp trong hợp đồng (`contracts.monthly_rent`); còn biểu giá dịch vụ điện, nước, internet được đóng băng dưới dạng **cột `price_snapshot` kiểu JSON trong bảng `bills`**, do hàm `createPriceSnapshot()` trong `BillService.php` xử lý ngay tại thời điểm hệ thống sinh hóa đơn hàng tháng (`generateMonthlyBills()`). Nhờ vậy, nếu sau này Chủ trọ có điều chỉnh bảng giá chung ở nhà trọ, các hóa đơn đã phát hành trước đó vẫn giữ nguyên mức giá tại thời điểm tính, tránh tranh chấp và đảm bảo tính minh bạch với khách thuê.

---

## D. Bảo mật hệ thống

### Hỏi: Hệ thống phòng chống những rủi ro bảo mật phổ biến nào?
Dạ, ba nhóm rủi ro chính em xử lý:
1. **SQL Injection**: Được phòng chống mặc định nhờ Eloquent ORM sử dụng prepared statement thay vì nối chuỗi truy vấn thô.
2. **CSRF**: Được chặn nhờ CSRF Token tự động của Laravel gắn kèm mỗi request thay đổi dữ liệu (POST/PUT/DELETE).
3. **XSS**: Được giảm thiểu nhờ cơ chế escape dữ liệu mặc định của ReactJS/Blade khi render nội dung do người dùng nhập.  
*Các cơ chế này đã được xác minh trong kịch bản kiểm thử phi chức năng KPCN03.*

### Hỏi: Mật khẩu người dùng được lưu trữ như thế nào?
Dạ, mật khẩu không bao giờ lưu dạng văn bản thuần mà được mã hóa một chiều bằng thuật toán **Bcrypt** trước khi lưu vào cơ sở dữ liệu — đây là cơ chế mặc định và được khuyến nghị của Laravel, đảm bảo ngay cả khi dữ liệu bị rò rỉ, mật khẩu gốc cũng không thể suy ngược lại được.

### Hỏi: Nếu Khách thuê cố tình gõ thẳng URL trang quản trị của Chủ trọ thì hệ thống xử lý ra sao?
Dạ, mọi route quản trị đều được bọc bởi `RoleMiddleware` và `PermissionMiddleware` kiểm tra vai trò trước khi cho phép truy cập; nếu người dùng không đủ quyền, hệ thống trả về lỗi **403 Forbidden** với giao diện thông báo rõ ràng thay vì để lộ cấu trúc trang hoặc dữ liệu. Đây là một trong 5 cơ chế xử lý ngoại lệ em đã hiện thực và kiểm thử trong Chương 7.

### Hỏi: Điều gì xảy ra khi phiên đăng nhập (session) của người dùng hết hạn giữa lúc đang thao tác?
Dạ, khi Session Token hết hạn, Laravel trả về mã lỗi **HTTP 419 Page Expired**; InertiaJS ở phía client tự động bắt sự kiện này và điều hướng người dùng quay lại trang Đăng nhập kèm thông báo *"Phiên làm việc đã hết hạn, vui lòng đăng nhập lại"*, tránh tình trạng người dùng thao tác vào khoảng trống hoặc nhận lỗi kỹ thuật khó hiểu.

---

## E. Nghiệp vụ trọng tâm (Hóa đơn, VietQR, Phân quyền, Gói cước)

### Hỏi: Cơ chế sinh mã VietQR động hoạt động như thế nào? Có rủi ro số tiền bị chỉnh sửa không?
Dạ, khi hóa đơn được phát hành, hệ thống gọi đến dịch vụ tạo mã VietQR (dạng API ảnh QR chuẩn liên ngân hàng) với tham số gồm số tài khoản, ngân hàng thụ hưởng, đúng số tiền và nội dung chuyển khoản gắn với mã hóa đơn cụ thể — mỗi hóa đơn có một mã QR riêng biệt, không dùng chung một mã tĩnh. Vì việc xác nhận thanh toán hiện tại vẫn do Chủ trọ đối soát thủ công dựa trên nội dung chuyển khoản, rủi ro khách tự ý sửa số tiền khi chuyển khoản vẫn tồn tại ở bước đối soát con người — đây chính là lý do em đề xuất hướng phát triển tích hợp Webhook ngân hàng để xác nhận tự động, chính xác tuyệt đối theo giao dịch thực tế.

### Hỏi: Hệ thống có ràng buộc gì để đảm bảo hóa đơn phát hành luôn có mã VietQR chính xác?
Dạ, hệ thống có ràng buộc an toàn nghiêm ngặt tại cả `BillController.php` và `BillService.php`: Bắt buộc Chủ trọ phải cấu hình đầy đủ thông tin tài khoản ngân hàng nhận tiền (`bank_name`, `account_no`, `account_name`) cho nhà trọ trước khi hệ thống cho phép phát hành hóa đơn. Nếu chưa cấu hình, hệ thống sẽ chặn lệnh và hiển thị cảnh báo tô đỏ yêu cầu cài đặt tài khoản ngân hàng trước.

### Hỏi: Vì sao chưa tích hợp Webhook ngân hàng để tự động gạch nợ ngay trong luận văn này?
Dạ, việc tích hợp Webhook đòi hỏi đăng ký tài khoản doanh nghiệp và hợp tác trực tiếp với ngân hàng hoặc cổng trung gian (như Casso, SePay) để nhận sự kiện giao dịch thời gian thực — đây là một quy trình pháp lý và thương mại nằm ngoài phạm vi kỹ thuật và thời gian thực hiện của một luận văn tốt nghiệp. Em xác định đây là hạn chế cần khắc phục đầu tiên khi đưa sản phẩm ra vận hành thương mại thực tế, và đã thiết kế sẵn cấu trúc hóa đơn với trạng thái `pending`/`paid` để dễ dàng gắn thêm cơ chế xác nhận tự động sau này mà không phải thay đổi CSDL.

### Hỏi: Nếu hai nhân viên cùng ghi chỉ số điện nước cho một phòng trong cùng một tháng thì hệ thống xử lý ra sao?
Dạ, ở tầng CSDL em đặt ràng buộc `UNIQUE(['room_id', 'month', 'year'])` trên bảng `meter_logs`. Tại tầng Backend (`MeterLogController.php`), trước khi lưu, hệ thống chủ động truy vấn `MeterLog::where(...)->first()`. Nếu phát hiện bản ghi đã tồn tại, hệ thống không để CSDL bắn lỗi thô mà trả về thông báo lỗi thân thiện: *"Chỉ số cho tháng/năm này đã tồn tại!"*, hướng dẫn nhân viên chuyển sang giao diện chỉnh sửa thay vì ghi trùng.

### Hỏi: Khi nhân viên ghi chỉ số điện nước hàng loạt, hệ thống có cơ chế nào chống nhập sai không?
Dạ, hệ thống có cơ chế validate ngay tại Backend (`MeterLogController.php`): Trước khi lưu, hệ thống so sánh chỉ số mới với chỉ số tháng trước. Nếu chỉ số điện hoặc nước mới nhỏ hơn chỉ số tháng trước, hệ thống sẽ chặn lưu và xuất thông báo lỗi rõ ràng (ví dụ: *"Phòng 101: Chỉ số điện mới (50 kWh) không được nhỏ hơn chỉ số tháng trước (80 kWh)!"*).

### Hỏi: Điều gì xảy ra khi Nhân viên sửa lại chỉ số điện nước sau khi đã tạo Hóa đơn?
Dạ, trong `MeterLogController.php@update`, nếu chỉ số được cập nhật và hóa đơn tương ứng chưa thanh toán, hệ thống sẽ tự động gọi `BillService::updateBillCosts()` để tính toán lại tiền điện nước và tổng tiền hóa đơn ngay lập tức. Ngược lại, nếu hóa đơn đã ở trạng thái **Đã thanh toán (`paid`)**, hệ thống sẽ **khóa chặn hoàn toàn không cho phép sửa hay xóa chỉ số**, bảo toàn tính toàn vẹn dữ liệu tài chính.

### Hỏi: Khi Chủ trọ dùng hết số phòng theo gói cước hiện tại và cố tạo thêm phòng mới thì sao?
Dạ, việc kiểm tra giới hạn số phòng được thực hiện trực tiếp tại `RoomController.php` — nơi xử lý thao tác tạo phòng — thông qua điều kiện `$user->getCurrentRoomCount() >= $user->getRoomLimit()`, với hai hàm helper này được định nghĩa trong Model `User`. Nếu vượt giới hạn, hệ thống chặn hành động và trả về thông báo yêu cầu Chủ trọ nâng cấp gói cước để tạo thêm phòng — đây cũng là cơ chế giúp mô hình kinh doanh subscription của Super Admin vận hành đúng.

### Hỏi: Quy trình xử lý sự cố (ticketing) của Khách thuê đi qua những trạng thái nào?
Dạ, một yêu cầu sự cố đi qua 4 trạng thái tuần tự trong bảng `tenant_requests`: `pending` (khách gửi yêu cầu kèm ảnh) → `in_progress` (Chủ trọ/Nhân viên tiếp nhận, phân công xử lý) → `resolved` (đã sửa xong, hệ thống gửi email thông báo cho khách) → `closed` (khách xác nhận hài lòng và đóng yêu cầu). Toàn bộ luồng đảm bảo minh bạch tiến độ giữa hai bên thay vì trao đổi rời rạc qua tin nhắn.

### Hỏi: Cơ chế phân quyền chi tiết cho Nhân viên (Staff Roles) hoạt động ra sao?
Dạ, Chủ trọ tạo Vai trò tùy chỉnh (ví dụ Kế toán, Quản lý tòa nhà) và chọn tập quyền cụ thể như `rooms.view`, `bills.create`, `meters.record` — lưu vào bảng `staff_role_permissions`. Sau đó gán vai trò và các tòa nhà phụ trách cho từng Nhân viên qua bảng `house_staff`. Khi Nhân viên đăng nhập, `RoleMiddleware` và `PermissionMiddleware` tự động lọc dữ liệu, chỉ hiển thị đúng tòa nhà và chức năng đã được phân quyền — mô hình RBAC chi tiết theo cả vai trò lẫn phạm vi tòa nhà.

### Hỏi: Sau khi hợp đồng được ký thành công, hệ thống xử lý những gì phía sau?
Dạ, khi hợp đồng chuyển sang trạng thái Active, hệ thống tự động xuất file PDF hợp đồng và gửi kèm qua email cho khách thuê lưu trữ. Đồng thời, nếu phòng đó trước đó có nhiều yêu cầu đăng ký thuê từ các khách khác nhau, hệ thống tự động chuyển các yêu cầu còn lại sang trạng thái "Từ chối" và đưa vào lưu trữ dạng **Soft Delete** (`deleted_at`), vừa làm sạch dữ liệu hiển thị vừa giữ lại lịch sử để tra cứu khi cần.

---

## F. Kiểm thử & Đánh giá chất lượng

### Hỏi: 13 kịch bản thử nghiệm có đủ đại diện cho một hệ thống nhiều module như vậy không?
Dạ, 13 kịch bản được chia làm 2 nhóm: nhóm chức năng (7 kịch bản) bao phủ các luồng nghiệp vụ cốt lõi từ đăng nhập, đăng ký gói SaaS, lập hợp đồng, ghi chỉ số, lập hóa đơn, xử lý sự cố; và nhóm phi chức năng (4 kịch bản KPCN01–04) đánh giá hiệu năng, khả năng chịu tải, an toàn bảo mật và khả năng responsive. Em xác định đây là các luồng nghiệp vụ quan trọng nhất (critical path) chứ chưa phải kiểm thử toàn diện 100% edge-case của toàn hệ thống — với quy mô sản phẩm thực tế, sẽ cần bổ sung kiểm thử tự động (unit test, integration test) theo từng Controller/Service để đạt độ phủ code cao hơn.

### Hỏi: Kiểm thử hiệu năng và khả năng chịu tải được thực hiện cụ thể ra sao, kết quả thế nào?
Dạ, em dùng Google Lighthouse và Chrome DevTools để đo thời gian phản hồi các thao tác thông thường, đạt mục tiêu dưới 500ms; đồng thời dùng Apache JMeter/K6 để mô phỏng khoảng 100 kết nối đồng thời nhằm kiểm tra hệ thống có bị nghẽn hay lỗi timeout hay không. Kết quả cả hai kịch bản đều đạt yêu cầu đề ra, tuy nhiên đây là mức tải thử nghiệm ở quy mô luận văn, chưa phản ánh đầy đủ điều kiện vận hành thực tế với hàng nghìn người dùng đồng thời.

### Hỏi: Hệ thống đã kiểm thử trên những thiết bị/trình duyệt nào?
Dạ, kịch bản KPCN04 kiểm thử giao diện Responsive trên nhiều kích thước màn hình khác nhau — máy tính, máy tính bảng và điện thoại — đảm bảo bố cục không bị vỡ và các thao tác chạm vẫn thuận tiện trên di động, phù hợp với đối tượng người dùng là Khách thuê thường truy cập chủ yếu bằng điện thoại.

---

## G. Hạn chế & Hướng phát triển

### Hỏi: Hạn chế lớn nhất của đề tài là gì và vì sao chưa khắc phục được trong luận văn này?
Dạ, hạn chế lớn nhất là việc đối soát thanh toán vẫn cần thao tác thủ công của Chủ trọ do chưa tích hợp Webhook ngân hàng — nguyên nhân chính là giới hạn thời gian và việc tích hợp đòi hỏi hợp tác thương mại với bên thứ ba, nằm ngoài phạm vi kỹ thuật thuần túy của luận văn. Ngoài ra, việc ghi chỉ số điện nước vẫn thủ công do chưa có điều kiện tiếp cận thiết bị IoT Smart Meter thực tế để tích hợp và kiểm thử trong thời gian làm đề tài.

### Hỏi: Nếu có thêm 3 tháng để phát triển tiếp, em sẽ ưu tiên làm gì trước?
Dạ, em sẽ ưu tiên tích hợp Webhook/API đối soát tự động với một cổng thanh toán trung gian hỗ trợ VietQR (ví dụ Casso hoặc SePay) trước tiên, vì đây là điểm nghẽn ảnh hưởng trực tiếp đến trải nghiệm và độ tin cậy của mô hình kinh doanh SaaS. Sau đó là xây dựng ứng dụng di động cho Khách thuê bằng React Native để tận dụng lại phần lớn logic nghiệp vụ đã có ở Backend Laravel.

---

## H. Câu hỏi mở / Câu hỏi khó thường gặp

### Hỏi: Đóng góp mới (novelty) của đề tài là gì, khi bản chất vẫn là "làm lại" một phần mềm quản lý đã tồn tại?
Dạ, đóng góp của em không nằm ở việc phát minh nghiệp vụ hoàn toàn mới, mà ở việc thiết kế và hiện thực một kiến trúc SaaS multi-tenant hoàn chỉnh, tích hợp gọn cơ chế thanh toán VietQR động theo từng hóa đơn — điều mà nhiều phần mềm quản lý nhà trọ hiện có trên thị trường Việt Nam chưa làm tốt hoặc thu phí rất cao để có. Đây là quá trình vận dụng có hệ thống các kiến thức về thiết kế CSDL chuẩn hóa, kiến trúc phần mềm, và bảo mật vào một bài toán thực tế có giá trị ứng dụng, phù hợp với mục tiêu của một luận văn tốt nghiệp.

### Hỏi: Mô hình kinh doanh subscription (gói cước) có khả thi về mặt thương mại nếu triển khai thực tế không?
Dạ, mô hình định giá theo số lượng phòng quản lý là mô hình phổ biến và đã được kiểm chứng bởi nhiều SaaS quản lý bất động sản trên thế giới, vì chi phí vận hành tăng gần tuyến tính theo số lượng phòng nên định giá theo phòng là hợp lý. Tuy nhiên để thương mại hóa thực tế, cần thêm nghiên cứu thị trường về mức giá cạnh tranh tại Việt Nam và một giai đoạn dùng thử miễn phí (freemium) để thuyết phục chủ trọ chuyển đổi từ thói quen quản lý thủ công — đây là góc độ kinh doanh nằm ngoài phạm vi kỹ thuật của luận văn nhưng em đã cân nhắc khi thiết kế 3 gói cước Cơ Bản/Phổ Thông/Premium.

### Hỏi: Rủi ro lớn nhất khi vận hành hệ thống này trong thực tế là gì?
Dạ, em cho rằng rủi ro lớn nhất nằm ở khâu đối soát thanh toán thủ công — nếu số lượng hóa đơn tăng lên, việc Chủ trọ tự tay xác nhận từng giao dịch dễ dẫn đến sai sót hoặc chậm trễ, ảnh hưởng trải nghiệm Khách thuê. Rủi ro thứ hai là bảo mật dữ liệu multi-tenant khi hệ thống mở rộng quy mô lớn — cần kiểm thử bảo mật (penetration testing) chuyên sâu hơn trước khi đưa vào vận hành thương mại thật, thay vì chỉ dừng ở mức kiểm thử chức năng như trong luận văn.

### Hỏi: Vì sao không dùng một nền tảng SaaS/Low-code có sẵn (như Bubble, Airtable) mà phải tự viết code từ đầu?
Dạ, các nền tảng Low-code phù hợp cho việc dựng nhanh prototype nhưng hạn chế về khả năng tùy biến logic nghiệp vụ phức tạp như tính hóa đơn theo nhiều biểu giá, sinh mã VietQR động theo từng giao dịch, hay phân quyền RBAC chi tiết theo tòa nhà — những yêu cầu đặc thù của bài toán quản lý nhà trọ. Việc tự xây dựng bằng Laravel/React cũng là cơ hội để em vận dụng và chứng minh năng lực về kiến trúc phần mềm, thiết kế CSDL, và bảo mật — đúng với mục tiêu đánh giá của một luận văn tốt nghiệp ngành Công nghệ Thông tin.
