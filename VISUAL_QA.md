# Đối chiếu hình ảnh với cảnh phim - v3.2

## Mục tiêu

Tái tạo trái tim hạt màu hồng, có cảm giác 3D và đập tự nhiên trong phim *Chiếc Bật Lửa và Váy Công Chúa* (Lighter & Princess), tập 5. Giữ những tùy chỉnh riêng: hạt hình trái tim nhỏ khi zoom và chữ `love you` ẩn tại 100%.

## Nguồn đối chiếu

- Ảnh phim: https://www.beauty321.com/post/51841, mục 編程考試的愛心, ngày 21/11/2022.
- Video YOUKU được gắn tại bài viết: https://www.youtube.com/watch?v=jyVj7u4MsKE. Trình duyệt xác định được video nhưng việc lấy dữ liệu video bị trả lỗi 403, vì thế **chưa thể trích chuỗi frame chính xác của nhịp tim từ video**.
- Không đưa ảnh, video hay âm thanh phim vào thư mục mã nguồn, chỉ dùng để kiểm tra thị giác tại máy.

## Vấn đề được phát hiện ở phiên bản 3.1

1. Màn hình ngang 1200 × 637 bị phân loại là mobile vì điều kiện dùng `min(width, height) < 640`. Số lượng hạt giảm từ 14.000 xuống 4.200; ảnh nhìn thưa và mỏng.
2. Ánh hồng của hạt quá trắng, điểm sáng quá sắc; ảnh phim có hạt sáng mềm và đậm màu hồng hơn.
3. Cảm giác 3D yếu vì mỗi hạt chỉ có độ sâu rất nhỏ, không có chuyển động theo camera.
4. Tim gốc trong ảnh có vùng thân dưới dày hơn, khe giữa hai múi mềm hơn.
5. Nhịp 3.1 cho viền chuyển động mạnh hơn lõi, không đúng mô tả mong muốn của người dùng.

## Những sửa đổi trong phiên bản 3.2

- Quality breakpoint căn cứ vào chiều rộng viewport.
- Điều chỉnh điểm ở khe trên hai múi và độ phân tán đuôi tim.
- Dùng chiều sâu mặt trước/mặt sau tính từ dạng khối gần elipsoid và quay nghiêng nhỏ theo thời gian trong vertex shader.
- Hiệu chỉnh kích thước hạt, độ sáng và thành phần màu của shader, dùng cộng ánh sáng nhẹ thay vì chấm trắng gắt.
- Hàm radial deformation **liên tục**, trọng số giảm từ 1.0 ở tâm xuống khoảng 0.18 gần mép: lõi đập rõ hơn, nhưng đường bao tương đối ổn định.

## Chỉ số ảnh tham khảo (cùng khung 1200 × 637)

Ngưỡng điểm hồng nổi bật dùng cho kiểm tra:

`R > 100 && R > 1.36G && R > 1.02B && R > max(G,B) + 13`.

| Đo | Ảnh phim | Bản 3.1 trước khi sửa chất lượng | Bản thử 3.2 pha nghỉ |
| --- | ---: | ---: | ---: |
| Tỷ lệ điểm hồng | 7,69% | 4–5% tùy pha | 6,68% |
| Trung vị màu RGB điểm nổi bật | 165, 80, 105 | cao hơn và thiên trắng | 179, 83, 112 |
| Số hạt màn hình ngang 1200 × 637 | không xác định | 4.200 (lỗi) | 14.000 |

Dữ liệu này dùng để định hướng thiết kế, **không chứng minh độ giống khung hình tuyệt đối**.

## Kiểm thử kỹ thuật

- `npm test`: 14/14 pass.
- `npm run check`: đạt.
- Desktop WebGL2: frame nén và bung có thay đổi thật ở giữa tim; đường bao thay đổi nhẹ hơn so với 3.1.
- Mobile viewport 390 × 844: WebGL2 glError = 0, chữ bí mật ẩn tại zoom 100%, hiện khi zoom 450%, ẩn lại khi reset.
- Dự phòng Canvas2D: hoạt động.
- Đo qua `requestAnimationFrame` trong trình duyệt giả lập: khoảng 60 FPS. Cần xác minh hiệu năng trên máy điện thoại thật.

## Giới hạn còn lại

- Chưa có chuỗi khung hình video gốc hợp lệ để lấy chính xác waveform, tốc độ hạt và góc chiếu theo thời gian.
- Màu và phân bố sáng của frame phim chịu ảnh hưởng xử lý hậu kỳ, nén ảnh và điều kiện chụp.
- Mục tiêu của bản 3.2 là gần phong cách thị giác phim hơn; không tuyên bố sao chép chính xác 100%.
