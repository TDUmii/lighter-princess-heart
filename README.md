# Trái tim

Một trái tim **hồng đỏ dịu** kết từ những trái tim nhỏ chuyển động nhẹ trên nền trời đêm, lấy cảm hứng từ cảnh lập trình trong phim *Chiếc Bật Lửa và Váy Công Chúa*.

**Website công khai:** https://tdumii.github.io/lighter-princess-heart/

## Thiết kế

- Trái tim nhỏ, mịn, mật độ dồn nhẹ gần rìa, tâm tối và thoáng; không vẽ thành một dải viền đặc.
- Mỗi hạt trôi và nhấp nháy riêng, giữ tổng thể trái tim ổn định.
- Nhịp đôi mạnh như trong cảnh phim: nén vào, bung ra chính, dội lại, bung phụ rồi hồi phục. Hạt di chuyển ra/vô theo trường biến dạng hướng tâm liên tục, mạnh hơn gần rìa nhưng **không tách viền giữa lõi và vỏ**.
- Quầng sáng đỏ hồng rõ hơn và chùm tia mềm được vẽ **phía sau toàn bộ khối trái tim**, không phụ thuộc vào các hạt phát sáng đơn lẻ.
- Chữ viết tay **“love you”** nằm ẩn ở giữa, chỉ hiện khi phóng to từ khoảng 245%, rõ khi zoom trên 330%.
- Zoom bằng con lăn chuột, chụm hai ngón hoặc nút +/−; kéo khi đang phóng to, chọn 100% để đặt lại.
- WebGL2 giúp GPU tính chuyển động; có Canvas 2D dự phòng và tự động hạ độ phân giải khi cần.

## Chạy trên máy

```bash
python -m http.server 8000
```

Mở http://localhost:8000. Không cần npm install hoặc tải thư viện bên ngoài.

## Cấu trúc

| Tệp | Vai trò |
| --- | --- |
| `src/main.js` | Khởi tạo và điều khiển zoom |
| `src/scene.js` | Thời gian, chuyển động và hiệu năng |
| `src/config.js` | Nhịp tim, màu sắc, mật độ, ánh sáng |
| `src/geometry.js` | Hình học trái tim |
| `src/art/particles.js` | Tạo và phân bố hạt |
| `src/art/deformation.js` | Công thức nhịp mềm cho bộ vẽ dự phòng và kiểm thử |
| `src/art/heartbeat.js` | Nhịp đôi, biên độ nhỏ |
| `src/gpu/shaders.js` | Shader hạt, quầng sáng phía sau và tia sáng |
| `src/gpu/renderer.js` | Vẽ bằng WebGL2 |
| `src/fallback.js` | Canvas 2D khi không dùng được GPU |
| `tests/` | Kiểm thử tự động |

## Kiểm thử

```bash
npm test
npm run check
```

Có thêm [kế hoạch tái dựng](./REBUILD_PLAN.md) và [ghi chú QA](./QA_NOTES.md).

## Giấy phép

MIT. Đây là hiệu ứng được lập trình mới, không sử dụng mã nguồn, video hay âm thanh trích xuất từ phim.

## Phiên bản 3: đối chiếu cảnh phim
- Ảnh đối chiếu trực tiếp: https://www.beauty321.com/post/51841 (ảnh chụp cảnh trái tim lập trình tập 5).
- Tỷ lệ vùng trái tim nổi bật ở khung 1200x637: phim 34,4% ngang / 63,0% cao; bản dựng 34,4% ngang / 63,4% cao.
- 14.000 hạt trên desktop, 4.200 hạt trên thiết bị di động; các tim nhỏ chỉ rõ hình khi phóng to.
- Giảm ánh sáng quầng, bỏ các tia laser dài và để trung tâm tim thoáng.
- Giữ chức năng zoom 450%, kéo để xem, cùng lời nhắn love you ẩn khi chưa phóng to.

## Phiên bản 3.1 - Nhịp đập có độ bật
- Chu kỳ khoảng 1,06 giây, nén vào -2,25%, bung chính +7,5%, dội ngược, bung phụ +3,9% rồi hồi phục.
- Các hạt cùng dùng trường dịch chuyển hướng tâm, tác động từ 46% ở tâm lên 100% gần mép, không chia lớp rời.
- Hào quang phía sau tăng tối đa khoảng 13% theo nhịp chính, không có tia laser kéo ra xa.
- Chạm màn hình sẽ tạo thêm một xung đập tắt dần. Chế độ giảm chuyển động được tôn trọng.
