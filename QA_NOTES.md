# Kiểm thử phiên bản WebGL2

## Tự động

- `npm test`: 9 bài kiểm thử, 9 đạt.
- `npm run check`: kiểm tra cú pháp JavaScript thành công.
- Render bằng WebGL2 đã được xác nhận; trường hợp không hỗ trợ WebGL2 tự động chuyển sang Canvas 2D.
- Không phát hiện lỗi console trong phiên thử cuối.

## Trình duyệt

- Desktop: quan sát hiệu ứng trái tim, ánh sáng lan ra, hạt bay riêng và nhịp lõi.
- Giả lập viewport điện thoại 390 × 844: WebGL2 chạy, khung Canvas đúng kích thước, zoom từ 100% lên 124% và đặt lại 100%.
- Đo `requestAnimationFrame` trong phiên kiểm thử 3,2 giây: khoảng 60 FPS với cấu hình trình duyệt được thử. Không đại diện cho toàn bộ điện thoại thực tế.

## Bảo vệ hiệu năng

- Hạt được nạp lên GPU một lần; chuyển động tính trong vertex shader.
- Giới hạn pixel ratio di động ở 1.45 và desktop ở 1.8.
- Tự giảm độ phân giải nếu FPS giảm kéo dài.
- Hỗ trợ `prefers-reduced-motion`, tạm dừng khi tab ẩn.

## Kiểm chứng bản công khai

Chỉ đánh dấu hoàn tất khi GitHub Pages báo build thành công, trang và các module WebGL trả HTTP 200, sau đó mở trực tiếp bằng trình duyệt trên URL công khai.

## Cập nhật v2.1
- Kiểm tra ngưỡng nhịp qua kiểm thử trường biến dạng liên tục, bảo đảm không nhảy giữa core/shell.
- Đo viewport giả lập điện thoại 390 × 844, WebGL2 hoạt động và zoom 100% > 124% > 100%.
- Mục tiêu nhịp tự nhiên hơn, ánh sáng đỏ từ nền phía sau và giảm mật độ viền.

## Cập nhật v2.2 - Tim nhỏ, ánh sáng và chữ bí mật
- GPU WebGL2: shader từng hạt tạo hình tim theo phương trình trái tim, chỉ halo rìa giữ dạng đốm sáng.
- Canvas dự phòng: tim nhỏ sử dụng sprite Bézier.
- Chữ love you ẩn ở zoom 100-236%, xuất hiện từ khoảng 245% và rõ khi zoom trên 330%, đồng bộ pan/zoom.
- Kiểm thử giả lập điện thoại 390x844: WebGL2 không lỗi; zoom 100, 124, 154, 191, 236, 293, 364, 450% đúng trạng thái; 12/12 unit tests.
- 60 FPS được đo trên môi trường trình duyệt thử nghiệm, chưa đại diện cho điện thoại thực.

## Phiên bản 3 - QA có ảnh đối chiếu
- Desktop screenshot 1200x637 đo bright mask (R>95, R>1.36 G, R>1.02 B, R>max(G,B)+13): phim 34,4% x 63,0%, bản thử 34,4% x 63,4%.
- Đã kiểm thử trên viewport 390x844: WebGL2=true, glError=0, zoom 450% cho love you xuất hiện, console 0 errors.
- QA_TEMP chỉ lưu ảnh kiểm thử local, không đẩy ảnh chụp phim vào GitHub.
- CLI Antigravity thử trong chế độ kiểm tra độc lập nhưng bị read_file permission/timeout, chưa tạo được báo cáo. Đã hoàn nguyên settings.

## Phiên bản 3.1 - QA nhịp đôi
- Đã lưu 5 khung hình QA local: inward, main, recoil, second, rest; mỗi frame được render ở phase xác định, tránh lệch do chụp video ngẫu nhiên.
- Khung 1200x637: bright bbox width nén=395px, bung chính=434px, dội=396px, bung phụ=420px, nghỉ=405px. Độ nở từ nén tới bung chính ~9,9%.
- Các frame WebGL2 đều render đúng và không ghi nhận lỗi. Đã sửa guard Infinity/NaN cho xung chạm đầu tiên.
- Test thuật toán xác minh negative/positive envelope, tính tuần hoàn, độ liên tục, không còn đường biên riêng giữa lõi/vỏ.

## Phiên bản 3.2 - Kiểm tra lại bằng ảnh phim
- Đã kiểm tra ảnh phim nguồn https://www.beauty321.com/post/51841 và so sánh ảnh screen 1200x637 với bản 3.1.
- Bug desktop 1200x637 dùng 4200 hạt vì so min(width,height)<640, đã sửa thành width<640, sử dụng 14000 hạt.
- Phân bố tim được tinh chỉnh, giảm phần highlight trắng gắt bằng bộ màu trầm vừa và vùng phát quang lớn hơn, thêm depth motion giả lập.
- Với ngưỡng màu R>100, R>1.36G, R>1.02B, R>max(G,B)+13: ảnh nguồn nổi bật ~7,69% pixel, bản thử 3.2 pha nghỉ ~6,68%; ảnh nguồn RGB median [165,80,105], thử nghiệm [179,83,112]. Hai ảnh không phải frame animation tương ứng, chỉ là so sánh thị giác tương đối.
- Nén/bung nhịp chính: mép tim giữ gần ổn định, chiều rộng pixel threshold ~413px -> 421px; vùng trung tâm biến đổi mạnh hơn, không tạo lớp viền cứng.
- Mobile 390x844: WebGL2 glError=0, zoom 450% hiện love you, reset 100% ẩn lại; Canvas fallback hoạt động; FPS ~60 trong giả lập trình duyệt, không phải trên máy thật.
- 14 unit tests pass, syntax pass; QA_TEMP chỉ chứa ảnh nội bộ không đưa phim lên repository.
