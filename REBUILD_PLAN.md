# Trái tim - Kế hoạch tái dựng v2

## 1. Đối chiếu nguồn

- Cảnh gốc: *Lighter & Princess / 点燃我，温暖你*, tập 5, hiệu ứng trái tim lập trình của Lý Tuân. Phiên bản video chính thức tập 5-6: https://www.youtube.com/watch?v=5Wmcf-3yevQ
- Khoảng phút 31:43 của tập 5 được dẫn lại tại https://github.com/kanglu/heart
- Phân tích phương trình, rải hạt và chuyển động: https://www.cnblogs.com/crossin/p/16912110.html
- Code dựng mẫu Python tham khảo ý tưởng: https://github.com/Coobiw/reproduce-heart-in-Lighter-and-Princess
- Code mẫu Canvas: https://github.com/VaishnaviNayak2023/Pulsing-Heart-Animation
- Ảnh tham khảo kiểu hạt trên nền đen: https://www.kubear.cn/ae/263.html

Không chép khung hình phim, âm thanh hay mã nguồn của bên thứ ba vào dự án. Dựng hiệu ứng mới từ phương trình và các nguyên tắc đồ họa đã nghiên cứu.

## 2. Tiêu chí thị giác

- Trái tim có hai múi mềm và mũi nhọn; hạt hồng nhỏ, dày, không tạo cột sáng dọc trục giữa.
- Đường viền tổng thể ổn định; hạt phía ngoài bay nhẹ, lấp lánh và thay đổi độ sáng.
- Vùng lõi phía trong đập hai nhịp không làm phồng toàn bộ trái tim.
- Ánh sáng lan ra từ tim: hào quang và tia sáng dạng sương mờ giữa nền trời đêm, có chuyển động rất chậm.
- Không có chữ trên trái tim hoặc nội dung cá nhân; tiêu đề trình duyệt là “Trái tim”.

## 3. Thiết kế kỹ thuật

- `src/art/particles.js`: tạo hạt có seed cố định, rải hạt theo lòng tim, viền và quầng ngoài.
- `src/art/heartbeat.js`: nhịp đập hai đỉnh.
- `src/gpu/shaders.js`: GLSL cho hình nền đêm, tia sáng, hạt sáng và nhịp hạt.
- `src/gpu/renderer.js`: tải hạt một lần lên GPU và hiển thị với WebGL2.
- `src/scene.js`: thời gian, thay đổi kích thước, zoom/chụm, kéo và thích nghi chất lượng.
- `src/fallback.js`: Canvas 2D đơn giản cho trình duyệt không hỗ trợ WebGL2.
- `src/config.js`: màu sắc, mật độ, tia sáng và thông số nhịp.
- `tests/`: kiểm thử hình học, chất lượng và phân phối hạt.

## 4. Mục tiêu hiệu năng và kiểm thử

- Mục tiêu: 60 FPS khi có GPU phù hợp; khoảng 45 FPS hoặc cao hơn trên thiết bị di động phổ biến.
- Điều chỉnh DPR tự động nếu đo khung hình thấp; tránh tải thư viện từ CDN.
- Kiểm thử desktop và viewport điện thoại 390 × 844.
- Xác nhận trình duyệt thực sự chạy WebGL2, không phải fallback.
- Kiểm tra zoom, reset, console, kích thước Canvas và GitHub Pages.
- Ghi nhận rõ khi benchmark dùng giả lập chứ không phải điện thoại thật.

## 5. Phát hành

- GitHub repository: https://github.com/TDUmii/lighter-princess-heart
- Website: https://tdumii.github.io/lighter-princess-heart/
- Đẩy lên `main`, đợi Pages hoàn tất, kiểm tra HTTP 200 và tải đầy đủ file module.
