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
