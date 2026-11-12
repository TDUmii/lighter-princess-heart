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

- Trái tim có hai múi mềm và mũi nhọn; hạt đỏ ruby nhỏ, thưa hơn, không tạo cột sáng dọc trục giữa.
- Đường viền tổng thể ổn định; hạt phía ngoài bay nhẹ, lấp lánh và thay đổi độ sáng.
- Nhịp đôi biên độ nhỏ tác động thông qua trường biến dạng mượt trên tất cả hạt, giảm dần ra phía ngoài và không tạo đường ranh giữa lõi với vỏ.
- Ánh sáng lan từ phía sau toàn bộ khối tim: hào quang đỏ và chùm tia dạng sương mờ giữa nền trời đêm, không phụ thuộc từng hạt.
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

## Cập nhật v2.1 - Màu đỏ và nhịp liền mạch
- Hạt: 26.000 desktop, 11.000 mobile; chỉ 4% halo và 6% contour, còn lại rải trong lòng tim.
- Màu đỏ ruby từ shader, giảm hẳn bloom từng hạt.
- Loại bỏ nhánh biến dạng theo layer: mọi hạt dùng một trường softBreathWeight liên tục.
- Mờ nền từ ba vùng sau toàn bộ trái tim và những tia sáng đỏ mềm, cường độ thấp.

## Cập nhật v2.2 - Tim nhỏ và thông điệp bí mật
- Dùng công thức ẩn hình trái tim trong fragment shader để vẽ từng tim nhỏ, không thay bằng chấm tròn.
- Chuyển màu đỏ hồng sáng và tăng hào quang/tia sáng phía sau, không tăng sáng hạt đơn lẻ quá mạnh.
- Chữ love you phong cách thư pháp, ẩn mặc định, xuất hiện từ zoom khoảng 245%, rõ ở 330% trở lên.

## Phiên bản 3 - Đo so với ảnh chụp gốc
- Nguồn: https://www.beauty321.com/post/51841 , ảnh tại il.beauty321.com/gallery/articleIMG/month_2211/photo-6374bd9cac549.jpg.
- Tại 1200x637: ảnh phim bbox sáng x=412..824, y=127..527 (34,4% x 63,0%); bản 2.2 quá lớn 71,0% x 88,7%; bản thử v3C 34,4% x 63,4%.
- Bản gốc tỉ lệ điểm hồng đỏ nổi bật 8,1%, bản 2.2 11,9%, bản 3 thử 4,1%. Chủ động giữ v3 thoáng và dịu hơn theo ý người dùng.
- Phát sáng từ nền xanh đen rất tối, không tạo ray dài; rim có độ sáng cao hơn interior nhưng không đập thành hai lớp.
- Tim bé chuẩn phương hướng (nhọn xuống), chỉ nhận ra khi zoom sâu; lời nhắn ẩn ở 100% và xuất hiện tại 450%.
- Antigravity 1.5.1 đã được thử headless read-only, chưa có báo cáo vì lần đầu từ chối read_file và lần hai timeout. Settings quyền được khôi phục.

## v3.1 - Motion / frame choreography
- Các keyframe normalize trong `src/art/heartbeat.js` tạo chuỗi nén -> bung chính -> dội -> bung phụ -> hồi phục trong ~1,06s.
- GPU `src/gpu/shaders.js` và Canvas fallback `src/art/deformation.js` dùng radial weight liên tục từ 0,46 (tâm) tới 1 (rìa) để bảo toàn silhouette, tránh đường phân lớp.
- Ánh sáng nền tăng nhẹ theo positive beat nhưng không tăng mật độ hay kích thước tim bé.
