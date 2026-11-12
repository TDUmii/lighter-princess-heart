# Trái tim

Dựng một trái tim hạt 3D mềm mại lấy cảm hứng từ cảnh Lý Tuân trong phim *Chiếc Bật Lửa và Váy Công Chúa*.

**Website:** https://tdumii.github.io/lighter-princess-heart/

## Phiên bản 4.0

Dựng lại toàn bộ hệ hiệu ứng thay vì sửa tiếp thuật toán cũ. Đám hạt được tổ chức thành ba lớp độc lập:

- **Lõi 3D:** hàng nghìn hạt có tọa độ trước/sau và độ sáng theo chiều sâu; co tròn vào tâm rồi nở ra.
- **Lớp vỏ:** hạt phân bố mềm quanh đường bao, thay đổi độ sáng và co bóp nhẹ theo cùng nhịp, không tạo viền cứng.
- **Hạt bung:** một đợt ngắn bật ra khỏi viền khi tim nở đến gần đỉnh, rồi mờ và biến mất.

Nhịp 0,90 giây được chọn sau khi lấy mẫu các khung hình từ clip phim tham khảo. Ánh sáng hồng nhẹ tỏa từ nền phía sau toàn bộ tim. Khi phóng to, các hạt hiện hình trái tim nhỏ và câu **love you** viết tay xuất hiện ở vùng trung tâm.

Tương thích điện thoại và desktop. Dùng WebGL2 tăng tốc GPU và Canvas2D dự phòng khi thiết bị không hỗ trợ. Có chế độ giảm chuyển động và tự giảm độ phân giải khi tốc độ khung hình thấp.

## Chạy dự án

Không cần thư viện ngoài hoặc quá trình build:

```bash
python -m http.server 8000
```

Mở http://localhost:8000.

## Cấu trúc

```text
src/
  main.js
  v4/
    config.js
    geometry.js
    heartbeat.js
    particles.js
    layers/
      core.js
      shell.js
      burst.js
    shaders.js
    renderer.js
    fallback.js
    scene.js
tests/
  v4.test.js
```

`npm test` chạy kiểm thử hình học, trường 3D, luồng hạt và nhịp. `npm run check` kiểm tra cú pháp.

## Nguồn tham khảo và QA

- [Kế hoạch dựng mới](./V4_BUILD_PLAN.md).
- [Kiểm thử kỹ thuật và đối chiếu hình](./V4_QA.md).
- [Video trái tim trong phim](https://www.bilibili.com/video/BV1Bg411B7md/), đặc biệt đoạn 69–72,2 giây.
- [Bài giải thích tái tạo hiệu ứng](https://www.cnblogs.com/crossin/p/16912110.html).

Đây là chương trình mới lấy cảnh phim làm chuẩn tham khảo, **không phải mã nguồn/hiệu ứng gốc được trích xuất**, và chưa thể khẳng định giống tuyệt đối từng khung hình.

Phiên bản 3.3 được bảo lưu trong lịch sử Git tại tag `v3.3-before-rebuild`.

## Giấy phép

MIT.

## Phiên bản 4.1: góc nhìn 3D

- Kéo chuột hoặc vuốt một ngón để xoay khối tim quanh 360° theo chiều ngang, nghiêng lên/xuống.
- Có chế độ xoay tự động nhẹ, nút tạm dừng/tiếp tục và nút trả về mặt trước.
- Chữ **love you** luôn nhìn thấy khi xoay, không cần zoom sâu.
- Đáy tim được bo và rút ngắn; giữ lõi 3D, vỏ hạt mềm và hạt bắn ra ở đỉnh nhịp.
- Chế độ Canvas2D dự phòng cũng hỗ trợ quay góc nhìn.
- [Báo cáo kiểm thử 4.1](./V4_1_QA.md).