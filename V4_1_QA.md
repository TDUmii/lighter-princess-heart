# Trái tim v4.1 - Xoay 3D và chữ luôn hiển thị

## Thay đổi

- Camera quỹ đạo WebGL2 thực sự xoay từng hạt theo trục Y và X trước phép chiếu phối cảnh.
- Kéo chuột hoặc vuốt một ngón để xem các mặt của khối tim; thả tay có quán tính nhẹ.
- Tự xoay chậm khi không tương tác, có nút tạm dừng/tiếp tục và nút quay về mặt trước.
- Chụm hai ngón để zoom; cuộn chuột để zoom; giữ Shift và kéo khi đã phóng to để pan.
- Chữ **love you** là billboard trên lớp DOM, luôn hướng người xem và không bị che khi quay ra mặt sau.
- Đáy tim ngắn và bo hơn, thân dưới đầy hơn; vỏ/hạt burst và nhịp ~0,90 giây giữ lại.
- Canvas2D fallback có phép quay và chiếu phối cảnh tương ứng.

## QA đã thực hiện

- `npm run check`: đạt.
- `npm test`: 12/12 đạt, gồm kiểm tra camera 360 độ, đối xứng hình học, bo đáy, lớp hạt và billboard.
- Viewport 1200 × 720: WebGL2=true, glError=0; chụp so sánh trước và sau kéo chuột, hình chiếu thay đổi rõ.
- Viewport 390 × 844: WebGL2=true, glError=0; chữ hiển thị ở 100% và 154% sau khi kéo xoay.
- Điều khiển tự xoay: nút chuyển aria-pressed true/false đúng.
- Thử khi vô hiệu WebGL2: Canvas2D fallback=true, chữ vẫn hiện.
- Console browser: 0 lỗi JavaScript.
- Ảnh thử chỉ lưu tại `QA_TEMP/` trên máy, không đưa vào Git.

## Giới hạn

Đây là mô hình hạt ba chiều được lập trình lại lấy cảm hứng từ phim, chưa phải nguồn 3D do đoàn phim cung cấp. Góc nhìn từ cạnh có dạng khối hạt dày, không phải mesh kín. FPS đo trong trình duyệt tự động không đảm bảo tốc độ trên điện thoại thật.
