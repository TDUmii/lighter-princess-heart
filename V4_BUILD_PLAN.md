# Rebuild Plan - Film-inspired 3D Particle Heart

## Yêu cầu hình ảnh

1. Hình trái tim mềm, cân đối, không bị nghiêng hoặc biến dạng bởi swirl/tangent flow.
2. Khối lõi có độ sâu theo trục Z; nén tròn vào tâm và nở ra đồng bộ.
3. Viền mỏng và mềm, các hạt riêng lẻ vẫn trôi, không có đường ngăn cách giữa core/shell.
4. Tại đỉnh nhịp có một đợt hạt bắn rất ngắn ra ngoài đường viền rồi tan đi.
5. Phối màu hồng đỏ và nền xanh đen, hào quang nhẹ ở phía sau cả khối tim.
6. Khi zoom sâu thấy trái tim mini và chữ `love you`; khi ở 100% chữ ẩn hoàn toàn.
7. Responsive, 60 FPS mục tiêu trên máy có GPU đủ nhanh, tự giảm DPR và hỗ trợ Canvas2D dự phòng.

## Mô hình mới

- Volume points: chọn x/y bên trong hình tim, cho z trải trong tiết diện elipsoid, thay đổi kích thước/độ sáng theo z.
- Shell points: chọn theo chiều dài đường viền, thêm jitter pháp tuyến và tiếp tuyến.
- Burst points: chọn trên đường viền, lưu normal hướng ngoài và độ trễ, phóng ra ở đỉnh nhịp.
- Vertex shader: tính co/bung đối xứng theo tâm; z phồng nhiều hơn khi nở.
- Fragment shader: vẽ điểm sáng nhẹ khi xem bình thường, hiện hình tim mini khi zoom sâu.
- Fullscreen shader: nền trời đêm và quầng sáng mềm phía sau tim.
- Scene: vòng lặp render, zoom/cử chỉ chụm, kéo, giảm chuyển động, quản lý độ phân giải.
- Canvas2D fallback: dựng phiên bản giảm mật độ nhưng giữ cùng logic 3 hệ hạt.

## Đối chiếu cảnh phim

Đoạn video nguồn: https://www.bilibili.com/video/BV1Bg411B7md/

Ảnh tham khảo tại https://www.beauty321.com/post/51841 có khung kích thước 1200 x 637. Lấy mẫu từ clip khoảng 69–72,2s cho chu kỳ gần 0,90s. Mục tiêu dựng trên cùng khung: cân bằng chiều rộng/chiều cao, phân bố sáng và màu hồng trên nền đêm.

Đối chiếu ảnh không thể chứng minh sao chép chính xác nhịp và vật lý 3D; chỉ dùng làm bộ tham chiếu trực quan.

## Triển khai

- Dựng v4 trên nhánh độc lập `rebuild-v4-volume-heart`.
- Bảo lưu v3.3 tại tag `v3.3-before-rebuild`.
- Kiểm thử cấu trúc, shader, khung hình desktop/mobile, zoom, fallback và hiệu năng.
- Sau khi qua QA thì fast-forward lên main và đẩy GitHub Pages.
