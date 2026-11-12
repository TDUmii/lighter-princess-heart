# Trái tim

Một trái tim **đỏ ruby** kết từ hàng nghìn hạt chuyển động nhẹ trên nền trời đêm, lấy cảm hứng từ cảnh lập trình trong phim *Chiếc Bật Lửa và Váy Công Chúa*.

**Website công khai:** https://tdumii.github.io/lighter-princess-heart/

## Thiết kế

- Hạt đỏ nhỏ, phân bố tự nhiên; đường viền không được vẽ thành một dải hạt đặc.
- Mỗi hạt trôi và nhấp nháy riêng, giữ tổng thể trái tim ổn định.
- Nhịp tim rất nhẹ như hơi thở. Mọi hạt dùng cùng một trường biến dạng liên tục giảm dần ra phía ngoài, **không có ranh giới giữa lõi và vỏ khi đập**.
- Quầng sáng đỏ và chùm tia mềm được vẽ **phía sau toàn bộ khối trái tim**, không phụ thuộc vào các hạt phát sáng đơn lẻ.
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
